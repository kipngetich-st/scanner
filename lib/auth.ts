import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./models/prisma";
import { nextCookies } from "better-auth/next-js";
import { sendEmail } from "./email";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    session: {
        expiresIn: 60 * 60 * 24 * 7,// 7 days,
        updateAge: 60 * 60 * 24,// 1 day
        freshAge: 60 * 60 * 12, // 12 hours
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60,
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "free",
                input: false,
            },
        },
    },
    emailVerification: {
        enabled: true,
        sendOnSignUp: true,
        expiresIn: 60 * 10,
        sendVerificationEmail: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: 'Verify your email address',
                html: `
                <h2>Email Verification</h2>
                <p>Hello ${user.name || user.email},</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${url}" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Verify Email
                </a>
                <p>Or use this verification code: <strong>${url}</strong></p>
                <p>This link will expire in 10 minutes.</p>
                `,
            })
        },
    },
    plugins: [
        nextCookies(),
    ],
});