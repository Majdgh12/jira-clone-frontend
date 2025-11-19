import React, { useEffect, useState } from "react";
import { IssuesApi } from "../../lib/api/issues";

export function IssuePage({ issueId }: { issueId: string }) {
    const [issue, setIssue] = useState<any>(null);
    const [me, setMe] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const raw = localStorage.getItem("jira_user");
        if (raw) setMe(JSON.parse(raw));
        load();
    }, []);

    async function load() {
        const data = await IssuesApi.getOne(issueId);
        setIssue(data);
        setLoading(false);
    }

    async function saveUpdate(field: string, value: any) {
        await IssuesApi.update(issueId, { [field]: value });
        load();
    }

    async function toggleTimer() {
        if (issue.isRunning) {
            await IssuesApi.stop(issueId);
        } else {
            await IssuesApi.start(issueId);
        }
        load();
    }

    const canEditFields =
        me?.role === "admin" ||
        me?.role === "manager" ||
        (me?._id === issue?.assignee?._id);

    const canUseTimer =
        me?.role === "manager" || me?._id === issue?.assignee?._id;
    // ❌ Admin CANNOT use timer

    if (loading) return <p>Loading issue...</p>;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow space-y-2">
                <h1 className="text-2xl font-bold">{issue.title}</h1>
                <p className="text-gray-500 text-sm">Issue ID: {issue._id}</p>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-xl shadow space-y-2">
                <h3 className="font-semibold">Description</h3>
                <textarea
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={issue.description}
                    onChange={(e) => saveUpdate("description", e.target.value)}
                    disabled={!canEditFields}
                />
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl shadow space-y-2">
                    <h3 className="font-semibold">Status</h3>
                    <select
                        className="border px-3 py-2 rounded-md w-full"
                        value={issue.status}
                        onChange={(e) => saveUpdate("status", e.target.value)}
                        disabled={!canEditFields}
                    >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                </div>

                <div className="bg-white p-6 rounded-xl shadow space-y-2">
                    <h3 className="font-semibold">Priority</h3>
                    <select
                        className="border px-3 py-2 rounded-md w-full"
                        value={issue.priority}
                        onChange={(e) => saveUpdate("priority", e.target.value)}
                        disabled={!canEditFields}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            {/* Assignee */}
            <div className="bg-white p-6 rounded-xl shadow space-y-2">
                <h3 className="font-semibold">Assignee</h3>
                <input
                    className="border px-3 py-2 rounded-md w-full text-sm"
                    value={issue.assignee?.email}
                    disabled
                />
            </div>

            {/* Time Tracking */}
            <div className="bg-white p-6 rounded-xl shadow flex justify-between items-center">
                <div>
                    <p className="font-semibold">Time Tracked</p>
                    <p className="text-gray-600">
                        {(issue.totalTracked / 60).toFixed(1)} hours
                    </p>
                </div>

                {/* ❌ ADMIN cannot see timer button */}
                {canUseTimer && (
                    <button
                        onClick={toggleTimer}
                        className={`px-4 py-2 rounded-md text-white ${issue.isRunning ? "bg-red-600" : "bg-green-600"
                            }`}
                    >
                        {issue.isRunning ? "Stop" : "Start"}
                    </button>
                )}
            </div>
        </div>
    );
}
