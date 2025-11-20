import React, { useState } from "react";
import { AuthApi } from "../../lib/api/auth";
import { setToken } from "../../lib/auth/tokenStorage";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await AuthApi.login(email, password);

            // Save token & user
            setToken(res.token);
            localStorage.setItem("jira_user", JSON.stringify(res.user));

            const role = res.user.role;

            // Redirect based on role
            if (role === "admin") {
                window.location.href = "/dashboard";
            } else {
                window.location.href = "/my-projects";
            }

        } catch {
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    }


    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Show error ONLY if it exists */}
            {error && (
                <p className="text-red-600 text-sm text-center font-medium">
                    {error}
                </p>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                    type="email"
                    className="w-full border rounded-md px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                    type="password"
                    className="w-full border rounded-md px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
                {loading ? "Logging in..." : "Login"}
            </button>

            {/* Link to register page */}
            <p className="text-center text-sm text-gray-600 mt-2">
                Don't have an account?
                {" "}
                <a href="/register" className="text-blue-600 hover:underline">
                    Register
                </a>
            </p>
        </form>
    );
}
