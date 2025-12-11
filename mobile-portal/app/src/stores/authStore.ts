import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { api } from "../services/api";

interface User {
  id: number;
  nome: string;
  email: string;
  documento: string;
  tipoPessoa: "PF" | "PJ";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, senha: string) => Promise<void>;
  register: (email: string, senha: string, documento: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, senha: string) => {
    try {
      const response = await api.login(email, senha);

      await SecureStore.setItemAsync("auth_token", response.token);
      await SecureStore.setItemAsync(
        "user_data",
        JSON.stringify(response.cliente)
      );

      set({
        user: response.cliente,
        token: response.token,
        isAuthenticated: true,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao fazer login");
    }
  },

  register: async (email: string, senha: string, documento: string) => {
    try {
      const response = await api.register(email, senha, documento);

      await SecureStore.setItemAsync("auth_token", response.token);
      await SecureStore.setItemAsync(
        "user_data",
        JSON.stringify(response.cliente)
      );

      set({
        user: response.cliente,
        token: response.token,
        isAuthenticated: true,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao criar conta");
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("auth_token");
    await SecureStore.deleteItemAsync("user_data");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  loadStoredAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      const userData = await SecureStore.getItemAsync("user_data");

      if (token && userData) {
        set({
          token,
          user: JSON.parse(userData),
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Erro ao carregar autenticação:", error);
      set({ isLoading: false });
    }
  },
}));
