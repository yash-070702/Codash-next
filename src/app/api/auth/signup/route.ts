import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import OTP from '@/models/Otp';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, confirmPassword, otp } = await req.json();

    if (!fullName || !email || !password || !confirmPassword || !otp) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: 'Passwords do not match' }, { status: 400 });
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 });
    }

    // Fetch latest OTP for this email
    const latestOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!latestOtp || latestOtp.otp !== otp) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Check if OTP is expired (older than 5 mins)
    const otpAge = Date.now() - new Date(latestOtp.createdAt).getTime();
    if (otpAge > 5 * 60 * 1000) {
      return NextResponse.json({ success: false, message: 'OTP has expired' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${fullName}`,
      hackerRankURL: '',
      leetCodeURL: '',
      codeChefURL: '',
      gfgURL: '',
      codeforcesURL: '',
    });

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        image: newUser.image,
      },
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
