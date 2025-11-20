// src/lib/api/ai.ts
import { apiClient } from "./client";

export const AiApi = {
  productivity: () => apiClient.get("/ai/productivity"),
  bottlenecks: () => apiClient.get("/ai/bottlenecks"),
  workload: () => apiClient.get("/ai/workload"),
  forecast: () => apiClient.get("/ai/forecast"),
  riskMap: () => apiClient.get("/ai/risk-map"),
  activity: () => apiClient.get("/ai/activity"),

  // FIXED ROUTE 🔥
  projectSummary: (projectId: string) =>
    apiClient.get(`/ai/project/${projectId}/summary`),
};
