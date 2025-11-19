import React, { useEffect, useState } from "react";
import { IssuesApi } from "../../lib/api/issues";
import { UsersApi } from "../../lib/api/users";

export function CreateIssueModal({
    projectId,
    onClose,
    onCreated,
}: {
    projectId: string;
    onClose: () => void;
    onCreated: () => void;
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [assignee, setAssignee] = useState<string | undefined>(undefined);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function loadUsers() {
        try {
            const res = await UsersApi.getAll();
            setUsers(res as any);
        } catch (e) {
            console.error("Failed to load users", e);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await IssuesApi.create({
                title,
                description,
                priority,
                projectId,
                assignee: assignee || undefined,
            });

            onCreated();
            onClose();
        } catch (err) {
            console.error("Failed to create issue", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Create Issue</h2>

                <form onSubmit={handleCreate} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            className="w-full border rounded px-3 py-2"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            className="w-full border rounded px-3 py-2"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Priority</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Assign To</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={assignee || ""}
                            onChange={(e) => setAssignee(e.target.value)}
                        >
                            <option value="">No assignee</option>

                            {users.map((u) => (
                                <option key={u._id} value={u._id}>
                                    {u.name} ({u.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
