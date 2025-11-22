import {NextRequest, NextResponse} from "next/server";
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
            return NextResponse.json({ message: "Invalid JSON Format"}, {status: 400})
        }

        const createdEvent = await Event.create(event);

        return NextResponse.json({message: "Event created successfully", event: createdEvent}, { status: 201 })
    } catch (err) {
        console.log(err);
        return NextResponse.json({ message: "Event creation failed", error: err instanceof Error ? err.message : "unknown" }, { status: 500})
    }
}