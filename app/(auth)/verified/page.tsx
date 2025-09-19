import Link from "next/link";

export default function VerifiedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verified!</h1>
        <p className="mb-4">Your email has been successfully verified.</p>
        <Link href="/auth/signin" className="text-blue-500 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}