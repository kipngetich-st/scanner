"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const email = params.get("email");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid or missing verification link.");
      return;
    }

    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage("✅ Email verified! Redirecting to login...");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "❌ Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("❌ Something went wrong. Try again later.");
      });
  }, [token, email, router]);

  async function handleResend() {
    if (!email) return;
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(data.success ? "📩 Verification email resent!" : data.error);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-2xl bg-white p-8 shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        <p
          className={`mb-6 ${
            status === "loading"
              ? "text-blue-600"
              : status === "success"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>

        {status === "error" && email && (
          <button
            onClick={handleResend}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
          >
            Resend Verification Email
          </button>
        )}
      </div>
    </div>
  );
}
