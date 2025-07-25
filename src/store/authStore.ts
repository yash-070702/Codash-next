import { create } from "zustand";

// Helper: Get token from localStorage
const getTokenFromLocalStorage = (): string | null => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("token");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem("token"); // expired
      return null;
    }
    return parsed.token;
  } catch (error) {
    return null;
  }
};

interface AuthState {
  signupData: any;
  loading: boolean;
  token: string | null;
  setSignupData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  signupData: null,
  loading: false,
  token: getTokenFromLocalStorage(),
  setSignupData: (data) => set({ signupData: data }),
  setLoading: (loading) => set({ loading }),
  setToken: (token) => set({ token }),
}));
