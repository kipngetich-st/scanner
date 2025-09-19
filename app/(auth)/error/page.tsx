"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Verification Error</h1>
        <p className="mb-4">{message || "An error occurred during verification"}</p>
        <Link href="/auth/signup" className="text-blue-500 hover:underline">
          Try Again
        </Link>
      </div>
    </div>
  );
}