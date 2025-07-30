import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect"; 
import User from "@/models/User";
import mailSender from "@/utils/mailSender";
import bcrypt from "bcryptjs";
import {passwordUpdated} from "@/mail/templates/passwordUpdate"
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing user ID" },
        { status: 401 }
      );
    }

    const { oldPassword, newPassword } = await req.json();

console.log(oldPassword, newPassword);

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Both old and new passwords are required",
        },
        { status: 400 }
      );
    }

    

    // ✅ Fetch user from MongoDB
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "The current password is incorrect",
        },
        { status: 401 }
      );
    }

    // ✅ Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.updatedAt = new Date();

    await user.save();

    // ✅ Send password updated email
    try {
      await mailSender(
        user.email,
        "Password for your Codash account has been updated",
        passwordUpdated(user.email, `Password updated successfully for ${user.fullName}`)
      );
    } catch (mailError: any) {
      console.warn("Failed to send email:", mailError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error: any) {
    console.error("Error changing password:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Error occurred while updating password",
        error: error.message,
      },
      { status: 500 }
    );
  }
}