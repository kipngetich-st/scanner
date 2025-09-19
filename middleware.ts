import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserById } from "./lib/models/user";

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || !session.user) {
        const response = NextResponse.redirect(new URL("/signin", request.url));
        response.headers.set(
            "Set-Cookie",
            "better-auth.session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
        );
        return response;
    }

    const user = await getUserById(session.user.id)

    if (!user) {
        const response = NextResponse.redirect(new URL("/signin", request.url));
        response.headers.set(
            "Set-Cookie",
            "better-auth.session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
        );
        return response;
    }

    return NextResponse.next();
}

export const config = {
    runtime: "nodejs",
    matcher: ["/dashboard"], // Apply middleware to specific routes
};