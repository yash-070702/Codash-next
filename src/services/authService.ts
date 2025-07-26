"use client";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { toast } from "react-toastify";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {saveUserWithExpiry} from "@/utils/saveUserWithExpiry";
import {saveTokenWithExpiry} from "@/utils/saveTokenWithExpiry";

const setToken = useAuthStore.getState().setToken;
const setUser = useProfileStore.getState().setUser;
const setLoading = useProfileStore.getState().setLoading;

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
      body: JSON.stringify({ email}),
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


export const signUp = async (
  fullName: string,
  userName: string,
  email: string,
  password: string,
  confirmPassword: string,
  otp: string,
  router: AppRouterInstance,
  setLoading: (value: boolean) => void
) => {
  const toastId = toast.loading("Creating your account...");
  setLoading(true);

  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        userName,
        email,
        password,
        confirmPassword,
        otp,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw {
        response: { status: res.status, data },
        message: data.message,
      };
    }

    toast.dismiss(toastId);
    toast.success("🎉 Account created successfully! You can now log in.");
    router.push("/auth");
  } catch (error: any) {
    toast.dismiss(toastId);
    let errorMessage = "Failed to create account. Please try again.";

    if (error.response) {
      const statusCode = error.response.status;
      const serverMessage =
        error.response.data?.message || error.response.data?.error;

      switch (statusCode) {
        case 400:
          if (serverMessage?.toLowerCase().includes("password")) {
            errorMessage = "Password requirements not met. Please check and try again.";
          } else if (serverMessage?.toLowerCase().includes("email")) {
            errorMessage = "Invalid email format. Please check your email address.";
          } else if (serverMessage?.toLowerCase().includes("otp")) {
            errorMessage = "Invalid or expired OTP. Please request a new one.";
          } else if (serverMessage?.toLowerCase().includes("username")) {
            errorMessage = "Username already taken. Please choose a different one.";
          } else {
            errorMessage = serverMessage || "Please check your information and try again.";
          }
          break;
        case 401:
          errorMessage = "Invalid OTP. Please check your email and enter the correct OTP.";
          break;
        case 409:
          errorMessage = "An account with this email already exists. Please try logging in.";
          break;
        case 410:
          errorMessage = "OTP has expired. Please request a new one.";
          break;
        case 422:
          errorMessage = "Please fill in all required fields correctly.";
          break;
        case 429:
          errorMessage = "Too many signup attempts. Please wait and try again later.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          errorMessage = serverMessage || "Something went wrong. Please try again.";
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);

    // Conditional navigation
    if ([401, 410].includes(error.response?.status)) {
      router.push("/verify-email");
    } else if (error.response?.status !== 409) {
      router.push("/auth");
    }
  }

  setLoading(false);
};


export const login=async(
  email: string,
  password: string,
  router: AppRouterInstance
) => {

    const toastId = toast.loading("Logging in...");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
      throw {
        response: { status: response.status, data },
        message: data.message,
      };
    }

      toast.dismiss(toastId);
      toast.success("Login Successful");

      const userImage = data?.user?.image
        ? data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${data.user.firstName} ${data.user.lastName}`;

     setToken(data.token);
      setUser({ ...data.user, image: userImage });

      saveTokenWithExpiry(data.token, 120); // store for 2 hours
      saveUserWithExpiry(data.user, 120);

      router.push("/dashboard");
    } catch (error: any) {
      console.log("LOGIN API ERROR............", error);
      toast.dismiss(toastId);

      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        const status = error.response.status;
        const msg =
          error.response.data?.message || error.response.data?.error;

        switch (status) {
          case 400:
            errorMessage = "Invalid credentials. Please try again.";
            break;
          case 401:
            errorMessage = "Unauthorized. Incorrect email or password.";
            break;
          case 403:
            errorMessage = "Access forbidden.";
            break;
          case 404:
            errorMessage = "User not found.";
            break;
          case 429:
            errorMessage = "Too many requests. Try again later.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = msg || "An error occurred. Please try again.";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }

    setLoading(false);
  };
