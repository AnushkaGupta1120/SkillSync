import { create } from 'zustand';
import { authAPI } from './api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profile?: any;
  stats?: any;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  register: (data: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({

  user: null,
  token: null,
  isLoading: false,
  error: null,

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(data);
      const { user, accessToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ also set cookie (Next middleware uses this)
      document.cookie = `accessToken=${accessToken}; path=/;`;

      set({ user, token: accessToken, isLoading: false });

      // ✅ role redirect
      if (user.role === "student") window.location.href = "/Student";
      else if (user.role === "recruiter") window.location.href = "/Dashboard/recruiter";

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Registration failed";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },


  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      const { user, accessToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ also set cookie
      document.cookie = `accessToken=${accessToken}; path=/;`;

      set({ user, token: accessToken, isLoading: false });

      // ✅ role redirect
      if (user.role === "student") {
  window.location.href = "/dashboard/student";
} else if (user.role === "recruiter") {
  window.location.href = "/dashboard/recruiter";
}


    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Login failed";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    // ✅ clear cookie
    document.cookie = "accessToken=; Max-Age=0; path=/;";

    set({ user: null, token: null });
  },

  getCurrentUser: async () => {
    try {
      const response = await authAPI.getCurrentUser();
      set({ user: response.data });
    } catch (error) {
      console.error("Failed to get current user:", error);
    }
  }
}));
