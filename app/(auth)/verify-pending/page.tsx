"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { resendVerificationEmail } from "@/lib/actions/auth-actions";

export default function VerifyPendingPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get email from URL parameters
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleResend = async () => {
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }

    setLoading(true);
    setMessage("");
    
    const result = await resendVerificationEmail(email);
    
    if (result.status === false) {
      setMessage(result.error || "Failed to send verification email");
    } else {
      setMessage(result.message || "Verification email sent successfully!");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-4 p-6">
        <h1 className="text-2xl font-bold text-center">Verify Your Email</h1>
        
        <p className="text-center text-gray-600">
          We have sent a verification email to <strong>{email}</strong>. 
          Please check your inbox and click the verification link.
        </p>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter your email"
            required
          />
        </div>

        <button
          onClick={handleResend}
          disabled={loading || !email}
          className="w-full bg-blue-500 text-white p-2 rounded-md disabled:opacity-50"
        >
          {loading ? "Sending..." : "Resend Verification Email"}
        </button>

        {message && (
          <p className={`text-sm text-center ${
            message.includes("successfully") ? "text-green-600" : "text-red-600"
          }`}>
            {message}
          </p>
        )}

        <p className="text-sm text-gray-500 text-center">
          Didn&apos;t receive the email? Check your spam folder or request a new verification link.
        </p>
      </div>
    </div>
  );
}