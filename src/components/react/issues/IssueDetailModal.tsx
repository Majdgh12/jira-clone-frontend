import React, { useEffect, useState } from "react";
import { IssuesApi } from "../../../lib/api/issues";

export default function IssueDetailModal({ issueId, onClose }) {
    const [issue, setIssue] = useState<any>(null);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        const res = await IssuesApi.getOne(issueId);
        setIssue(res);
    }

    if (!issue) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl rounded-xl p-6 shadow-xl">

                <h2 className="text-2xl font-bold mb-2">{issue.title}</h2>

                <p className="text-gray-700 mb-4">{issue.description}</p>

                <div className="mb-4 space-y-2">
                    <p><b>Status:</b> {issue.status}</p>
                    <p><b>Priority:</b> {issue.priority}</p>
                    <p><b>Assignee:</b> {issue.assignee?.name || "Unassigned"}</p>
                    <p><b>Time Estimate:</b> {issue.timeEstimate || "Not set"}</p>
                    <p><b>Time Spent:</b> {issue.timeSpent || "0h"}</p>
                </div>

                <button
                    className="w-full mt-4 bg-blue-600 text-white py-2 rounded"
                    onClick={onClose}
                >
                    Close
                </button>

            </div>
        </div>
    );
}
