"use client";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { toast } from "react-toastify";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { logout } from "./authService";


const setToken = useAuthStore.getState().setToken;
const setUser = useProfileStore.getState().setUser;
const setLoading = useProfileStore.getState().setLoading;

export const updateProfile = async (
  token: string,
  formData: any,
  router: AppRouterInstance
) => {
  const toastId = toast.loading("Updating your profile...");
  setLoading(true);

  try {
    if (!token) throw new Error("Authentication required. Please login again.");
    if (!formData || Object.keys(formData).length === 0) throw new Error("No profile data provided.");
    if (!formData._id ) throw new Error("Missing profile identifiers that is id");

    const res = await fetch("/api/user/updateUserDetails", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw {
        response: { status: res.status, data },
        message: data.message || "Profile update failed",
      };
    }

   const updatedUser = data.updatedUserDetails;
const userImage =
  updatedUser.image ||
  `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(
    updatedUser.fullName || "User"
  )}`;
const setUser = useProfileStore.getState().setUser;
setUser({ ...updatedUser, image: userImage });

    toast.update(toastId, {
      render: "Profile updated successfully! 🎉",
      type: "success",
      isLoading: false,
      autoClose: 3000,
    });

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  } catch (error: any) {
    console.error("UPDATE_PROFILE ERROR >>>", error);
    toast.dismiss(toastId);

    let errorMessage = "Could not update profile. Please try again.";

    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || error.response.data?.error;

      switch (status) {
        case 401:
          errorMessage = "Session expired. Please login again.";
          break;
        case 403:
          errorMessage = "You don't have permission to update this profile.";
          break;
        case 409:
          errorMessage = "Profile conflict. Refresh and try again.";
          break;
        case 422:
          errorMessage = "Invalid profile data.";
          break;
        case 500:
          errorMessage = "Server error. Try again later.";
          break;
        default:
          errorMessage = msg || error.message || errorMessage;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);
  }

  setLoading(false);
};

export const updatePassword = async (
  token: string,
  formData: any,              
  router: AppRouterInstance       
) => {
  const toastId = toast.loading("Changing your password...");
  setLoading(true);
  
  console.log(formData);
  try {
    const res = await fetch("/api/user/updatePassword", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw {
        response: { status: res.status, data },
        message: data.message,
      };
    }

    toast.dismiss(toastId);
    toast.success("Password changed successfully. Please log in again.");


    await logout(router);                 
    router.push("/auth");    

  } catch (error: any) {
    toast.dismiss(toastId);
    console.error("CHANGE_PASSWORD ERROR >>>", error);

    let errorMessage = "Failed to change password. Please try again.";

    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || error.response.data?.error;

      switch (status) {
        case 400:
          errorMessage = "Invalid input. Please check all fields.";
          break;
        case 401:
          errorMessage = "Unauthorized. Please log in again.";
          break;
        case 403:
          errorMessage = "Access denied. You're not allowed to perform this.";
          break;
        case 422:
          errorMessage = "Incomplete form. Fill out all fields.";
          break;
        case 429:
          errorMessage = "Too many attempts. Try again later.";
          break;
        case 500:
          errorMessage = "Server error. Try again shortly.";
          break;
        default:
          errorMessage = `${msg}` || "Something went wrong.";
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);
  }

  setLoading(false);
};

export const deleteProfile = async (
  token: string,
  router: AppRouterInstance
) => {
  const toastId = toast.loading("Deleting your profile...");

  setLoading(true);

  try {
    if (!token) throw new Error(" Authentication required. Please login again.");


    const res = await fetch("/api/user/deleteAccount", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw {
        response: { status: res.status, data },
        message: data.message || "Failed to delete profile",
      };
    }

    // Clear Zustand store
    const setUser = useProfileStore.getState().setUser;
    setUser(null);

    toast.update(toastId, {
      render: "Profile deleted successfully! Redirecting...",
      type: "success",
      isLoading: false,
      autoClose: 3000,
    });

    setTimeout(async () => {
      await logout(router);
      router.push("/auth");
    }, 1800);

  } catch (error: any) {
    console.error("DELETE_PROFILE ERROR:", error);

    let errorMessage = "Failed to delete profile. Please try again.";

    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || error.response.data?.error;

      switch (status) {
        case 401:
          errorMessage = "Session expired. Please login again.";
          break;
        case 403:
          errorMessage = "You don't have permission to delete this profile.";
          break;
        case 404:
          errorMessage = "Profile not found.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          errorMessage = msg || error.message || errorMessage;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    toast.update(toastId, {
      render: errorMessage,
      type: "error",
      isLoading: false,
      autoClose: 5000,
    });

    if (error.response?.status === 401) {
      setTimeout(async () => {
        await logout(router);
        router.push("/auth");
      }, 2000);
    }

  } finally {
    setLoading(false);
  }
};

