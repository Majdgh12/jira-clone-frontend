import React, { useEffect, useState } from "react";
import { AiApi } from "../../lib/api/ai";

export function AiInsightsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [productivity, setProductivity] = useState<any>(null);
    const [bottlenecks, setBottlenecks] = useState<any>(null);
    const [workload, setWorkload] = useState<any>(null);
    const [forecast, setForecast] = useState<any>(null);
    const [riskMap, setRiskMap] = useState<any>(null);
    const [activity, setActivity] = useState<any>(null);

    useEffect(() => {
        async function load() {
            try {
                const [
                    prodRes,
                    bottRes,
                    workRes,
                    foreRes,
                    riskRes,
                    actRes,
                ] = await Promise.all([
                    AiApi.productivity(),
                    AiApi.bottlenecks(),
                    AiApi.workload(),
                    AiApi.forecast(),
                    AiApi.riskMap(),
                    AiApi.activity(),
                ]);

                setProductivity(prodRes);
                setBottlenecks(bottRes);
                setWorkload(workRes);
                setForecast(foreRes);
                setRiskMap(riskRes);
                setActivity(actRes);
            } catch (err) {
                console.error(err);
                setError("Failed to load AI insights.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            </div>
        );
    }

    if (error) {
        return <p className="text-red-600">{error}</p>;
    }

    return (
        <div className="space-y-8">
            {/* Title */}
            <div>
                <h1 className="text-2xl font-bold">AI Insights (Global)</h1>
                <p className="text-sm text-gray-500">
                    Powered by Gemini 2.0 · Overview of all projects and issues.
                </p>
            </div>

            {/* Top overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white p-4 rounded-xl shadow">
                    <p className="text-xs uppercase tracking-wide opacity-80">
                        Open Issues
                    </p>
                    <p className="text-2xl font-semibold">
                        {riskMap ? (riskMap.critical.length + riskMap.risky.length + riskMap.stale.length + riskMap.ok.length) : "-"}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                        High Priority (Critical)
                    </p>
                    <p className="text-2xl font-semibold text-red-600">
                        {riskMap ? riskMap.critical.length : "-"}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                        ETA (Days)
                    </p>
                    <p className="text-2xl font-semibold">
                        {forecast ? forecast.etaDays : "-"}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                        Hours tracked (7 days)
                    </p>
                    <p className="text-2xl font-semibold">
                        {activity ? activity.hoursTracked : "-"}
                    </p>
                </div>
            </div>

            {/* Productivity trends */}
            {productivity && (
                <section className="bg-white p-4 rounded-xl shadow space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-lg">Productivity Trends</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {productivity.projects.map((p: any) => (
                            <div
                                key={p.project}
                                className="border rounded-lg p-3 flex flex-col justify-between"
                            >
                                <div>
                                    <p className="font-semibold">{p.project}</p>
                                    <p className="text-xs text-gray-500">
                                        This week: {p.thisWeekHours}h · Last week: {p.lastWeekHours}h
                                    </p>
                                    <p
                                        className={`text-xs mt-1 ${p.change > 0 ? "text-green-600" : p.change < 0 ? "text-red-600" : "text-gray-500"
                                            }`}
                                    >
                                        Change: {p.change.toFixed(1)}%
                                    </p>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">{p.summary}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Bottlenecks */}
            {bottlenecks && (
                <section className="bg-white p-4 rounded-xl shadow space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-lg">Bottlenecks</h2>
                        <span className="text-xs text-gray-500">
                            Total: {bottlenecks.total}
                        </span>
                    </div>

                    {bottlenecks.bottlenecks.length === 0 ? (
                        <p className="text-sm text-gray-500">No major bottlenecks detected 🎉</p>
                    ) : (
                        <div className="space-y-2">
                            {bottlenecks.bottlenecks.map((b: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-center border rounded-lg px-3 py-2 text-sm"
                                >
                                    <div>
                                        <p className="font-medium">{b.issue}</p>
                                        <p className="text-xs text-gray-500">
                                            {b.project} · {b.assignee} · {b.reason}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="text-xs text-gray-600 mt-2">{bottlenecks.summary}</p>
                </section>
            )}

            {/* Workload balance */}
            {workload && (
                <section className="bg-white p-4 rounded-xl shadow space-y-4">
                    <h2 className="font-semibold text-lg">Workload Balance</h2>

                    <div className="space-y-2">
                        {workload.members.map((m: any) => (
                            <div key={m.id} className="text-sm">
                                <div className="flex justify-between">
                                    <span>{m.name}</span>
                                    <span className="text-gray-500">
                                        {m.totalIssues} issues ({m.highPriority} high)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded h-2 mt-1">
                                    <div
                                        className="h-2 rounded bg-purple-500"
                                        style={{
                                            width: `${Math.min(m.totalIssues * 10, 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-gray-600 mt-2">{workload.aiSummary}</p>
                </section>
            )}

            {/* Risk map */}
            {riskMap && (
                <section className="bg-white p-4 rounded-xl shadow space-y-4">
                    <h2 className="font-semibold text-lg">Priority Risk Map</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h3 className="font-semibold text-red-600 mb-1">
                                🔥 Critical ({riskMap.critical.length})
                            </h3>
                            {riskMap.critical.length === 0 ? (
                                <p className="text-xs text-gray-500">None</p>
                            ) : (
                                riskMap.critical.map((i: any) => (
                                    <p key={i.id} className="text-xs">
                                        {i.title} – {i.project} ({i.ageDays} days)
                                    </p>
                                ))
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold text-orange-500 mb-1">
                                ⚠️ Risky ({riskMap.risky.length})
                            </h3>
                            {riskMap.risky.length === 0 ? (
                                <p className="text-xs text-gray-500">None</p>
                            ) : (
                                riskMap.risky.map((i: any) => (
                                    <p key={i.id} className="text-xs">
                                        {i.title} – {i.project} ({i.ageDays} days)
                                    </p>
                                ))
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold text-yellow-500 mb-1">
                                💤 Stale ({riskMap.stale.length})
                            </h3>
                            {riskMap.stale.length === 0 ? (
                                <p className="text-xs text-gray-500">None</p>
                            ) : (
                                riskMap.stale.map((i: any) => (
                                    <p key={i.id} className="text-xs">
                                        {i.title} – {i.project} ({i.ageDays} days)
                                    </p>
                                ))
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold text-green-600 mb-1">
                                ✅ OK ({riskMap.ok.length})
                            </h3>
                            {riskMap.ok.length === 0 ? (
                                <p className="text-xs text-gray-500">None</p>
                            ) : (
                                riskMap.ok.map((i: any) => (
                                    <p key={i.id} className="text-xs">
                                        {i.title} – {i.project} ({i.ageDays} days)
                                    </p>
                                ))
                            )}
                        </div>
                    </div>

                    <p className="text-xs text-gray-600 mt-2">{riskMap.aiSummary}</p>
                </section>
            )}

            {/* Activity summary */}
            {activity && (
                <section className="bg-white p-4 rounded-xl shadow space-y-3">
                    <h2 className="font-semibold text-lg">Last 7 Days</h2>

                    <div className="flex gap-6 text-sm">
                        <div>
                            <p className="text-xs text-gray-500">Created</p>
                            <p className="text-lg font-semibold">
                                {activity.issuesCreated}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Completed</p>
                            <p className="text-lg font-semibold">
                                {activity.issuesCompleted}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Hours tracked</p>
                            <p className="text-lg font-semibold">
                                {activity.hoursTracked}
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-gray-600 mt-1">{activity.aiSummary}</p>
                </section>
            )}
        </div>
    );
}
