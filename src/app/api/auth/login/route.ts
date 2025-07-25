import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface LeanUser {
  email: string;
  password: string;
  _id: string;
  [key: string]: any;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 403 }
      );
    }

    await dbConnect();

  const user = (await User.findOne({ email }).lean()) as unknown as LeanUser;


    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not registered, please signup' },
        { status: 401 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { success: false, message: 'Password is incorrect' },
        { status: 401 }
      );
    }

    const payload = { email: user.email, id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '2h',
    });

    const cookieString = `token=${token}; HttpOnly; Path=/; Max-Age=${
      3 * 24 * 60 * 60
    }; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''} SameSite=Strict`;

    // ✅ Destructure password safely
    const { password: _, ...userData } = user;

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          ...userData,
          updatedAt: new Date().toISOString(),
        },
        message: 'Logged In successfully',
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': cookieString,
        },
      }
    );
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Something went wrong',
      },
      { status: 500 }
    );
  }
}