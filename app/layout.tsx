import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "WebScanner - Vulnerability Scanner",
  description: "Professional web vulnerability scanning service",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: headers()
  });
  return (
    <html lang="en">
      <body className="antialiased">
          <Navbar session={session} />
          <main className="min-h-screen">{children}</main>
          <Toaster />
      </body>
    </html>
  );
}