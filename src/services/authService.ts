"use client";

import { toast } from "react-toastify";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const sendOtp = async (
  email: string,
  router: AppRouterInstance,
  setLoading: (value: boolean) => void
) => {
  const toastId = toast.loading("Sending OTP to your email...");
  setLoading(true);

  try {
    const res = await fetch("/api/auth/sendotp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, checkUserPresent: true }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw {
        response: { status: res.status, data },
        message: data.message,
      };
    }

    toast.dismiss(toastId);
    toast.success("OTP sent successfully! Please check your email.");
    router.push("/verify-email");
  } catch (error: any) {
    toast.dismiss(toastId);
    let errorMessage = "Failed to send OTP. Please try again.";

    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || error.response.data?.error;

      switch (status) {
        case 400:
          errorMessage = msg || "Invalid email address.";
          break;
        case 404:
          errorMessage = "Email not found. Please check your email address.";
          break;
        case 409:
          errorMessage =
            "User already exists with this email. Please try logging in.";
          break;
        case 429:
          errorMessage = "Too many requests. Try again later.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          errorMessage = msg || "Something went wrong.";
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);
  }

  setLoading(false);
};
