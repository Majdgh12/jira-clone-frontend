import React, { useEffect, useState } from "react";
import { AdminApi, type AdminSummary } from "../../lib/api/admin";
import { UsersApi, type MeResponse } from "../../lib/api/users";

export function DashboardOverview() {
    const [me, setMe] = useState<MeResponse | null>(null);
    const [summary, setSummary] = useState<AdminSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const meRes = await UsersApi.me();
                setMe(meRes);

                if (meRes.role === "admin") {
                    const s = await AdminApi.getSummary();
                    setSummary(s);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return <p className="text-sm text-gray-500">Loading dashboard...</p>;
    }

    if (error) {
        return <p className="text-sm text-red-600">{error}</p>;
    }

    if (!me) {
        return <p className="text-sm text-gray-500">No user data</p>;
    }

    return (
        <div className="space-y-6">
            {/* Top cards */}
            {summary && me.role === "admin" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow p-4">
                        <p className="text-xs text-gray-500">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {summary.totalUsers}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow p-4">
                        <p className="text-xs text-gray-500">Admins</p>
                        <p className="text-xl font-semibold text-gray-900">
                            {summary.roles.admin}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow p-4">
                        <p className="text-xs text-gray-500">Managers</p>
                        <p className="text-xl font-semibold text-gray-900">
                            {summary.roles.manager}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow p-4">
                        <p className="text-xs text-gray-500">Members</p>
                        <p className="text-xl font-semibold text-gray-900">
                            {summary.roles.member}
                        </p>
                    </div>
                </div>
            )}

            {/* Projects by manager (admin only) */}
            {summary && me.role === "admin" && (
                <div className="bg-white rounded-xl shadow p-4">
                    <h2 className="text-lg font-semibold mb-3">
                        Projects by Manager
                    </h2>
                    <div className="space-y-3">
                        {summary.projects.map((mgr) => (
                            <div
                                key={mgr.manager}
                                className="border border-gray-100 rounded-lg p-3"
                            >
                                <p className="font-medium text-gray-800">
                                    {mgr.manager}{" "}
                                    <span className="text-xs text-gray-500">
                                        ({mgr.projectCount} projects)
                                    </span>
                                </p>

                                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                    {mgr.projects.map((p) => (
                                        <li key={p.name} className="flex justify-between">
                                            <span>{p.name}</span>
                                            <span>
                                                {p.issues} issues · {p.totalTrackedHours}h tracked
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* For non-admins: show a simple message for now */}
            {me.role !== "admin" && (
                <p className="text-sm text-gray-600">
                    Hi <span className="font-semibold">{me.name}</span>, your role is{" "}
                    <span className="font-semibold">{me.role}</span>. We’ll show your
                    project & issue overview here (coming next).
                </p>
            )}
        </div>
    );
}
