import { useEffect, useState } from "react";
import KanbanBoard from "./KanbanBoard";

export default function ProjectWorkspace({ projectId }) {
    const [project, setProject] = useState(null);
    const [issues, setIssues] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        async function load() {
            const p = await fetch(
                `http://localhost:3000/projects/${projectId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            ).then(r => r.json());

            setProject(p.data);

            const i = await fetch(
                `http://localhost:3000/issues/${projectId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            ).then(r => r.json());

            setIssues(i.data);
        }

        load();
    }, [projectId]);

    if (!project) return <p>Loading...</p>;

    return (
        <div className="space-y-8">

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">{project.name}</h1>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
                    AI Summary
                </button>
            </div>

            {/* Kanban board */}
            <KanbanBoard issues={issues} />
        </div>
    );
}
