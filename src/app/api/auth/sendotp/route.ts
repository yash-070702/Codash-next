import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Otp from "@/models/Otp";
import otpGenerator from "otp-generator";
import mailSender from "@/utils/mailSender";
import otpTemplate from "@/mail/templates/emailVerificationTemplate";

export async function POST(req: NextRequest) {
  try {
    // Database connection error handling
    try {
      await dbConnect();
    } catch (dbError: any) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: "Database connection failed. Please try again later.",
          errorType: "DATABASE_CONNECTION_ERROR"
        },
        { status: 503 } // Service Unavailable
      );
    }

    // Request body parsing
    let body: any;
    try {
      body = await req.json();
    } catch (parseError: any) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid request format. Please check your data.",
          errorType: "INVALID_REQUEST_FORMAT"
        },
        { status: 400 }
      );
    }

    const { email } = body;

    // Enhanced email validation
    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Email is required.",
          errorType: "MISSING_EMAIL"
        },
        { status: 400 }
      );
    }

    if (typeof email !== "string") {
      return NextResponse.json(
        { 
          success: false, 
          message: "Email must be a valid string.",
          errorType: "INVALID_EMAIL_TYPE"
        },
        { status: 400 }
      );
    }

    // More comprehensive email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Please enter a valid email address.",
          errorType: "INVALID_EMAIL_FORMAT"
        },
        { status: 400 }
      );
    }

    // Check if user already exists with database error handling
    let existingUser;
    try {
      existingUser = await User.findOne({ email });
    } catch (dbError: any) {
      console.error('Error checking existing user:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: "Unable to verify user information. Please try again.",
          errorType: "DATABASE_QUERY_ERROR"
        },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "An account with this email already exists. Please try logging in instead.",
        errorType: "USER_ALREADY_EXISTS"
      }, { status: 409 }); // Conflict
    }

    // Generate unique OTP with database error handling
    let otp: string;
    let attempts = 0;
    const maxAttempts = 10;

    try {
      do {
        if (attempts >= maxAttempts) {
          throw new Error('Unable to generate unique OTP after multiple attempts');
        }

        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
          digits: true,
        });

        const existing = await Otp.findOne({ otp });
        if (!existing) break;
        
        attempts++;
      } while (attempts < maxAttempts);
    } catch (otpError: any) {
      console.error('Error generating unique OTP:', otpError);
      return NextResponse.json(
        { 
          success: false, 
          message: "Unable to generate verification code. Please try again.",
          errorType: "OTP_GENERATION_ERROR"
        },
        { status: 500 }
      );
    }

    // Save OTP in MongoDB with error handling
    try {
      await Otp.create({
        email,
        otp,
      });
    } catch (dbSaveError: any) {
      console.error('Error saving OTP to database:', dbSaveError);
      return NextResponse.json(
        { 
          success: false, 
          message: "Unable to save verification code. Please try again.",
          errorType: "OTP_SAVE_ERROR"
        },
        { status: 500 }
      );
    }

    // Send email with comprehensive error handling
    try {
      const htmlBody = otpTemplate(otp);
      await mailSender(email, "CodeHive | OTP Verification", htmlBody);
    } catch (emailError: any) {
      console.error('Email sending failed:', emailError);
      
      // Clean up the OTP from database since email failed
      try {
        await Otp.deleteOne({ email, otp });
      } catch (cleanupError: any) {
        console.error('Error cleaning up OTP after email failure:', cleanupError);
      }

      // Different error messages based on email error type
      let errorMessage = "Unable to send verification email. Please try again.";
      let errorType = "EMAIL_SEND_ERROR";

      if (emailError.message?.includes('Invalid email')) {
        errorMessage = "The email address appears to be invalid. Please check and try again.";
        errorType = "INVALID_EMAIL_ADDRESS";
      } else if (emailError.message?.includes('quota') || emailError.message?.includes('limit')) {
        errorMessage = "Email service is temporarily overloaded. Please try again in a few minutes.";
        errorType = "EMAIL_QUOTA_EXCEEDED";
      } else if (emailError.message?.includes('authentication') || emailError.message?.includes('auth')) {
        errorMessage = "Email service configuration error. Please contact support.";
        errorType = "EMAIL_AUTH_ERROR";
      } else if (emailError.message?.includes('network') || emailError.message?.includes('timeout')) {
        errorMessage = "Network error while sending email. Please check your connection and try again.";
        errorType = "EMAIL_NETWORK_ERROR";
      }

      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage,
          errorType: errorType
        },
        { status: 503 } // Service Unavailable
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully to your email.",
      data: {
        email,
        expiresIn: "10 minutes" // You can customize this based on your OTP expiration logic
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Unexpected error in OTP generation:', error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return NextResponse.json({
        success: false,
        message: "Invalid data provided. Please check your input.",
        errorType: "VALIDATION_ERROR"
      }, { status: 400 });
    }

    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return NextResponse.json({
        success: false,
        message: "Database error occurred. Please try again later.",
        errorType: "DATABASE_ERROR"
      }, { status: 500 });
    }

    // Generic server error
    return NextResponse.json({
      success: false,
      message: "An unexpected error occurred. Please try again later.",
      errorType: "INTERNAL_SERVER_ERROR"
    }, { status: 500 });
  }
}
