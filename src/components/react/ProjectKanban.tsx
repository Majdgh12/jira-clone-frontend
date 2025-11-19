import React, { useEffect, useState, useCallback } from "react";
import { IssuesApi } from "../../lib/api/issues";
import { ProjectsApi } from "../../lib/api/projects";
import KanbanColumn from "./KanbanColumn";
import CreateIssueModal from "./issues/IssueCreateModal";
import InviteModal from "./Projects/InviteModal";

export default function ProjectKanban({ projectId }) {
    const [project, setProject] = useState(null);
    const [issues, setIssues] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("jira_user");
            if (stored) setUser(JSON.parse(stored));
        }
    }, []);

    const currentUserId = user?._id || user?.id;

    const load = useCallback(async () => {
        try {
            const p = await ProjectsApi.getOne(projectId);
            setProject(p);

            const res = await IssuesApi.getByProject(projectId);
            setIssues(Array.isArray(res) ? res : res.data || []);
        } catch (e) {
            console.error("[ProjectKanban] load error:", e);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (projectId) load();
    }, [projectId, load]);

    const canManage = (() => {
        if (!project || !user || !currentUserId) return false;

        const owner =
            typeof project.owner === "string"
                ? project.owner
                : project.owner?._id || project.owner?.id;

        if (owner === currentUserId) return true;

        const isManager = project.projectRoles?.some((r) => {
            const rid =
                typeof r.userId === "string" ? r.userId : r.userId?._id || r.userId?.id;
            return rid === currentUserId && r.role === "manager";
        });

        return isManager || user.role === "admin";
    })();

    function issuesByStatus(status) {
        return issues.filter((i) => i?.status === status);
    }

    function getAssigneeId(issue) {
        if (!issue.assignee) return null;
        return typeof issue.assignee === "string"
            ? issue.assignee
            : issue.assignee._id || issue.assignee.id;
    }

    async function moveIssue(issueId, newStatus) {
        const issue = issues.find((i) => i._id === issueId);
        if (!issue) return;

        const assignedToCurrent = getAssigneeId(issue) === currentUserId;

        if (!canManage && !assignedToCurrent) {
            alert("❌ You cannot move issues that are not assigned to you.");
            return;
        }

        try {
            if (newStatus === "in-progress") {
                await IssuesApi.start(issueId);
            } else {
                await IssuesApi.stop(issueId);
            }

            await IssuesApi.update(issueId, { status: newStatus });
            const fresh = await IssuesApi.getOne(issueId);

            setIssues((prev) => prev.map((i) => (i._id === issueId ? fresh : i)));
        } catch (e) {
            console.error("[moveIssue]", e);
            load();
        }
    }

    if (loading || !project) return <p className="p-4">Loading…</p>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center p-4">
                <div>
                    <h1 className="text-2xl font-bold">{project.name}</h1>
                    <p className="text-gray-600 text-sm">{project.description}</p>
                </div>

                <div className="flex gap-2">
                    {canManage && (
                        <>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded"
                                onClick={() => setShowInviteModal(true)}
                            >
                                Invite
                            </button>

                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={() => setShowCreateModal(true)}
                            >
                                Create Issue
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Kanban */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KanbanColumn
                    title="To Do"
                    status="open"
                    issues={issuesByStatus("open")}
                    onDrop={moveIssue}
                    canManage={canManage}
                    currentUserId={currentUserId}
                />
                <KanbanColumn
                    title="In Progress"
                    status="in-progress"
                    issues={issuesByStatus("in-progress")}
                    onDrop={moveIssue}
                    canManage={canManage}
                    currentUserId={currentUserId}
                />
                <KanbanColumn
                    title="On Hold"
                    status="on_hold"
                    issues={issuesByStatus("on_hold")}
                    onDrop={moveIssue}
                    canManage={canManage}
                    currentUserId={currentUserId}
                />
                <KanbanColumn
                    title="Done"
                    status="done"
                    issues={issuesByStatus("done")}
                    onDrop={moveIssue}
                    canManage={canManage}
                    currentUserId={currentUserId}
                />
            </div>

            {showCreateModal && (
                <CreateIssueModal
                    projectId={projectId}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={load}
                />
            )}

            {showInviteModal && (
                <InviteModal
                    projectId={projectId}
                    onClose={() => setShowInviteModal(false)}
                    onInvited={load}
                />
            )}
        </div>
    );
}
