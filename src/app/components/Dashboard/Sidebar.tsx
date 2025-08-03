"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Logo from "../Common/Logo";
import { Activity, Settings, X } from "lucide-react";
import GFG from "@/assets/gfg.png"
import HackerRank from "@/assets/hackerrank.png";
import CodeChef from "@/assets/codechef1.png";
import CodeForces from "@/assets/codeforces.png";
import LeetCode from "@/assets/leetcode.png";
import { MdLogout } from "react-icons/md";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import Link from "next/link";
import { logout } from "@/services/authService";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();

   const handleLogout = async () => {
    try {
      await logout(router);
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
 

  const activeClass =
    "bg-indigo-500 rounded-lg p-3 flex items-center gap-3 text-white";
  const inactiveClass =
    "flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg cursor-pointer text-gray-300";

  const getLinkClass = (href: string) =>
    pathname === href ? activeClass : inactiveClass;

  return (
    <div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-full w-64 bg-gray-800 p-4 transform transition-transform duration-300 ease-in-out z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-8">
          <div onClick={() => router.push("/")}>
            <Logo />
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <nav className="space-y-2">
          <div className="text-sm text-gray-400 mb-4">General</div>
          <Link href="/dashboard" className={getLinkClass("/dashboard")}>
            <div className="w-8 h-8 bg-indigo-400 rounded flex items-center justify-center">
              <span className="text-sm">📊</span>
            </div>
            <span>Overview</span>
          </Link>

          <div className="text-sm text-gray-400 mb-4 mt-6">Platforms</div>

          <Link href="/dashboard/leetcode" className={getLinkClass("/dashboard/leetcode")}>
            <Image src={LeetCode} alt="leetcode" className="w-5 h-5" />
            <span>LeetCode</span>
          </Link>

          <Link href="/dashboard/gfg" className={getLinkClass("/dashboard/gfg")}>
            <Image src={GFG} alt="GFG" className="w-5 h-5" />
            <span>GeeksForGeeks</span>
          </Link>

          <Link href="/dashboard/codechef" className={getLinkClass("/dashboard/codechef")}>
            <Image src={CodeChef} alt="CodeChef" className="w-5 h-5" />
            <span>CodeChef</span>
          </Link>

          <Link href="/dashboard/hackerrank" className={getLinkClass("/dashboard/hackerrank")}>
            <Image src={HackerRank} alt="HackerRank" className="w-5 h-5" />
            <span>HackerRank</span>
          </Link>

          <Link href="/dashboard/codeforces" className={getLinkClass("/dashboard/codeforces")}>
            <Image src={CodeForces} alt="CodeForces" className="w-5 h-5" />
            <span>CodeForces</span>
          </Link>

          <div className="text-sm text-gray-400 mb-4 mt-6">Settings</div>

          <div
            onClick={() => router.push("/edit-profile")}
            className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg cursor-pointer"
          >
            <Settings className="w-5 h-5 text-gray-400" />
            <span>Settings</span>
          </div>

          <div
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg cursor-pointer"
          >
            <MdLogout className="w-5 h-5 text-gray-400" />
            <span>Logout</span>
          </div>
        </nav>
      </div>
    </div>
  );
};


export default Sidebar;
