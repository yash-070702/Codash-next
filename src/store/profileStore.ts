import { create } from "zustand";


const getUserFromLocalStorage = (): any | null => {
  if (typeof window === "undefined") return null; 

  const stored = localStorage.getItem("user");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem("user");
      return null;
    }
    return parsed.user;
  } catch (error) {
    return null;
  }
};


interface ProfileState {
  user: any;
  loading: boolean;
  setUser: (user: any) => void;
  setLoading: (loading: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  user: getUserFromLocalStorage(),
  loading: false,
  setUser: (user) => {
    set({ user });
  },
  setLoading: (loading) => {
    set({ loading });
  },
}));
