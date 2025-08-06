"use client";

import React, { useState, useEffect } from "react";
import SignupPage from "@/app/components/Auth/SignupPage";
import LoginPage from "@/app/components/Auth/LoginPage";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";


const Auth: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  
  const [currentPage, setCurrentPage] = useState("signup");
           

  return currentPage === "signup" ? (
    <SignupPage currentPage={currentPage} setCurrentPage={setCurrentPage} />
  ) : (
    <LoginPage currentPage={currentPage} setCurrentPage={setCurrentPage} />
  );
};

export default Auth;
