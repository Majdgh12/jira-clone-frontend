import React, { useState } from "react";
import { AuthApi } from "../../lib/api/auth";
import { getPasswordStrength } from "../../lib/auth/passwordStrength";

export function RegisterForm() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [strength, setStrength] = useState<"weak" | "medium" | "strong">("weak");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;

        setForm({ ...form, [name]: value });

        if (name === "password") {
            setStrength(getPasswordStrength(value));
        }
    }

    function validate() {
        if (form.name.trim().length < 3) return "Name must be at least 3 characters";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) return "Invalid email format";

        if (strength === "weak") return "Password is too weak";

        if (form.password !== form.confirmPassword) return "Passwords do not match";

        return null;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");

        const validationError = validate();
        if (validationError) return setError(validationError);

        setLoading(true);
        try {
            await AuthApi.register(form.name, form.email, form.password);

            localStorage.setItem("jira-show-tutorial", "1");

            setSuccess("Account created successfully! Redirecting...");
            setTimeout(() => (window.location.href = "/login"), 1200);
        } catch {
            setError("Registration failed. Email may already be in use.");
        } finally {
            setLoading(false);
        }
    }

    // UI styles based on strength
    const strengthColor =
        strength === "weak"
            ? "bg-red-500 w-1/3"
            : strength === "medium"
                ? "bg-yellow-500 w-2/3"
                : "bg-green-600 w-full";

    const strengthLabel =
        strength === "weak" ? "Weak" : strength === "medium" ? "Medium" : "Strong";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            {success && <p className="text-green-600 text-sm text-center">{success}</p>}

            <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-600"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-600"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-600"
                    required
                />

                {/* Strength bar */}
                {form.password.length > 0 && (
                    <div className="mt-2">
                        <div className="h-2 w-full bg-gray-300 rounded-md overflow-hidden">
                            <div className={`h-full ${strengthColor} transition-all`}></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Password strength: {strengthLabel}</p>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-600"
                    required
                />
            </div>

            <button
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
                {loading ? "Creating account..." : "Register"}
            </button>

            
        </form>
    );
}
