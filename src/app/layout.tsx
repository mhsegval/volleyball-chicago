import "./globals.css";
import type { Metadata } from "next";
import { IntroSplash } from "@/components/intro-splash";

export const metadata: Metadata = {
  title: "Volleyball Chicago",
  description: "Weekly Chicago volleyball run",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <IntroSplash />
        <main className="mx-auto min-h-screen w-full max-w-md pb-24">
          {children}
        </main>
      </body>
    </html>
  );
}
