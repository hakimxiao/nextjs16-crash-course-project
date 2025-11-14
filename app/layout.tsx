import type {Metadata} from "next";
import {Schibsted_Grotesk, Martian_Mono} from "next/font/google";
import "./globals.css";
import LightRays from "@/components/LightRays";

const schibstedGrotesk = Schibsted_Grotesk({
    variable: "--font-schibsted-grotesk",
    subsets: ["latin"],
});

const martianMono = Martian_Mono({
    variable: "--font-martian-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "DevEvent",
    description: "Hub untuk setiap Acara pengembang yang Tidak Boleh Anda Lewatkan",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${schibstedGrotesk.variable} ${martianMono.variable} antialiased min-h-screen`}
        >
        <div className="absolute inset-0 top-0 z-[-1] min-h-screen">
            <LightRays
                raysOrigin="top-center-offset"
                raysColor="#5dfeca"
                raysSpeed={1.5}
                lightSpread={0.8}
                rayLength={1.2}
                followMouse={true}
                mouseInfluence={0.02}
                noiseAmount={0.0}
                distortion={0.01}
            />
        </div>

        <main>
            {children}
        </main>
        </body>
        </html>
    );
}
