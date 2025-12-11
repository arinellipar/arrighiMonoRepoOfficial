import axios, { AxiosInstance, AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptor para adicionar token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para tratar erros
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          await SecureStore.deleteItemAsync("auth_token");
          await SecureStore.deleteItemAsync("user_data");
          // Redirecionar para login será tratado pelo estado global
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(email: string, senha: string) {
    const response = await this.api.post("/auth/login", { email, senha });
    return response.data;
  }

  async register(email: string, senha: string, documento: string) {
    const response = await this.api.post("/auth/register", {
      email,
      senha,
      documento,
    });
    return response.data;
  }

  // Profile
  async getProfile() {
    const response = await this.api.get("/clients/profile");
    return response.data;
  }

  async getContracts() {
    const response = await this.api.get("/clients/contracts");
    return response.data;
  }

  // Boletos
  async getBoletos() {
    const response = await this.api.get("/boletos");
    return response.data;
  }

  async getBoletosAbertos() {
    const response = await this.api.get("/boletos/abertos");
    return response.data;
  }

  async getBoletosPagos() {
    const response = await this.api.get("/boletos/pagos");
    return response.data;
  }

  async getBoletosResumo() {
    const response = await this.api.get("/boletos/resumo");
    return response.data;
  }

  async getBoletoById(id: number) {
    const response = await this.api.get(`/boletos/${id}`);
    return response.data;
  }

  // Documents
  async getDocuments() {
    const response = await this.api.get("/documents");
    return response.data;
  }

  async downloadContrato(contratoId: number) {
    const response = await this.api.get(
      `/documents/contrato/${contratoId}/download`
    );
    return response.data;
  }

  // Notifications
  async getNotifications() {
    const response = await this.api.get("/notifications");
    return response.data;
  }

  async registerPushToken(token: string) {
    const response = await this.api.post("/notifications/register-token", {
      token,
    });
    return response.data;
  }
}

export const api = new ApiService();
