import { apiClient } from "./client";

export const ProjectsApi = {
  getAll: () => apiClient.get("/projects"),

  getOne: (id: string) => apiClient.get(`/projects/${id}`),

  create: (data: { name: string; description?: string }) =>
    apiClient.post("/projects", data),

  update: (id: string, data: any) => apiClient.put(`/projects/${id}`, data),

  delete: (id: string) => apiClient.del(`/projects/${id}`),
  
  invite: (projectId: string, email: string) =>
    apiClient.post(`/projects/${projectId}/invite`, { email }),

  listMyInvitations: () => apiClient.get(`/projects/invitations/me`),

  acceptInvite: (id: string) =>
    apiClient.post(`/projects/invitations/${id}/accept`),

  rejectInvite: (id: string) =>
    apiClient.post(`/projects/invitations/${id}/reject`),
};
