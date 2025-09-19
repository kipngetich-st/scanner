"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError } from "better-auth";

export const signUp = async (name: string, email: string, password: string) => {
  try {
    const data = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        callbackURL: "/dashboard",
      },
    });
    return { success: true, data };

  } catch (error) {
    const e = error as APIError;
    if (e.message.includes("Email already exists")) {
      return {
        success: false,
        error: "EMAIL_ALREADY_EXISTS",
        message: "Email already exists! Please log in instead.",
      };
    } else {
      return {
        success: false,
        error: "UNKNOWN_ERROR",
        message: e.message
      };
    }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const data = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
    return { success: true, data };

  } catch (error) {
    const e = error as APIError;
    if (e.message.includes("Email not verified")) {
      return {
        success: false,
        error: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email address",
      };
    } else if (e.message.includes("InvalidCredentials")) {
      return {
        success: false,
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password"
      };
    } else {
      return {
        success: false,
        error: "UNKNOWN_ERROR",
        message: e.message
      };
    }
  }
}

export const signOut = async () => {
  try {
    const result = await auth.api.signOut({ headers: await headers() });
    return result;
  } catch (error) {
    console.error("Sign out error:", error);
    return { error: "Failed to sign out" };
  }
}

export const resendVerificationEmail = async (email: string) => {
  try {
    if (!email) {
      return { status: false, error: "Email is required" };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { status: false, error: "Invalid email format" };
    }

    const result = await auth.api.sendVerificationEmail({
      body: {
        email: email.toLowerCase(),
        callbackURL: "/",
      }
    });

    // Better Auth typically returns { status: boolean }
    if (result.status === false) {
      // Handle different error scenarios
      const errorMessage = "Failed to send verification email. Please try again.";
      return { status: false, error: errorMessage };
    }

    return {
      status: true,
      message: "Verification email sent successfully. Please check your inbox."
    };
  } catch (error) {
    console.error("Resend verification error:", error);
    return { status: false, error: "Failed to resend verification email. Please try again later." };
  }
}