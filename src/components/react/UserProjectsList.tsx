import React, { useEffect, useState } from "react";
import { AiApi } from "../../lib/api/ai";
import { CreateProjectModal } from "./CreateProjectModal";
import { ProjectsApi } from "../../lib/api/projects";

type UserRole = "admin" | "manager" | "member";

interface User {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
    role?: UserRole;
}

interface ProjectUser {
    _id: string;
    name?: string;
    email?: string;
    role?: UserRole;
}

interface Project {
    _id: string;
    name: string;
    description?: string;
    owner?: string | ProjectUser;
    members?: ProjectUser[];
    projectRoles?: { userId: string | ProjectUser; role: UserRole }[];
}

export default function UserProjectsList() {
    const [myProjects, setMyProjects] = useState<Project[]>([]);
    const [joinedProjects, setJoinedProjects] = useState<Project[]>([]);
    const [showModal, setShowModal] = useState(false);

    const [user, setUser] = useState<User | null>(null);

    // AI Summary
    const [aiModal, setAiModal] = useState(false);
    const [aiSummary, setAiSummary] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    function getUserId(u: User | null): string | null {
        if (!u) return null;
        return (u._id as string) || (u.id as string) || null;
    }

    function getOwnerId(p: Project): string | null {
        if (!p.owner) return null;
        if (typeof p.owner === "string") return p.owner;
        return p.owner._id;
    }

    function isMemberOf(p: Project, userId: string): boolean {
        if (p.members?.some((m) => m._id === userId)) return true;

        if (
            p.projectRoles?.some((r) => {
                if (!r.userId) return false;
                if (typeof r.userId === "string") return r.userId === userId;
                return r.userId._id === userId;
            })
        ) {
            return true;
        }

        return false;
    }

    // Load user & projects
    useEffect(() => {
        if (typeof window === "undefined") return;

        const raw = localStorage.getItem("jira_user");
        if (!raw) return;

        const u: User = JSON.parse(raw);
        setUser(u);
        const meId = getUserId(u);
        if (!meId) return;

        async function loadProjects() {
            try {
                const res = await ProjectsApi.getAll();
                const all: Project[] = Array.isArray(res)
                    ? res
                    : (res as any).data || [];

                const owned = all.filter((p) => getOwnerId(p) === meId);
                const joined = all.filter(
                    (p) => getOwnerId(p) !== meId && isMemberOf(p, meId)
                );

                setMyProjects(owned);
                setJoinedProjects(joined);
            } catch (e) {
                console.error("[UserProjectsList] Failed to load projects:", e);
            }
        }

        loadProjects();
    }, []);

    const canCreate =
        user?.role === "manager" || user?.role === "member" || user?.role === "admin";

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

                            <button
                                onClick={() => generateSummary(p._id)}
                                className="mt-3 py-2 px-3 bg-purple-600 text-white text-sm rounded-md"
                            >
                                AI Summary
                            </button>
                        </div>
                    ))}

                    {myProjects.length === 0 && (
                        <p className="text-sm text-gray-500">You do not own any projects yet.</p>
                    )}
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
                                <p className="text-xs text-gray-500 mt-2">
                                    Owner: {typeof p.owner === "string" ? p.owner : p.owner?.name}
                                </p>
                            </div>
                        </div>
                    ))}

                    {joinedProjects.length === 0 && (
                        <p className="text-sm text-gray-500">
                            You have not joined any projects yet.
                        </p>
                    )}
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
