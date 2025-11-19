import React from "react";
import IssueCard from "./IssueCard";

interface KanbanColumnProps {
    title: string;
    status: string; // open | in-progress | on_hold | done
    issues?: any[];
    onDrop: (issueId: string, newStatus: string) => void;
    canManage: boolean;
    currentUserId?: string;
}

export default function KanbanColumn({
    title,
    status,
    issues = [],
    onDrop,
    canManage,
    currentUserId,
}: KanbanColumnProps) {
    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        const issueId = e.dataTransfer.getData("issueId");
        if (!issueId) return;

        // ✅ Pass column status → ProjectKanban.moveIssue(issueId, status)
        onDrop(issueId, status);
    }

    const filtered = issues.filter((i) => i && i._id);

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="bg-gray-100 p-4 rounded-xl min-h-[450px] border flex flex-col"
        >
            <h3 className="font-semibold text-lg mb-4">{title}</h3>

            <div className="space-y-3 flex-1">
                {filtered.length === 0 && (
                    <p className="text-gray-400 text-sm italic">No issues</p>
                )}

                {filtered.map((issue) => (
                    <IssueCard
                        key={issue._id}
                        issue={issue}
                        canManage={canManage}
                        currentUserId={currentUserId}
                    />
                ))}
            </div>
        </div>
    );
}
