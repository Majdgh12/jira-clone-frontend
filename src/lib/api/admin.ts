import { apiClient } from "./client";

export interface AdminSummary {
  totalUsers: number;
  roles: {
    admin: number;
    manager: number;
    member: number;
  };
  projects: Array<{
    manager: string;
    projectCount: number;
    projects: Array<{
      name: string;
      issues: number;
      totalTrackedHours: number;
    }>;
  }>;
  activeTimers: any[];
  membersProductivity: Array<{
    member: string;
    totalTrackedHours: number;
  }>;
}

export const AdminApi = {
  getSummary: () => apiClient.get<AdminSummary>("/admin/summary"),
};
