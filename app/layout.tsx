import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebScanner - Vulnerability Scanner",
  description: "Professional web vulnerability scanning service",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Toaster />
      </body>
    </html>
  );
}