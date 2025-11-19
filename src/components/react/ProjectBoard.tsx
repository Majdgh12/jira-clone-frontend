import React, { useEffect, useState } from "react";
import { ProjectsApi } from "../../lib/api/projects";
import { IssuesApi } from "../../lib/api/issues";
import { CreateIssueModal } from "./CreateIssueModal";

type Issue = {
    _id: string;
    title: string;
    description?: string;
    status: "open" | "in-progress" | "done";
    priority: "low" | "medium" | "high";
    assignee?: any;
};

const STATUS_COLUMNS: { key: Issue["status"]; label: string }[] = [
    { key: "open", label: "Open" },
    { key: "in-progress", label: "In Progress" },
    { key: "done", label: "Done" },
];

export function ProjectBoard({ projectId }: { projectId: string }) {
    const [project, setProject] = useState<any>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    async function load() {
        setLoading(true);
        setError("");

        try {
            const p = await ProjectsApi.getOne(projectId);
            const i = await IssuesApi.getByProject(projectId);

            setProject(p);
            setIssues(i as Issue[]);
        } catch (err) {
            console.error(err);
            setError("Failed to load project or issues.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, [projectId]);

    async function handleMoveIssue(issueId: string, newStatus: Issue["status"]) {
        // optimistic UI update
        setIssues((prev) =>
            prev.map((iss) =>
                iss._id === issueId ? { ...iss, status: newStatus } : iss
            )
        );

        try {
            await IssuesApi.update(issueId, { status: newStatus });
        } catch (err) {
            console.error("Failed updating issue status", err);
            // reload from server if something went wrong
            void load();
        }
    }

    function onDragStart(id: string) {
        setDraggingId(id);
    }

    function onDragEnd() {
        setDraggingId(null);
    }

    function onDrop(status: Issue["status"]) {
        if (!draggingId) return;
        void handleMoveIssue(draggingId, status);
        setDraggingId(null);
    }

    if (loading) {
        return <p>Loading project...</p>;
    }

    if (!project) {
        return <p>Project not found.</p>;
    }

    // group issues by status
    const grouped: Record<Issue["status"], Issue[]> = {
        open: [],
        "in-progress": [],
        done: [],
    };

    for (const iss of issues) {
        grouped[iss.status]?.push(iss);
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{project.name}</h1>
                    {project.description && (
                        <p className="text-gray-600 mt-1">{project.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                        <span className="font-semibold">Owner:</span>{" "}
                        {project.owner?.name || project.owner?.email || "Unknown"}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >
                        + Create Issue
                    </button>
                </div>
            </div>

            {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                    {error}
                </p>
            )}

            {/* KANBAN BOARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STATUS_COLUMNS.map((col) => (
                    <div
                        key={col.key}
                        className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex flex-col min-h-[280px]"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => onDrop(col.key)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold">{col.label}</h3>
                            <span className="text-xs text-gray-500">
                                {grouped[col.key].length}
                            </span>
                        </div>

                        <div className="flex-1 space-y-2">
                            {grouped[col.key].length === 0 && (
                                <p className="text-xs text-gray-400 italic">
                                    No issues in this column
                                </p>
                            )}

                            {grouped[col.key].map((issue) => (
                                <a
                                    key={issue._id}
                                    href={`/issues/${issue._id}`}
                                    draggable
                                    onDragStart={() => onDragStart(issue._id)}
                                    onDragEnd={onDragEnd}
                                    className={`block rounded-lg bg-white shadow-sm border border-gray-200 px-3 py-2 cursor-grab active:cursor-grabbing transition
                    ${draggingId === issue._id ? "opacity-60" : ""}`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="text-sm font-semibold line-clamp-2">
                                            {issue.title}
                                        </h4>
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide
                        ${issue.priority === "high"
                                                    ? "bg-red-100 text-red-700"
                                                    : issue.priority === "medium"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {issue.priority}
                                        </span>
                                    </div>

                                    {issue.description && (
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {issue.description}
                                        </p>
                                    )}

                                    <div className="flex justify-between items-center mt-2 text-[11px] text-gray-400">
                                        <span>
                                            {issue.assignee?.name ||
                                                issue.assignee?.email ||
                                                "Unassigned"}
                                        </span>
                                        <span>Drag to move</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* CREATE ISSUE MODAL */}
            {showCreateModal && (
                <CreateIssueModal
                    projectId={projectId}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={load}
                />
            )}
        </div>
    );
}
