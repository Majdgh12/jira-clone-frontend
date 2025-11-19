import React, { useState } from "react";
import { ProjectsApi } from "../../../lib/api/projects";

export default function InviteModal({ projectId, onClose, onInvited }) {
    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);

    async function submitInvite() {
        try {
            setSending(true);
            await ProjectsApi.invite(projectId, email);
            onInvited();
            onClose();
        } catch (e) {
            alert("Failed to send invite");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                <h1 className="text-lg font-bold mb-3">Invite Member</h1>

                <input
                    type="email"
                    placeholder="Email address…"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                <button
                    className="w-full mt-4 bg-blue-600 text-white py-2 rounded"
                    onClick={submitInvite}
                    disabled={sending}
                >
                    {sending ? "Sending..." : "Send Invite"}
                </button>

                <button className="w-full mt-3 text-gray-600" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
}
