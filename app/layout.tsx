import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import dynamic from "next/dynamic";

const AlarmAudio = dynamic(() => import("./AlarmAudio"), { ssr: false });

export const metadata: Metadata = {
  title: "Camel Caravan Weigh Station",
  description: "Manage and monitor cargo weights with style."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AlarmAudio />
        {children}
      </body>
    </html>
  );
}
