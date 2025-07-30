// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";

export async function middleware(req: NextRequest) {

  
 
  return await authMiddleware(req);
}

export const config = {
  matcher: ["/api/user/:path*"],
};