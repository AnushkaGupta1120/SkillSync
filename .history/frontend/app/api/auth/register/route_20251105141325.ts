import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const res = await fetch(`${backendUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Registration failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      message: data.message,
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

  } catch (err) {
    console.error("Registration Proxy Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
