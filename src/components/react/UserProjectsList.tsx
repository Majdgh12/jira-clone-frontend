import React, { useEffect, useState } from "react";
import { AiApi } from "../../lib/api/ai";
import { CreateProjectModal } from "./CreateProjectModal";

export default function UserProjectsList() {
    const [myProjects, setMyProjects] = useState([]);
    const [joinedProjects, setJoinedProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);

    // AI Summary
    const [aiModal, setAiModal] = useState(false);
    const [aiSummary, setAiSummary] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    function getOwnerId(p) {
        if (!p.owner) return null;
        if (typeof p.owner === "string") return p.owner;
        return p.owner._id || p.owner.id;
    }

    // Load user & projects
    useEffect(() => {
        if (typeof window === "undefined") return;

        const u = JSON.parse(localStorage.getItem("jira_user") || "{}");
        setUser(u);
        setUserId(u._id || u.id);

        async function loadProjects() {
            const token = localStorage.getItem("jira_clone_token");

            const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });

            const data = await res.json();
            const all = Array.isArray(data) ? data : data.data || [];

            const meId = u._id || u.id;

            // FIXED — owner detection
            function ownerId(p) {
                if (!p.owner) return null;
                if (typeof p.owner === "string") return p.owner;
                return p.owner._id || p.owner.id;
            }

            // FIXED — project where I am the owner
            const owned = all.filter((p) => ownerId(p) === meId);

            // FIXED — project where I am in members list
            const joined = all.filter(
                (p) => p.members?.some((m) => m._id === meId || m.id === meId)
            );

            setMyProjects(owned);
            setJoinedProjects(joined);
        }

        loadProjects();
    }, []);

    const canCreate =
        user?.role === "manager" || user?.role === "member";

    async function generateSummary(projectId: string) {
        setAiModal(true);
        setAiLoading(true);
        setAiSummary("");

        try {
            const res = await AiApi.projectSummary(projectId);
            setAiSummary(res.summary);
        } catch {
            setAiSummary("❌ AI failed to generate summary.");
        } finally {
            setAiLoading(false);
        }
    }

    if (!user) return <p>Loading...</p>;

    return (
        <div className="space-y-10">
            {/* Create Project Button */}
            <div className="flex justify-end">
                {canCreate && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                        Create Project
                    </button>
                )}
            </div>

            {/* My Projects */}
            <section>
                <h2 className="text-xl font-semibold mb-3">My Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {myProjects.map((p) => (
                        <div
                            key={p._id}
                            className="p-4 bg-white border rounded-lg shadow hover:shadow-md transition"
                        >
                            <div
                                onClick={() => (window.location.href = `/my-projects/${p._id}`)}
                                className="cursor-pointer"
                            >
                                <h3 className="font-semibold text-lg">{p.name}</h3>
                                <p className="text-sm text-gray-600">{p.description}</p>
                                <p className="text-xs text-gray-500 mt-2">Owner: You</p>
                            </div>

                            {/* AI summary only for my projects */}
                            <button
                                onClick={() => generateSummary(p._id)}
                                className="mt-3 py-2 px-3 bg-purple-600 text-white text-sm rounded-md"
                            >
                                AI Summary
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Joined Projects */}
            <section>
                <h2 className="text-xl font-semibold mb-3">Joined Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {joinedProjects.map((p) => (
                        <div
                            key={p._id}
                            className="p-4 bg-white border rounded-lg shadow hover:shadow-md transition"
                        >
                            <div
                                onClick={() => (window.location.href = `/my-projects/${p._id}`)}
                                className="cursor-pointer"
                            >
                                <h3 className="font-semibold text-lg">{p.name}</h3>
                                <p className="text-sm text-gray-600">{p.description}</p>
                                <p className="text-xs text-gray-500 mt-2">Owner: {p.owner?.name}</p>
                            </div>

                            {/* NO ai summary */}
                        </div>
                    ))}
                </div>
            </section>

            {showModal && (
                <CreateProjectModal
                    onClose={() => setShowModal(false)}
                    onCreated={() => window.location.reload()}
                />
            )}

            {aiModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 w-full max-w-lg rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold mb-3">AI Project Summary</h2>

                        {aiLoading ? (
                            <div className="text-center py-6">
                                <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-700 text-lg font-medium">
                                    AI is thinking...
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-700 whitespace-pre-line">{aiSummary}</p>
                        )}

                        <button
                            onClick={() => setAiModal(false)}
                            className="mt-5 w-full bg-purple-600 text-white py-2 rounded-md"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
