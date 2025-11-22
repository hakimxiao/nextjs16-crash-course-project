import {NextRequest, NextResponse} from "next/server";
import {v2 as cloudinary} from 'cloudinary';
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries())
        } catch (err) {
            return NextResponse.json({message: "Invalid JSON Format"}, {status: 400})
        }

        const file = formData.get("image") as File;
        if (!file) {
            return NextResponse.json({message: "Image file is required"}, {status: 400})
        }
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                resource_type: "image",
                folder: "dev-event"
            }, (error, results) => {
                if (error) return reject(error);

                resolve(results);
            }).end(buffer)
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create(event);

        return NextResponse.json({message: "Event created successfully", event: createdEvent}, {status: 201})
    } catch (err) {
        console.log(err);
        return NextResponse.json({
            message: "Event creation failed",
            error: err instanceof Error ? err.message : "unknown"
        }, {status: 500})
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1});

        return NextResponse.json({message: "Events fetch successfully", events}, {status: 200})
    } catch (err) {
        return NextResponse.json({message: "Event fetching failed", error: err}, {status: 500})
    }
}