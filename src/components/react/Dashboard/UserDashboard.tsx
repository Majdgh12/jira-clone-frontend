import { useEffect, useState } from "react";

export default function UserDashboard() {
    const [myTasks, setMyTasks] = useState([]);
    const [myProjects, setMyProjects] = useState([]);
    const [joinedProjects, setJoinedProjects] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        async function fetchData() {
            // Get all projects where current user is manager or member
            const p = await fetch(`${import.meta.env.PUBLIC_API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json());

            // manager projects
            const ownerId = JSON.parse(localStorage.getItem("user") || "{}").id;
            setMyProjects(p.data.filter((proj: { owner: { id: any; }; }) => proj.owner.id === ownerId));

            // joined projects
            setJoinedProjects(p.data.filter((proj: { owner: { id: any; }; }) => proj.owner.id !== ownerId));

            // get user tasks
            const tasks = [];
            for (const proj of p.data) {
                const issues = await fetch(
                    `${import.meta.env.PUBLIC_API_URL}/issues/${proj.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                ).then((res) => res.json());

                tasks.push(...issues.data.filter((i: { assignee: { id: any; }; }) => i.assignee?.id === ownerId));
            }

            setMyTasks(tasks);
        }

        fetchData();
    }, []);

    return (
        <div className="space-y-8">

            {/* My Tasks */}
            <section>
                <h2 className="text-xl font-semibold mb-3">My Tasks</h2>
                <div className="bg-white p-4 rounded shadow space-y-3">
                    {myTasks.length === 0 ? (
                        <p className="text-gray-500">No tasks assigned.</p>
                    ) : (
                        myTasks.map((task) => (
                            <div key={task.id} className="p-3 border rounded">
                                <p className="font-medium">{task.title}</p>
                                <p className="text-xs text-gray-500">Status: {task.status}</p>
                                <a
                                    href={`/issues/${task.id}`}
                                    className="text-blue-600 text-sm"
                                >
                                    Open
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* My Projects */}
            <section>
                <h2 className="text-xl font-semibold mb-3">My Projects</h2>
                <div className="grid grid-cols-3 gap-4">
                    {myProjects.map((p) => (
                        <a
                            href={`/projects/${p.id}`}
                            key={p.id}
                            className="p-4 bg-white rounded shadow hover:shadow-md"
                        >
                            <h3 className="font-semibold">{p.name}</h3>
                            <p className="text-gray-500 text-sm">
                                {p.description || "No description"}
                            </p>
                        </a>
                    ))}
                </div>
            </section>

            {/* Joined Projects */}
            <section>
                <h2 className="text-xl font-semibold mb-3">Joined Projects</h2>
                <div className="grid grid-cols-3 gap-4">
                    {joinedProjects.map((p) => (
                        <a
                            href={`/projects/${p.id}`}
                            key={p.id}
                            className="p-4 bg-white rounded shadow hover:shadow-md"
                        >
                            <h3 className="font-semibold">{p.name}</h3>
                            <p className="text-gray-500 text-sm">
                                {p.description || "No description"}
                            </p>
                        </a>
                    ))}
                </div>
            </section>

        </div>
    );
}
