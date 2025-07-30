import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect"; 
import User from "@/models/User"; 

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    // ✅ Get user ID from auth header
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing user ID" },
        { status: 401 }
      );
    }

    // ✅ Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting account:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
