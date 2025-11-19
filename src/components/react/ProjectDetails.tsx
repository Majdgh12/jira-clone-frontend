import React, { useEffect, useState } from "react";
import { ProjectsApi } from "../../lib/api/projects";
import { IssuesApi } from "../../lib/api/issues";
import { CreateIssueModal } from "./CreateIssueModal";

export function ProjectDetails({ projectId }: { projectId: string }) {
    const [project, setProject] = useState<any>(null);
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    async function load() {
        try {
            const p = await ProjectsApi.getOne(projectId);
            setProject(p);

            const i = await IssuesApi.getByProject(projectId);
            setIssues(i);
        } catch (error) {
            console.error("Failed loading project or issues:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [projectId]);

    if (loading) return <p>Loading...</p>;
    if (!project) return <p>Project not found.</p>;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{project.name}</h1>
                    <p className="text-gray-600">{project.description}</p>

                    <p className="text-sm text-gray-500 mt-1">
                        <span className="font-semibold">Owner:</span>{" "}
                        {project.owner?.name || project.owner?.email || "Unknown"}
                    </p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Create Issue
                </button>
            </div>

            {/* Issues List */}
            <div className="space-y-3">
                {issues.length === 0 ? (
                    <p className="text-gray-500">No issues yet.</p>
                ) : (
                    issues.map((issue) => (
                        <a
                            key={issue._id}
                            href={`/issues/${issue._id}`}
                            className="block p-4 rounded-lg bg-white shadow hover:shadow-md transition"
                        >
                            <h3 className="font-semibold">{issue.title}</h3>
                            <p className="text-sm text-gray-600">{issue.description}</p>

                            <div className="flex gap-4 text-xs text-gray-500 mt-2">
                                <span>Status: {issue.status}</span>
                                <span>Priority: {issue.priority}</span>
                                <span>
                                    Assignee: {issue.assignee?.name || issue.assignee || "N/A"}
                                </span>
                            </div>
                        </a>
                    ))
                )}
            </div>

            {/* Create Issue Modal */}
            {showModal && (
                <CreateIssueModal
                    projectId={projectId}
                    onClose={() => setShowModal(false)}
                    onCreated={load}
                />
            )}
        </div>
    );
}
