import { useEffect, useState } from "react";

export default function ProjectsPage() {
    const [myProjects, setMyProjects] = useState([]);
    const [joinedProjects, setJoinedProjects] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        async function load() {
            const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json());

            setMyProjects(res.data.filter((p) => p.owner.id === user.id));
            setJoinedProjects(res.data.filter((p) => p.owner.id !== user.id));
        }

        load();
    }, []);

    return (
        <div className="space-y-8">

            {/* My Projects */}
            <section>
                <h2 className="text-xl font-semibold mb-4">My Projects</h2>
                <div className="grid grid-cols-3 gap-4">
                    {myProjects.map((p) => (
                        <a href={`/projects/${p.id}`} className="project-card" key={p.id}>
                            <h3 className="font-semibold">{p.name}</h3>
                            <p className="text-sm text-gray-500">{p.description}</p>
                        </a>
                    ))}
                </div>
            </section>

            {/* Joined Projects */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Joined Projects</h2>
                <div className="grid grid-cols-3 gap-4">
                    {joinedProjects.map((p) => (
                        <a href={`/projects/${p.id}`} className="project-card" key={p.id}>
                            <h3 className="font-semibold">{p.name}</h3>
                            <p className="text-sm text-gray-500">{p.description}</p>
                        </a>
                    ))}
                </div>
            </section>

        </div>
    );
}
