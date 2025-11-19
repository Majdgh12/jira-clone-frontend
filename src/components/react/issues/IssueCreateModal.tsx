import React, { useState, useEffect } from "react";
import { IssuesApi } from "../../../lib/api/issues";
import { ProjectsApi } from "../../../lib/api/projects";

interface CreateIssueModalProps {
    projectId: string;
    onClose: () => void;
    onCreated: () => void;
}

function CreateIssueModal({ projectId, onClose, onCreated }: CreateIssueModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [assignee, setAssignee] = useState("");
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Load members of this project
    useEffect(() => {
        async function loadMembers() {
            try {
                const project = await ProjectsApi.getOne(projectId);
                setMembers(project.members || []);
            } catch (err) {
                console.error("Failed to load project members:", err);
            }
        }
        loadMembers();
    }, [projectId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await IssuesApi.create({
                title,
                description,
                priority,
                assignee,
                projectId,
                status: "todo",
            });

            onCreated();
            onClose();
        } catch (err) {
            console.error("Create Issue error:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
                <h2 className="text-xl font-bold mb-4">Create Issue</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            className="w-full border px-3 py-2 rounded"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            className="w-full border px-3 py-2 rounded h-24"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Priority</label>
                        <select
                            className="w-full border px-3 py-2 rounded"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    {/* Assignee */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Assign To</label>
                        <select
                            className="w-full border px-3 py-2 rounded"
                            value={assignee}
                            onChange={(e) => setAssignee(e.target.value)}
                        >
                            <option value="">Unassigned</option>

                            {members.map((m) => (
                                <option key={m._id} value={m._id}>
                                    {m.name} ({m.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {loading ? "Creating..." : "Create Issue"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateIssueModal;
