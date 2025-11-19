import { apiClient } from "./client";

export const IssuesApi = {
  // FIXED: Correct endpoint for listing issues of a project
  getByProject: (projectId: string) =>
    apiClient.get(`/issues/project/${projectId}`),

  // Works already
  getOne: (id: string) => apiClient.get(`/issues/view/${id}`),

  // Create issue
  create: (payload: any) => apiClient.post(`/issues`, payload),

  // Update issue
  update: (id: string, payload: any) => apiClient.put(`/issues/${id}`, payload),

  // Delete issue
  delete: (id: string) => apiClient.del(`/issues/${id}`),

  // Timer start
  start: (id: string) => apiClient.post(`/issues/${id}/start`),

  // Timer stop
  stop: (id: string) => apiClient.post(`/issues/${id}/stop`),
};
