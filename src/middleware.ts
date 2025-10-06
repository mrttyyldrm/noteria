import { NextResponse, NextRequest } from "next/server";
import { validateToken } from "./lib/auth";

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
        const res = NextResponse.redirect(new URL("/login", req.url));
        return res;
    }

    try {
        const isValidated = await validateToken(token);

        if (isValidated) return NextResponse.next();

        const res = NextResponse.redirect(new URL("/login", req.url));
        return res;
    } catch {
        const res = NextResponse.redirect(new URL("/login", req.url));
        res.cookies.delete("token");
        return res;
    }
}

export const config = {
    matcher: "/dashboard/:path*",
};