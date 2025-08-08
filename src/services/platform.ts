"use client";
import { toast } from "react-toastify";
export const getLeeCodeDetails = async (
  username: string,
  token: string
) => {
  const toastId = toast.loading("Fetching your LeetCode stats...");
  let result = [];

  try {
    if (!token) throw new Error("Authentication required. Please login again.");
    if (!username) throw new Error("No username provided to fetch LeetCode stats.");

    const res = await fetch(`/api/platform/getLeetCodeDetails/${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw {
        response: { status: res.status, data },
        message: data.message || "Failed to fetch LeetCode details",
      };
    }

    result = data;

    toast.update(toastId, {
      render: "LeetCode stats fetched successfully!",
      type: "success",
      isLoading: false,
      autoClose: 3000,
    });
  } catch (error: any) {
    console.error("GET_LEETCODE_DETAILS ERROR >>>", error);
    toast.dismiss(toastId);

    let errorMessage = "Could not fetch LeetCode details. Please try again.";

    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || error.response.data?.error;

      switch (status) {
        case 401:
          errorMessage = "Session expired. Please login again.";
          break;
        case 403:
          errorMessage = "You don't have permission to access this data.";
          break;
        case 404:
          errorMessage = `LeetCode user '${username}' not found.`;
          break;
        case 429:
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 500:
          errorMessage = "Server error. Try again later.";
          break;
        default:
          errorMessage = msg || error.message || errorMessage;
      }
    } else if (error.message) {
      errorMessage = error.message;
    } else if (!navigator.onLine) {
      errorMessage = "No internet connection. Please check your network.";
    }

    toast.error(errorMessage);
  }

  return result;
};

export const getGFGDetails = async (
  username: string,
  token: string
) => {
  const toastId = toast.loading("Fetching your GFG stats...");
  let result = [];

  try {
    if (!token) throw new Error("Authentication required. Please login again.");
    if (!username) throw new Error("No username provided to fetch GFG stats.");

    const res = await fetch(`/api/platform/getGfgDetails/${username}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});
console.log("GFG Details Response:", res);
let data;
try {
  const text = await res.text();
  data = text ? JSON.parse(text) : {};
} catch (e) {
  throw new Error("Invalid JSON response from server.");
}

if (!res.ok || !data.success) {
  throw {
    response: { status: res.status, data },
    message: data.message || "Failed to fetch GFG details",
  };
}

    result = data;

    toast.update(toastId, {
      render: "GFG stats fetched successfully!",
      type: "success",
      isLoading: false,
      autoClose: 3000,
    });
  } catch (error: any) {
    console.error("GET_GFG_DETAILS ERROR >>>", error);
    toast.dismiss(toastId);

    let errorMessage = "Could not fetch GFG details. Please try again.";

    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || error.response.data?.error;

      switch (status) {
        case 401:
          errorMessage = "Session expired. Please login again.";
          break;
        case 403:
          errorMessage = "You don't have permission to access this data.";
          break;
        case 404:
          errorMessage = `GFG user '${username}' not found.`;
          break;
        case 429:
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 500:
          errorMessage = "Server error. Try again later.";
          break;
        default:
          errorMessage = msg || error.message || errorMessage;
      }
    } else if (error.message) {
      errorMessage = error.message;
    } else if (!navigator.onLine) {
      errorMessage = "No internet connection. Please check your network.";
    }

    toast.error(errorMessage);
  }

  return result;
};

export const getCodeChefDetails = async (
  username: string,
  token: string
) => {
  const toastId = toast.loading("Fetching your CodeChef stats...");
  let result = [];

  try {
    if (!token) throw new Error("Authentication required. Please login again.");
    if (!username) throw new Error("No username provided to fetch GFG stats.");

    const res = await fetch(`/api/platform/getCodeChefDetails/${username}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});
console.log("CodeChef Details Response:", res);
let data;
try {
  const text = await res.text();
  data = text ? JSON.parse(text) : {};
} catch (e) {
  throw new Error("Invalid JSON response from server.");
}

if (!res.ok || !data.success) {
  throw {
    response: { status: res.status, data },
    message: data.message || "Failed to fetch GFG details",
  };
}

    result = data;

    toast.update(toastId, {
      render: "CodeChef stats fetched successfully!",
      type: "success",
      isLoading: false,
      autoClose: 3000,
    });
  } catch (error: any) {
    console.error("GET_CODECHEF_DETAILS ERROR >>>", error);
    toast.dismiss(toastId);

    let errorMessage = "Could not fetch CodeChef details. Please try again.";

    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || error.response.data?.error;

      switch (status) {
        case 401:
          errorMessage = "Session expired. Please login again.";
          break;
        case 403:
          errorMessage = "You don't have permission to access this data.";
          break;
        case 404:
          errorMessage = `GFG user '${username}' not found.`;
          break;
        case 429:
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 500:
          errorMessage = "Server error. Try again later.";
          break;
        default:
          errorMessage = msg || error.message || errorMessage;
      }
    } else if (error.message) {
      errorMessage = error.message;
    } else if (!navigator.onLine) {
      errorMessage = "No internet connection. Please check your network.";
    }

    toast.error(errorMessage);
  }

  return result;
};
