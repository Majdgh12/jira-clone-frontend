import React, { useEffect, useState } from "react";

interface IssueCardProps {
    issue: any;
    canManage: boolean;
    currentUserId?: string;
}

function formatSmall(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);

    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

export default function IssueCard({
    issue,
    canManage,
    currentUserId,
}: IssueCardProps) {
    if (!issue) return null;

    const assigneeId =
        typeof issue.assignee === "string"
            ? issue.assignee
            : issue.assignee?._id;

    const canDrag =
        canManage || (currentUserId && assigneeId === currentUserId);

    function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
        if (!canDrag) return;
        e.dataTransfer.setData("issueId", issue._id);
    }

    // minimal timer logic
    const baseSeconds = Math.round((issue.totalTracked || 0) * 60);
    const [seconds, setSeconds] = useState(baseSeconds);

    useEffect(() => {
        setSeconds(baseSeconds);

        if (!issue.isRunning || !issue.startedAt) return;

        const start = new Date(issue.startedAt).getTime();

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - start) / 1000);
            setSeconds(baseSeconds + elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [issue.totalTracked, issue.isRunning, issue.startedAt]);

    return (
        <div
            draggable={canDrag}
            onDragStart={handleDragStart}
            className={`bg-white p-4 rounded-lg shadow border transition
                ${canDrag ? "cursor-grab hover:shadow-md" : "cursor-not-allowed opacity-60"}
            `}
        >
            <p className="font-semibold text-base">{issue.title}</p>

            {issue.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {issue.description}
                </p>
            )}

            {issue.priority && (
                <span
                    className={`inline-block mt-2 px-2 py-1 text-xs rounded 
                    ${issue.priority === "high"
                            ? "bg-red-100 text-red-600"
                            : issue.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-600"
                        }
                `}
                >
                    {issue.priority.toUpperCase()}
                </span>
            )}

            {/* Small time tracker */}
            <p className="text-[11px] text-gray-500 mt-2">
                ⏱ {formatSmall(seconds)}{" "}
                {issue.isRunning && (
                    <span className="text-red-500 animate-pulse">(running)</span>
                )}
            </p>

            <p className="text-xs text-gray-500 mt-1">
                Assigned to: {issue.assignee?.name || "Unassigned"}
            </p>

            {issue.createdAt && (
                <p className="text-[11px] text-gray-400 mt-1">
                    Created: {new Date(issue.createdAt).toLocaleDateString()}
                </p>
            )}
        </div>
    );
}
