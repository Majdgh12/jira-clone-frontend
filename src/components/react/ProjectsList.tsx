import React, { useEffect, useState } from "react";
import { ProjectsApi } from "../../lib/api/projects";
import { CreateProjectModal } from "./CreateProjectModal";
import { AiApi } from "../../lib/api/ai";

export function ProjectsList() {
    const [projects, setProjects] = useState<any[]>([]);
    const [me, setMe] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    // AI Summary states
    const [aiModal, setAiModal] = useState(false);
    const [aiSummary, setAiSummary] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        const raw = localStorage.getItem("jira_user");
        if (raw) setMe(JSON.parse(raw));
        loadProjects();
    }, []);

    async function loadProjects() {
        const res = await ProjectsApi.getAll();
        setProjects(res as any);
    }

    const canCreate = me?.role === "manager" || me?.role === "admin";

    async function generateSummary(projectId: string) {
        // open popup immediately
        setAiModal(true);
        setAiLoading(true);
        setAiSummary("");

        try {
            const res = await AiApi.projectSummary(projectId);
            setAiSummary(res.summary);
        } catch (err) {
            setAiSummary("❌ AI failed to generate summary.");
        } finally {
            setAiLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Projects</h2>

                {canCreate && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                        Create Project
                    </button>
                )}
            </div>

            {/* Projects grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projects.map((p) => {
                    const rawUser = localStorage.getItem("jira_user");
                    const me = rawUser ? JSON.parse(rawUser) : null;

                    const ownerLabel =
                        typeof p.owner === "string"
                            ? p.owner === me?.id || p.owner === me?._id
                                ? "You"
                                : p.owner
                            : p.owner?.name;

                    return (
                        <div
                            key={p._id}
                            className="bg-white p-4 rounded-xl shadow hover:shadow-md transition flex flex-col justify-between"
                        >
                            <div
                                onClick={() => (window.location.href = `/projects/${p._id}`)}
                                className="cursor-pointer"
                            >
                                <h3 className="text-lg font-semibold">{p.name}</h3>
                                <p className="text-sm text-gray-600">{p.description}</p>

                                <p className="text-xs text-gray-500 mt-2">
                                    <span className="font-semibold">Owner:</span>{" "}
                                    {ownerLabel}
                                </p>
                            </div>

                            {/* AI Summary Button */}
                            <button
                                onClick={() => generateSummary(p._id)}
                                className="mt-4 py-2 px-4 rounded-md bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white text-sm font-medium hover:opacity-90 transition"
                            >
                                AI Summary
                            </button>
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <CreateProjectModal
                    onClose={() => setShowModal(false)}
                    onCreated={loadProjects}
                />
            )}

            {/* AI Summary Modal */}
            {aiModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 w-full max-w-lg rounded-xl shadow-lg">

                        <h2 className="text-xl font-bold mb-3">AI Project Summary</h2>

                        {/* 🔥 Loading State INSIDE Modal */}
                        {aiLoading ? (
                            <div className="flex flex-col items-center py-6 text-center">
                                <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-700 text-lg font-medium">
                                    AI is thinking...
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                {aiSummary}
                            </p>
                        )}

                        <button
                            onClick={() => setAiModal(false)}
                            className="mt-5 w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
