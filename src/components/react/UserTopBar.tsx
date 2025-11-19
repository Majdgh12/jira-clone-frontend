import React, { useEffect, useState } from "react";
import { clearToken } from "../../lib/auth/tokenStorage";

interface JiraUser {
  id: string;
  email: string;
  role: "admin" | "manager" | "member";
  name: string;
}

export function UserTopBar() {
  const [user, setUser] = useState<JiraUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("jira_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  function handleLogout() {
    clearToken();
    localStorage.removeItem("jira_user");
    window.location.href = "/login";
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-sm text-gray-500">Logged in as</p>
        <p className="font-semibold text-gray-900">
          {user?.name ?? "Unknown user"}{" "}
          {user && (
            <span className="ml-2 text-xs uppercase bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
              {user.role}
            </span>
          )}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-red-600 hover:text-red-700 font-medium"
      >
        Logout
      </button>
    </div>
  );
}
