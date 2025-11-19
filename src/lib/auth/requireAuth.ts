import { getToken } from "./tokenStorage";

export function requireAuth() {
  if (typeof window === "undefined") return;

  const token = getToken();
  if (!token) {
    window.location.href = "/login";
  }
}
