"use client";

import React, { useState } from "react";
import SignupPage from "@/app/components/Auth/SignupPage";
import LoginPage from "@/app/components/Auth/LoginPage";


const Auth: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("signup");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  return currentPage === "signup" ? (
    <SignupPage currentPage={currentPage} setCurrentPage={setCurrentPage} />
  ) : (
    <LoginPage currentPage={currentPage} setCurrentPage={setCurrentPage} />
  );
};

export default Auth;
