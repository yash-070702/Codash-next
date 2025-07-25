import { NextResponse } from 'next/server';

export async function POST() {
  // Clear the cookie by setting token to empty and expiry to past
  const response = NextResponse.json(
    {
      success: true,
      message: 'Logout Successfully',
    },
    { status: 200 }
  );

  response.headers.set(
    'Set-Cookie',
    'token=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict'
  );

  return response;
}
