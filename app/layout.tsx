import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { getSession } from "@/lib/actions/auth-actions";

export const metadata: Metadata = {
  title: "WebScanner - Vulnerability Scanner",
  description: "Professional web vulnerability scanning service",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
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