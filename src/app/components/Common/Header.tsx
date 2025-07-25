"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/store/profileStore";

import { CiLogin } from "react-icons/ci";
import { IoIosPersonAdd } from "react-icons/io";
import { LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import {toast} from "react-toastify";
import Logo from "./Logo";

const Header = () => {
  const router = useRouter();
  const {user}=useProfileStore();
 
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleDashboard = () => {
    router.push("/dashboard");
    setIsUserDropdownOpen(false);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

    const handleLogout = () => {
      // logout();
      toast.success("Logged out successfully");
      router.push("/");
    };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isUserDropdownOpen && !target.closest(".user-dropdown")) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div onClick={() => router.push("/")} className="cursor-pointer">
            <Logo />
          </div>

          {!user && (
            <>
              <div className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => router.push("/auth")}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/auth")}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors"
                >
                  Get Started
                </button>
              </div>

              <div className="flex md:hidden items-center space-x-4">
                <button
                  onClick={() => router.push("/auth")}
                  className="text-gray-300 hover:text-white transition-colors text-xl"
                >
                  <CiLogin />
                </button>
                <button
                  onClick={() => router.push("/auth")}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors"
                >
                  <IoIosPersonAdd />
                </button>
              </div>
            </>
          )}

          {user && (
            <div className="relative user-dropdown">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-full p-1 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getUserInitials(user.fullName)
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 min-w-48 bg-slate-800/95 backdrop-blur-lg rounded-lg border border-slate-700/50 shadow-xl py-2">
                  <div className="px-4 py-2 border-b border-slate-700/50">
                    <p className="text-sm font-medium text-white">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <button
                    onClick={handleDashboard}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700/50 transition-colors flex items-center space-x-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700/50 transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
