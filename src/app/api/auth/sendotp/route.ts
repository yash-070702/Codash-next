import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Otp from "@/models/Otp";
import otpGenerator from "otp-generator";
import mailSender from "@/utils/mailSender";
import otpTemplate from "@/mail/templates/emailVerificationTemplate";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email } = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "User already exists",
      }, { status: 400 });
    }

    // Generate unique OTP
    let otp: string;
    let existingOtp: boolean;
    do {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
      });

      const existing = await Otp.findOne({ otp });
      existingOtp = !!existing;
    } while (existingOtp);

    // Save OTP in MongoDB
    await Otp.create({
      email,
      otp,
    });

    // Send email
    const htmlBody = otpTemplate(otp);
    await mailSender(email, "CodeHive | OTP Verification", htmlBody);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}
