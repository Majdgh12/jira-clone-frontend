import React, { useEffect, useState } from "react";

type Step = {
    title: string;
    description: string;
};

const steps: Step[] = [
    {
        title: "Welcome to your Jira Clone 🚀",
        description:
            "This app lets you manage projects, issues, and track time like Jira — but with AI insights built in.",
    },
    {
        title: "Dashboard & Projects",
        description:
            "From the sidebar you can access Dashboard and Projects. Create new projects or open ones you’re part of.",
    },
    {
        title: "Issues & Time Tracking",
        description:
            "Each project has issues. You can update status, priority, and start/stop timers to track your work.",
    },
    {
        title: "AI Assistance",
        description:
            "Use AI summary buttons to get quick explanations of project status, productivity, and bottlenecks.",
    },
    {
        title: "You’re Ready 🎉",
        description:
            "That’s it! Explore your projects, create issues, and let the AI help you stay productive.",
    },
];

export function OnboardingTour() {
    const [visible, setVisible] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        // show if user just registered OR never saw onboarding before
        const shouldShow = localStorage.getItem("jira_show_tutorial");
        const done = localStorage.getItem("jira_onboarding_done");

        if (shouldShow === "1" || !done) {
            setVisible(true);
        }
    }, []);

    function closeTour() {
        setVisible(false);
        localStorage.setItem("jira_onboarding_done", "1");
        localStorage.removeItem("jira_show_tutorial");
    }

    function nextStep() {
        if (stepIndex < steps.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            closeTour();
        }
    }

    function prevStep() {
        if (stepIndex > 0) {
            setStepIndex(stepIndex - 1);
        }
    }

    if (!visible) return null;

    const current = steps[stepIndex];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white max-w-lg w-full mx-4 rounded-2xl shadow-2xl p-6 relative">
                {/* Small “skip” button */}
                <button
                    onClick={closeTour}
                    className="absolute top-3 right-4 text-xs text-gray-400 hover:text-gray-600"
                >
                    Skip
                </button>

                {/* Step indicator */}
                <p className="text-xs text-gray-500 mb-2">
                    Step {stepIndex + 1} of {steps.length}
                </p>

                {/* Title */}
                <h2 className="text-xl font-bold mb-2">{current.title}</h2>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-6">{current.description}</p>

                {/* Footer actions */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={prevStep}
                        disabled={stepIndex === 0}
                        className="px-3 py-1 rounded-md border text-sm disabled:opacity-40"
                    >
                        Back
                    </button>

                    <div className="flex items-center gap-2">
                        {/* Small dots for progress */}
                        <div className="flex gap-1 mr-2">
                            {steps.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`w-2 h-2 rounded-full ${idx === stepIndex ? "bg-blue-600" : "bg-gray-300"
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextStep}
                            className="px-4 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                        >
                            {stepIndex === steps.length - 1 ? "Finish" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
