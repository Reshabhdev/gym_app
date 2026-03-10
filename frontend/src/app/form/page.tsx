"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { MoveRight, RefreshCcw, Activity } from "lucide-react";

export default function FormPage() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const payload = {
            age: Number(formData.get("age")),
            gender: formData.get("gender"),
            weight_kg: Number(formData.get("weight_kg")),
            height_cm: Number(formData.get("height_cm")),
            activity_level: formData.get("activity_level"),
            goal: formData.get("goal"),
            diet_preference: formData.get("diet_preference"),
            location: formData.get("location")
        };

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
            const res = await fetch(`${API_URL}/api/v1/recommend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error("Failed to fetch recommendations. Ensure backend is running.");
            }

            const data = await res.json();
            setResults(data);

            // Scroll to top to see results
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#030303] text-white py-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Results Section */}
                {results && (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-8 h-8 text-emerald-400" />
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                                Your AI-Powered Plan
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-white/90 border-b border-white/10 pb-2">Nutrition Target</h3>
                                <div className="bg-black/40 rounded-xl p-6 border border-white/5">
                                    <div className="text-4xl font-black text-emerald-400 mb-2">
                                        {results.target_calories} <span className="text-lg text-white/50 font-normal">kcal/day</span>
                                    </div>
                                    <p className="text-white/60">Optimized for your exact biometrics and selected goal.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-white/90 border-b border-white/10 pb-2">Workout Routine</h3>
                                <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-white/5 text-white/70">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Exercise</th>
                                                    <th className="px-4 py-3 font-medium">Sets</th>
                                                    <th className="px-4 py-3 font-medium">Reps</th>
                                                    <th className="px-4 py-3 font-medium">Target Muscle</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {results.workout_plan?.map((workout: any, idx: number) => (
                                                    <React.Fragment key={idx}>
                                                        <tr
                                                            onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                                                            className="hover:bg-white/[0.04] transition-colors cursor-pointer"
                                                        >
                                                            <td className="px-4 py-3 font-medium text-white/90">{workout.Exercise || workout.exercise || workout.exercise_name}</td>
                                                            <td className="px-4 py-3 text-white/60">{workout.Sets || workout.sets}</td>
                                                            <td className="px-4 py-3 text-white/60">{workout.Reps || workout.reps}</td>
                                                            <td className="px-4 py-3 text-emerald-400/80">{workout["Target Muscle"] || workout.target_muscle}</td>
                                                        </tr>
                                                        {expandedRow === idx && workout.instructions && (
                                                            <tr>
                                                                <td colSpan={4} className="px-6 py-4 bg-black/40 text-sm text-white/70 border-t border-white/5 animate-in fade-in duration-300">
                                                                    <strong className="text-white/90">How to perform:</strong> {workout.instructions}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Diet Plan Section */}
                        {results.diet_plan && (
                            <div className="mt-8 space-y-4">
                                <h3 className="text-xl font-semibold text-white/90 border-b border-white/10 pb-2">Recommended Diet Plan</h3>
                                <div className="grid md:grid-cols-4 gap-4">
                                    {results.diet_plan.map((meal: any, idx: number) => (
                                        <div key={idx} className="bg-black/40 rounded-xl p-5 border border-white/5 hover:border-emerald-500/30 transition-colors">
                                            <div className="text-emerald-400 font-bold mb-2">{meal.meal}</div>
                                            <p className="text-white/80 text-sm mb-3">{meal.food}</p>
                                            <div className="text-xs font-medium text-white/40">{meal.calories} kcal</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={() => setResults(null)}
                            variant="outline"
                            className="mt-8 border-white/20 hover:bg-white/10 hover:text-white"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Generate New Plan
                        </Button>
                    </div>
                )}

                {/* Form Section */}
                <div className={`rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-500 ${results ? 'opacity-50 scale-[0.98] pointer-events-none' : ''}`}>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60 mb-2">
                        Start Your Fitness Journey
                    </h1>
                    <p className="text-white/40 mb-8 font-light">Enter your biometrics to generate a hyper-personalized plan.</p>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Column 1 */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="age" className="text-sm font-medium text-white/80">Age</label>
                                    <input required type="number" name="age" id="age" min="12" max="100" defaultValue="22" className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="gender" className="text-sm font-medium text-white/80">Gender</label>
                                    <select required name="gender" id="gender" className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all [&>option]:bg-[#030303]">
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="weight_kg" className="text-sm font-medium text-white/80">Weight (kg)</label>
                                    <input required type="number" step="0.1" name="weight_kg" id="weight_kg" min="30" max="250" defaultValue="70" className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all" />
                                </div>
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="height_cm" className="text-sm font-medium text-white/80">Height (cm)</label>
                                    <input required type="number" step="0.1" name="height_cm" id="height_cm" min="100" max="250" defaultValue="175" className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="activity_level" className="text-sm font-medium text-white/80">Activity Level</label>
                                    <select required name="activity_level" id="activity_level" className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all [&>option]:bg-[#030303]">
                                        <option value="sedentary">Sedentary</option>
                                        <option value="light">Light</option>
                                        <option value="moderate">Moderate</option>
                                        <option value="active">Active</option>
                                        <option value="very_active">Very Active</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="goal" className="text-sm font-medium text-white/80">Primary Goal</label>
                                    <select required name="goal" id="goal" className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all [&>option]:bg-[#030303]">
                                        <option value="lose">Lose Weight</option>
                                        <option value="maintain">Maintain Weight</option>
                                        <option value="gain">Gain Muscle</option>
                                    </select>
                                </div>
                            </div>

                            {/* Column 3 */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="diet_preference" className="text-sm font-medium text-white/80">Diet Type</label>
                                    <select required name="diet_preference" id="diet_preference" className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all [&>option]:bg-[#030303]">
                                        <option value="omnivore">Omnivore</option>
                                        <option value="vegetarian">Vegetarian</option>
                                        <option value="vegan">Vegan</option>
                                        <option value="keto">Keto</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="location" className="text-sm font-medium text-white/80">Workout Location</label>
                                    <select required name="location" id="location" className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all [&>option]:bg-[#030303]">
                                        <option value="gym">Gym</option>
                                        <option value="home">Home</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <Button
                                type="submit"
                                disabled={loading}
                                size="lg"
                                className="w-full md:w-auto px-8 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {loading ? "Crunching the numbers..." : "Generate My AI Plan"}
                                {!loading && <MoveRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
