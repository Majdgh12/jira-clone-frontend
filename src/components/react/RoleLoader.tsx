import { useEffect, useState } from "react";

declare global {
    interface Window {
        __USER_ROLE__?: "admin" | "manager" | "member";
    }
}

export default function RoleLoader() {
    const [role, setRole] = useState<"admin" | "manager" | "member" | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const token = localStorage.getItem("jira_clone_token");
                if (!token) {
                    console.warn("[RoleLoader] No access_token in localStorage");
                    return;
                }

                const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    console.error("[RoleLoader] /auth/me failed:", res.status);
                    return;
                }

                const data = await res.json();
                console.log("[RoleLoader] /auth/me response:", data);

                // Try to be flexible with API shape:
                const user = (data.user ?? data.data ?? data) as any;
                const detectedRole: "admin" | "manager" | "member" | undefined =
                    user.role ?? user.globalRole ?? user?.roles?.[0];

                if (!detectedRole) {
                    console.warn("[RoleLoader] No role found in /auth/me response");
                    return;
                }

                setRole(detectedRole);
                window.__USER_ROLE__ = detectedRole;
                console.log("[RoleLoader] Role set to:", detectedRole);
            } catch (e) {
                console.error("[RoleLoader] Error fetching user:", e);
            }
        }

        console.log("[RoleLoader] mounted");
        fetchUser();
    }, []);

    return null;
}
