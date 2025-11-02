"use server";

import { NextResponse } from "next/server";

export async function validateToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;

  try {
    const response = await fetch("https://api.noteria.app/IsLoggedIn", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        nauth: token,
      },
    });

    if (response.status === 401) {
      return false;
    }

    return response.ok;
  } catch {
    return false;
  }
}

export async function setToken(res: NextResponse, newToken: string) {
  res.cookies.set("token", newToken, {
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 1200,
  });
}
