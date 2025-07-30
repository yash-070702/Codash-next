"use client";

import React, { useState, useEffect } from "react";
import SignupPage from "@/app/components/Auth/SignupPage";
import LoginPage from "@/app/components/Auth/LoginPage";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";

const Auth: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const [isHydrated, setIsHydrated] = useState(false); // ✅ Important
  const [currentPage, setCurrentPage] = useState("signup");

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && token) {
      toast.success("You're already logged in ✨");
      router.replace("/dashboard");
    }
  }, [token, router, isHydrated]);

  if (!isHydrated) return null;       
  if (token) return null;            

  return currentPage === "signup" ? (
    <SignupPage currentPage={currentPage} setCurrentPage={setCurrentPage} />
  ) : (
    <LoginPage currentPage={currentPage} setCurrentPage={setCurrentPage} />
  );
};

export default Auth;
