import { apiClient } from "./client";

export interface MeResponse {
  id: string;
  email: string;
  role: "admin" | "manager" | "member";
  name: string;
}


export const UsersApi = {
  getAll: () => apiClient.get("/users"), // admin-only but manager can still fetch for assign list
  me: () => apiClient.get<MeResponse>("/users/me"),
};
