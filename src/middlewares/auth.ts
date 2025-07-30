// lib/middleware/auth.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function authMiddleware(req: NextRequest) {

    try {

    const token =
      req.cookies.get("token")?.value ||
      req.headers.get("Authorization")?.replace("Bearer ", "").trim();
     
    console.log("Token:", token);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token Missing" },
        { status: 401 }
      );
    }

    try {
      // 🔍 Verify token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

      //  Optionally pass user info to the request (via headers)

       const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", (payload as any).id); // or email etc.

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while validating the token",
      },
      { status: 500 }
    );
  }
}
