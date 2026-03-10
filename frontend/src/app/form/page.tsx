"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { MoveRight, RefreshCcw, Activity, Flame, Dumbbell, Utensils, Target, ChevronDown, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#facc15', '#a855f7'];

export default function FormPage() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [showWorkoutChart, setShowWorkoutChart] = useState(false);
    const [showDietChart, setShowDietChart] = useState(false);
    const [activeWorkoutIdx, setActiveWorkoutIdx] = useState<number | null>(null);
    const [activeDietIdx, setActiveDietIdx] = useState<number | null>(null);

    const workoutChartData = React.useMemo(() => {
        if (!results?.workout_plan) return [];
        const muscleCounts: Record<string, number> = {};
        results.workout_plan.forEach((w: any) => {
            const muscle = w["Target Muscle"] || w.target_muscle || "Other";
            muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
        });
        return Object.keys(muscleCounts).map(key => ({
            name: key,
            value: muscleCounts[key]
        }));
    }, [results?.workout_plan]);

    const dietChartData = React.useMemo(() => {
        if (!results?.diet_plan) return [];
        return results.diet_plan.map((m: any) => ({
            name: m.meal,
            value: m.calories,
            food: m.food
        }));
    }, [results?.diet_plan]);

    const activeWorkoutDetails = React.useMemo(() => {
        if (activeWorkoutIdx === null || !workoutChartData[activeWorkoutIdx]) return null;
        const target = workoutChartData[activeWorkoutIdx].name;
        // Find all workouts for this muscle
        const workouts = results.workout_plan.filter((w: any) => (w["Target Muscle"] || w.target_muscle || "Other") === target);
        return { target, workouts };
    }, [activeWorkoutIdx, workoutChartData, results?.workout_plan]);

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
        <main className="min-h-[100dvh] bg-[#030303] text-white py-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Results Section */}
                {results && (
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/60 p-8 md:p-12 backdrop-blur-2xl shadow-[0_0_80px_-20px_rgba(16,185,129,0.3)] animate-in zoom-in-95 fade-in duration-700">
                        {/* Decorative dynamic glows */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent" />
                        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex flex-col items-center justify-center text-center mb-12 space-y-4">
                                <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 rounded-3xl ring-1 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                    <Activity className="w-10 h-10 text-emerald-400" />
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-emerald-400/50">
                                    Your Elite Plan
                                </h2>
                                <p className="text-white/40 text-lg md:text-xl font-light max-w-xl">
                                    Precision-engineered for your biometrics. Time to execute.
                                </p>
                            </div>

                            <div className={`grid gap-8 mb-12 ${showWorkoutChart || showDietChart ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>
                                {(!showWorkoutChart && !showDietChart) && (
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                                            <div className="p-2 bg-orange-500/10 rounded-xl">
                                                <Flame className="w-5 h-5 text-orange-400" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white/90 tracking-tight">Daily Target</h3>
                                        </div>
                                        <div className="group relative bg-gradient-to-b from-white/[0.08] to-transparent rounded-3xl p-8 border border-white/[0.05] overflow-hidden transition-all duration-500 hover:border-orange-500/30 hover:bg-white/[0.1] hover:shadow-[0_0_40px_-15px_rgba(249,115,22,0.2)]">
                                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] transition-transform duration-700 group-hover:scale-125 group-hover:-rotate-12 group-hover:opacity-10 translate-x-8 -translate-y-8">
                                                <Flame className="w-48 h-48 text-orange-500" />
                                            </div>
                                            <div className="relative z-10 flex flex-col h-full justify-center">
                                                <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 mb-4 tracking-tighter">
                                                    {results.target_calories}
                                                </div>
                                                <div className="text-2xl font-medium tracking-wide text-orange-400 mb-6 flex items-center gap-2">
                                                    KCAL <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50" /> DAY
                                                </div>
                                                <p className="text-white/50 leading-relaxed text-sm md:text-base max-w-xs font-light">Calculated to precisely align with your goal weight and activity level.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(!showDietChart) && (
                                    <div className="space-y-5">
                                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                                    <Dumbbell className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-white/90 tracking-tight">Workout Protocol</h3>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => setShowWorkoutChart(!showWorkoutChart)} className="border-white/10 h-9 bg-black/40 hover:bg-white/10 text-white/70 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-300">
                                                {showWorkoutChart ? "View Program" : "View Breakdown"}
                                            </Button>
                                        </div>
                                        <div className="bg-gradient-to-b from-white/[0.04] to-transparent rounded-3xl border border-white/[0.05] overflow-hidden p-3 min-h-[350px]">
                                            {showWorkoutChart ? (
                                                <div className="flex flex-col md:flex-row h-auto min-h-[320px] w-full mt-4 gap-4">
                                                    <div className="flex-1 min-h-[300px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={workoutChartData}
                                                                    cx="50%" cy="50%"
                                                                    innerRadius={60} outerRadius={80}
                                                                    paddingAngle={5} dataKey="value"
                                                                    onMouseEnter={(_, index) => setActiveWorkoutIdx(index)}
                                                                    onClick={(_, index) => setActiveWorkoutIdx(activeWorkoutIdx === index ? null : index)}
                                                                >
                                                                    {workoutChartData.map((entry: any, index: number) => (
                                                                        <Cell
                                                                            key={`cell-${index}`}
                                                                            fill={COLORS[index % COLORS.length]}
                                                                            stroke="rgba(255,255,255,0.1)"
                                                                            className="transition-all duration-300 cursor-pointer hover:opacity-80"
                                                                            style={{ filter: activeWorkoutIdx === index ? `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]})` : 'none' }}
                                                                        />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip contentStyle={{ backgroundColor: '#030303', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>

                                                    {/* Details Panel for Workout Chart */}
                                                    {activeWorkoutIdx !== null && activeWorkoutDetails && (
                                                        <div className="w-full md:w-64 bg-black/40 rounded-2xl p-5 border border-white/5 flex flex-col transition-all duration-300">
                                                            <div className="animate-in fade-in zoom-in-95 duration-200">
                                                                <div className="text-xs uppercase tracking-wider text-white/40 mb-1">Target Muscle</div>
                                                                <div className="text-xl font-bold text-white/90 mb-4 pb-2 border-b border-white/10" style={{ color: COLORS[activeWorkoutIdx % COLORS.length] }}>
                                                                    {activeWorkoutDetails.target}
                                                                </div>
                                                                <div className="space-y-3 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                                                                    {activeWorkoutDetails.workouts.map((w: any, i: number) => (
                                                                        <div key={i} className="text-sm">
                                                                            <div className="font-medium text-white/80">{w.Exercise || w.exercise || w.exercise_name}</div>
                                                                            <div className="text-white/40text-xs font-mono mt-0.5">{w.Sets || w.sets} × {w.Reps || w.reps}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="overflow-hidden rounded-2xl border border-white/5 h-full">
                                                    <div className="overflow-x-auto h-full mb-2">
                                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                                            <thead className="bg-white/5 text-white/50 text-xs uppercase tracking-wider">
                                                                <tr>
                                                                    <th className="px-5 py-4 font-semibold">Movement</th>
                                                                    <th className="px-5 py-4 font-semibold">Sets × Reps</th>
                                                                    <th className="px-5 py-4 font-semibold">Focus</th>
                                                                    <th className="px-5 py-4 font-semibold w-10"></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/5">
                                                                {results.workout_plan?.map((workout: any, idx: number) => (
                                                                    <React.Fragment key={idx}>
                                                                        <tr
                                                                            onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                                                                            className={`group transition-all cursor-pointer duration-300 ${expandedRow === idx ? 'bg-blue-500/5' : 'hover:bg-white/[0.03]'}`}
                                                                        >
                                                                            <td className="px-5 py-4 font-medium text-white/90 group-hover:text-blue-400 transition-colors">
                                                                                {workout.Exercise || workout.exercise || workout.exercise_name}
                                                                            </td>
                                                                            <td className="px-5 py-4 text-white/60 font-mono text-xs">
                                                                                <span className="text-white/80">{workout.Sets || workout.sets}</span> × <span className="text-white/80">{workout.Reps || workout.reps}</span>
                                                                            </td>
                                                                            <td className="px-5 py-4">
                                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                                                    {workout["Target Muscle"] || workout.target_muscle}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-5 py-4 text-white/30 group-hover:text-blue-400 transition-colors">
                                                                                {expandedRow === idx ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                                            </td>
                                                                        </tr>
                                                                        {expandedRow === idx && workout.instructions && (
                                                                            <tr>
                                                                                <td colSpan={4} className="px-5 py-6 bg-black/60 text-sm text-white/60 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-300 border-l-2 border-l-blue-500">
                                                                                    <div className="flex gap-4 items-start max-w-md whitespace-normal">
                                                                                        <div className="p-2 rounded-full bg-blue-500/10 shrink-0 mt-0.5">
                                                                                            <Target className="w-4 h-4 text-blue-400" />
                                                                                        </div>
                                                                                        <div>
                                                                                            <strong className="block text-white/90 mb-1 font-medium">Execution Form</strong>
                                                                                            <span className="leading-relaxed">{workout.instructions}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                    </React.Fragment>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Diet Plan Section */}
                            {results.diet_plan && (!showWorkoutChart) && (
                                <div className="space-y-5 relative z-10">
                                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                                                <Utensils className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white/90 tracking-tight">Nutrition Blueprint</h3>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setShowDietChart(!showDietChart)} className="border-white/10 h-9 bg-black/40 hover:bg-white/10 text-white/70 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-300">
                                            {showDietChart ? "View Menu" : "View Macros"}
                                        </Button>
                                    </div>
                                    {showDietChart ? (
                                        <div className="bg-gradient-to-b from-white/[0.04] to-transparent rounded-3xl p-6 border border-white/[0.05] min-h-[380px] w-full flex flex-col md:flex-row gap-6">
                                            <div className="flex-1 min-h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={dietChartData}
                                                            cx="50%" cy="50%"
                                                            innerRadius={60} outerRadius={80}
                                                            paddingAngle={5} dataKey="value" nameKey="name"
                                                            onMouseEnter={(_, index) => setActiveDietIdx(index)}
                                                            onClick={(_, index) => setActiveDietIdx(activeDietIdx === index ? null : index)}
                                                        >
                                                            {dietChartData.map((entry: any, index: number) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={COLORS[index % COLORS.length]}
                                                                    stroke="rgba(255,255,255,0.1)"
                                                                    className="transition-all duration-300 cursor-pointer hover:opacity-80"
                                                                    style={{ filter: activeDietIdx === index ? `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]})` : 'none' }}
                                                                />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value) => `${value} kcal`} contentStyle={{ backgroundColor: '#030303', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>

                                            {/* Details Panel for Diet Chart */}
                                            {activeDietIdx !== null && dietChartData[activeDietIdx] && (
                                                <div className="w-full md:w-64 bg-black/40 rounded-2xl p-6 border border-white/5 flex flex-col transition-all duration-300">
                                                    <div className="animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="text-xs uppercase tracking-wider text-white/40 mb-1">Meal Content</div>
                                                        <div className="text-xl font-bold text-white/90 mb-2" style={{ color: COLORS[activeDietIdx % COLORS.length] }}>
                                                            {dietChartData[activeDietIdx].name}
                                                        </div>
                                                        <div className="text-sm text-white/70 leading-relaxed mb-4 pb-4 border-b border-white/10">
                                                            {dietChartData[activeDietIdx].food}
                                                        </div>
                                                        <div className="flex items-end justify-between">
                                                            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                                                                {dietChartData[activeDietIdx].value}
                                                            </div>
                                                            <div className="text-xs font-medium text-white/40 uppercase mb-1">Kcal</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                            {results.diet_plan.map((meal: any, idx: number) => (
                                                <div key={idx} className="group relative bg-[#0a0a0a] rounded-2xl p-6 border border-white/5 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-1 overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors duration-500" />
                                                    <div className="relative z-10 flex flex-col h-full">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="text-emerald-400 font-bold tracking-wide uppercase text-xs px-3 py-1 bg-emerald-500/10 rounded-full">{meal.meal}</div>
                                                        </div>
                                                        <p className="text-white/90 font-medium mb-6 flex-grow leading-snug">{meal.food}</p>
                                                        <div className="flex items-end justify-between mt-auto">
                                                            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                                                {meal.calories}
                                                            </div>
                                                            <div className="text-xs font-medium text-white/40 uppercase tracking-widest pb-1">Kcal</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-12 flex justify-center relative z-10">
                                <Button
                                    onClick={() => setResults(null)}
                                    size="lg"
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl px-8 h-12 backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5"
                                >
                                    <RefreshCcw className="w-4 h-4 mr-3" />
                                    Recalculate Protocol
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Section */}
                {!results && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-500">
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
                )}
            </div>
        </main>
    );
}
