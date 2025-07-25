"use client";

import { useState } from "react";
import { Eye, EyeOff, User, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Logo from "@/app/components/Common/Logo"; 
import { useAuthStore } from "@/store/authStore";
import { sendOtp } from "@/services/authService";
interface AuthProps {
  currentPage: string;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
}

const SignupPage: React.FC<AuthProps> = ({ currentPage, setCurrentPage }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  type SignupFormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

  const{setSignupData}=useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors},
  } =  useForm<SignupFormData>();

  const password = watch("password");

  const onSubmit = async (data: any) => {
    const { fullName, email, password, confirmPassword } = data;
    const userName = fullName.toLowerCase().replace(/\s+/g, "");

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill out all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords Do Not Match");
      return;
    }

    setIsLoading(true);

    const signupData = {
      fullName,
      userName,
      email,
      password,
      confirmPassword,
    };

    setSignupData(signupData);

    try {
     await sendOtp(email, router, setIsLoading);
      toast.success("OTP sent successfully! Please check your email.");
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
   <div className="min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl h-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] lg:max-h-[calc(100vh-4rem)] rounded-2xl sm:rounded-3xl lg:rounded-4xl border-2 border-white flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex flex-col justify-center p-6 xl:p-8 text-white">
            <div className="mb-6 xl:mb-8">
              <h1 className="text-2xl xl:text-4xl font-bold mb-2">
                Join for free —
              </h1>
              <h2 className="text-3xl xl:text-5xl font-bold mb-4">
                Unleash the coder within. <br />
                <span className="text-blue-300">Track your growth,</span>
                conquer <br />
                your goals.
              </h2>
              <p className="text-purple-100 text-base xl:text-lg mb-6 xl:mb-8 max-w-md">
                Sign up to track, analyze, and improve your coding performance
                across platforms.
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-16 right-16 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-16 left-16 w-20 h-20 bg-purple-400/20 rounded-full blur-lg"></div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="flex-1 flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 p-3 sm:p-4 lg:p-5 pb-2 sm:pb-3">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <div
                onClick={() => router.push("/")}
                  className="flex items-center justify-center mb-4 lg:mb-6 cursor-pointer"
                >
                  <Logo />
                </div>
              </div>
              <nav className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-5 text-xs sm:text-sm">
                <button
               onClick={() => router.push("/")}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentPage("login")}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button className="text-blue-400 border-b-2 border-blue-400 pb-1">
                  Join
                </button>
                <button
                 onClick={() => router.push("/about-us")}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </button>
              </nav>
            </div>
          </div>

          {/* Form Container */}
          <div className="flex-1 flex items-center justify-center p-3 sm:p-4 pt-1 sm:pt-2 overflow-y-auto">
            <div className="w-full max-w-md">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-700/50">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-5 text-center">
                  Create new account.
                </h2>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-3 sm:space-y-4"
                >
                  {/* Full Name Field */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter Your FullName"
                      {...register("fullName", {
                        required: "Full name is required",
                        minLength: {
                          value: 2,
                          message: "Full name must be at least 2 characters",
                        },
                      })}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base ${
                        errors.fullName
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-600 focus:border-blue-500"
                      }`}
                    />
                    <User className="absolute right-3 top-2.5 sm:top-3.5 h-4 w-4 text-gray-400" />
                    {errors.fullName && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="showrovcreation@gmail.com"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base ${
                        errors.email
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-600 focus:border-blue-500"
                      }`}
                    />
                    <Mail className="absolute right-3 top-2.5 sm:top-3.5 h-4 w-4 text-gray-400" />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Your Password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message:
                            "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                        },
                      })}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base ${
                        errors.password
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-600 focus:border-blue-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 sm:top-3.5 h-4 w-4 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                    {errors.password && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base ${
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-600 focus:border-blue-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 sm:top-3.5 h-4 w-4 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium mt-4 sm:mt-5 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                {/* Login Link */}
                <p className="text-center text-gray-400 mt-4 sm:mt-5 text-xs sm:text-sm">
                  Already A Member?{" "}
                  <button
                    onClick={() => setCurrentPage("login")}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
