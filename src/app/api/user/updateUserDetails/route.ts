import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect"; 
import User from "@/models/User"; 


export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    // ✅ Get user ID from headers
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing user info" },
        { status: 401 }
      );
    }

    const formData = await req.json();
    const {
      fullName,
      about,
      hackerRankURL,
      leetCodeURL,
      codeChefURL,
      gfgURL,
      codeforcesURL,
    } = formData;

    // ✅ Fetch existing user
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Snapshot of old user details
    const oldUserDetails = {
      fullName: existingUser.fullName,
      about: existingUser.about,
      hackerRankURL: existingUser.hackerRankURL,
      leetCodeURL: existingUser.leetCodeURL,
      codeChefURL: existingUser.codeChefURL,
      gfgURL: existingUser.gfgURL,
      codeforcesURL: existingUser.codeforcesURL,
    };

    // ✅ Apply updates only if provided
    if (fullName !== undefined) existingUser.fullName = fullName.trim();
    if (about !== undefined) existingUser.about = about.trim();
    if (hackerRankURL !== undefined) existingUser.hackerRankURL = hackerRankURL.trim();
    if (leetCodeURL !== undefined) existingUser.leetCodeURL = leetCodeURL.trim();
    if (codeChefURL !== undefined) existingUser.codeChefURL = codeChefURL.trim();
    if (gfgURL !== undefined) existingUser.gfgURL = gfgURL.trim();
    if (codeforcesURL !== undefined) existingUser.codeforcesURL = codeforcesURL.trim();

    existingUser.updatedAt = new Date();

    const updatedUser = await existingUser.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      previousUserDetails: oldUserDetails,
      updatedUserDetails: updatedUser,
    });
  } catch (error: any) {
    console.error("🔥 Error in update profile API:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}