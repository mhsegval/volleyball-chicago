import "./globals.css";
import type { Metadata } from "next";
import { IntroSplash } from "@/components/intro-splash";

export const metadata: Metadata = {
  title: "Volleyball Chicago",
  description: "Weekly Friday volleyball organizer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto min-h-screen w-full max-w-md">{children}</main>
        <footer className="pb-32 text-center text-xs text-slate-400">
          site maintained by Mohammed Segval
        </footer>
      </body>
    </html>
  );
}
