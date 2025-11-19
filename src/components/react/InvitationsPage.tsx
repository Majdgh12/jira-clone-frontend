import React, { useEffect, useState } from "react";
import { ProjectsApi } from "../../lib/api/projects";

export default function InvitationsPage() {
    const [invitations, setInvitations] = useState([]);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        try {
            const res = await ProjectsApi.listMyInvitations();
            setInvitations(res?.data || res || []);
        } catch (e) {
            console.error("Failed loading invitations:", e);
        }
    }

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold">Your Invitations</h1>

            {invitations.length === 0 && (
                <p className="text-gray-500">No pending invitations.</p>
            )}

            {invitations.map((inv) => (
                <div
                    key={inv._id}
                    className="border p-3 bg-white rounded shadow-sm"
                >
                    <p>
                        <b>{inv.invitedBy?.name || "Someone"}</b> invited you to{" "}
                        <b>{inv.projectId?.name || "a project"}</b>
                    </p>

                    <div className="flex gap-3 mt-3">
                        <button
                            onClick={() => ProjectsApi.acceptInvite(inv._id).then(load)}
                            className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                            Accept
                        </button>

                        <button
                            onClick={() => ProjectsApi.rejectInvite(inv._id).then(load)}
                            className="bg-gray-400 text-white px-3 py-1 rounded"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
