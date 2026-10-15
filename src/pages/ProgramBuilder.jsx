import { useEffect, useState, useCallback, useMemo } from "react";
import Layout from "../components/Layout";
import API from "../api";
import {
  Dumbbell,
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  Clock,
  Repeat,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  User,
  Zap,
  Target,
  AlertCircle
} from "lucide-react";

const emptyExercise = { name: "", sets: 3, reps: "10", rest: "60 sec", notes: "" };

const PRESETS = [
  { label: "3 × 10 · Hypertrophy", sets: 3, reps: "10-12", rest: "60s", note: "Controlled eccentric" },
  { label: "4 × 8 · Strength", sets: 4, reps: "6-8", rest: "90s", note: "RPE 8, explosive concentric" },
  { label: "5 × 5 · Power / Compound", sets: 5, reps: "5", rest: "120s", note: "Solid bracing, reset each rep" },
  { label: "3 × 15 · Pump / Endurance", sets: 3, reps: "15", rest: "45s", note: "Constant tension" },
  { label: "3 × 45s · Core / Iso", sets: 3, reps: "45 sec", rest: "30s", note: "Maintain neutral spine" }
];

const CURATED_BENCHMARKS = [
  { name: "Barbell Back Squat", category: "Legs", defaultSets: 4, defaultReps: "8", defaultRest: "90s" },
  { name: "Romanian Deadlift", category: "Posterior", defaultSets: 3, defaultReps: "10", defaultRest: "75s" },
  { name: "Dumbbell Incline Press", category: "Chest", defaultSets: 4, defaultReps: "10", defaultRest: "60s" },
  { name: "Weighted Pull-ups", category: "Back", defaultSets: 3, defaultReps: "6-8", defaultRest: "90s" },
  { name: "Overhead Dumbbell Press", category: "Shoulders", defaultSets: 3, defaultReps: "10", defaultRest: "60s" },
  { name: "Bulgarian Split Squats", category: "Legs", defaultSets: 3, defaultReps: "10 / leg", defaultRest: "60s" },
  { name: "Hanging Knee Raises", category: "Core", defaultSets: 3, defaultReps: "15", defaultRest: "45s" },
  { name: "Cable Lateral Raises", category: "Shoulders", defaultSets: 4, defaultReps: "12-15", defaultRest: "45s" }
];

function ProgramBuilder() {
  const [clients, setClients] = useState([]);
  const [library, setLibrary] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", assignedTo: "" });
  const [exercises, setExercises] = useState([]);
  const [exerciseDraft, setExerciseDraft] = useState(emptyExercise);
  const [status, setStatus] = useState({ message: "", type: "info" });
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryCategory, setLibraryCategory] = useState("all");
  const [expandedProgramId, setExpandedProgramId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadBuilderData = useCallback(async () => {
    try {
      const [clientsResponse, libraryResponse, programsResponse] = await Promise.all([
        API.get("/clients"),
        API.get("/workouts"),
        API.get("/programs"),
      ]);
      setClients(clientsResponse.data);
      setLibrary(libraryResponse.data);
      setPrograms(programsResponse.data);
      if (clientsResponse.data[0]?.userId) {
        setForm((current) => ({
          ...current,
          assignedTo: current.assignedTo || clientsResponse.data[0].userId,
        }));
      }
    } catch (err) {
      setStatus({
        message: err.response?.data?.msg || "Unable to load program builder data",
        type: "error"
      });
    }
  }, []);

  useEffect(() => {
    loadBuilderData();
  }, [loadBuilderData]);

  const applyPreset = (preset) => {
    setExerciseDraft((prev) => ({
      ...prev,
      sets: preset.sets,
      reps: preset.reps,
      rest: preset.rest,
      notes: prev.notes || preset.note
    }));
  };

  const addExercise = () => {
    if (!exerciseDraft.name.trim()) return;
    setExercises((current) => [
      ...current,
      {
        ...exerciseDraft,
        name: exerciseDraft.name.trim(),
        sets: Number(exerciseDraft.sets) || 3,
        reps: exerciseDraft.reps.trim() || "10",
        rest: exerciseDraft.rest.trim() || "60s",
        notes: exerciseDraft.notes.trim()
      }
    ]);
    setExerciseDraft(emptyExercise);
  };

  const addFromLibrary = (exerciseItem) => {
    setExerciseDraft({
      name: typeof exerciseItem === "string" ? exerciseItem : exerciseItem.name,
      sets: exerciseItem.defaultSets || 3,
      reps: exerciseItem.defaultReps || "10",
      rest: exerciseItem.defaultRest || "60s",
      notes: exerciseItem.category ? `Focus: ${exerciseItem.category}` : ""
    });
  };

  const moveExercise = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= exercises.length) return;
    setExercises((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const removeExercise = (index) => {
    setExercises((current) => current.filter((_, exerciseIndex) => exerciseIndex !== index));
  };

  const deleteProgram = async (programId) => {
    if (!window.confirm("Are you sure you want to remove this assigned program?")) return;
    try {
      await API.delete(`/programs/${programId}`);
      setStatus({ message: "Program removed successfully.", type: "success" });
      setPrograms((current) => current.filter((p) => p._id !== programId));
    } catch (err) {
      setStatus({
        message: err.response?.data?.msg || "Failed to delete program",
        type: "error"
      });
    }
  };

  const saveProgram = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.assignedTo || exercises.length === 0) {
      setStatus({
        message: "Please enter a program name, select an athlete, and add at least one exercise.",
        type: "error"
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ message: "", type: "info" });

    try {
      await API.post("/programs", { ...form, exercises });
      setStatus({
        message: `Program "${form.name}" assigned successfully to athlete!`,
        type: "success"
      });
      setForm((current) => ({ ...current, name: "", description: "" }));
      setExercises([]);
      await loadBuilderData();
    } catch (err) {
      setStatus({
        message: err.response?.data?.msg || "Unable to save program",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combined library list
  const combinedLibrary = useMemo(() => {
    const existingNames = new Set(library.map((l) => l.name.toLowerCase()));
    const curated = CURATED_BENCHMARKS.filter((b) => !existingNames.has(b.name.toLowerCase()));
    return [...library, ...curated];
  }, [library]);

  const filteredLibrary = useMemo(() => {
    return combinedLibrary.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(librarySearch.toLowerCase());
      const matchesCat = libraryCategory === "all" || (ex.category && ex.category.toLowerCase() === libraryCategory.toLowerCase());
      return matchesSearch && matchesCat;
    });
  }, [combinedLibrary, librarySearch, libraryCategory]);

  const totalSets = useMemo(() => {
    return exercises.reduce((acc, curr) => acc + (Number(curr.sets) || 0), 0);
  }, [exercises]);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-[0_20px_50px_rgba(15,23,42,0.3)]">
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
                <Dumbbell className="h-3.5 w-3.5 text-indigo-400" />
                Trainer Studio
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl lg:text-4xl">
                Program Architecture Studio
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Design periodized training blocks, tune volume and rest parameters, and dispatch directly to client dashboards.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                <p className="text-xs uppercase tracking-wider text-slate-400">Athletes</p>
                <p className="text-xl font-bold text-white">{clients.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                <p className="text-xs uppercase tracking-wider text-slate-400">Library Items</p>
                <p className="text-xl font-bold text-indigo-300">{combinedLibrary.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                <p className="text-xs uppercase tracking-wider text-slate-400">Active Plans</p>
                <p className="text-xl font-bold text-emerald-400">{programs.length}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Status notification */}
        {status.message && (
          <div
            className={`flex items-center gap-3 rounded-2xl border p-4 text-sm font-medium transition-all ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : status.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-blue-200 bg-blue-50 text-blue-800"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : status.type === "error" ? (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            ) : (
              <Sparkles className="h-5 w-5 shrink-0 text-blue-600" />
            )}
            <p className="flex-1">{status.message}</p>
            <button
              onClick={() => setStatus({ message: "", type: "info" })}
              className="text-xs font-semibold hover:opacity-75"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid items-start gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          {/* Main Program Form */}
          <form onSubmit={saveProgram} className="glass-panel space-y-6 rounded-[28px] p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Program Blueprint</h2>
                <p className="text-xs text-slate-500">Configure client target, program specs, and exercise sequence</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  <Layers className="h-3.5 w-3.5" />
                  {exercises.length} Exercises
                </span>
                {totalSets > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    <Repeat className="h-3.5 w-3.5" />
                    {totalSets} Total Sets
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700 sm:col-span-1">
                <span className="mb-1.5 flex items-center gap-1.5 font-semibold text-slate-700">
                  <Target className="h-4 w-4 text-indigo-600" />
                  Program Name
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Upper Body Hypertrophy Phase 1"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              <label className="block text-sm text-slate-700 sm:col-span-1">
                <span className="mb-1.5 flex items-center gap-1.5 font-semibold text-slate-700">
                  <User className="h-4 w-4 text-indigo-600" />
                  Assign to Athlete
                </span>
                <select
                  required
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">Select an athlete...</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client.userId}>
                      {client.name} ({client.goal || "Athlete"})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-slate-700 sm:col-span-2">
                <span className="mb-1.5 flex items-center gap-1.5 font-semibold text-slate-700">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  Coach Description & Focus Notes
                </span>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Specify weekly schedule, tempo notes, intensity parameters, and target progression..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </label>
            </div>

            {/* Exercise Staging Box */}
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/30 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-800">Add Exercise to Staging</h3>
                </div>
                <span className="text-xs text-slate-500">Pick preset or customize below</span>
              </div>

              {/* Quick Presets */}
              <div className="mb-4 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Presets:</span>
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Exercise Name
                  </label>
                  <div className="relative mt-1">
                    <input
                      value={exerciseDraft.name}
                      onChange={(e) => setExerciseDraft({ ...exerciseDraft, name: e.target.value })}
                      placeholder="e.g. Bulgarian Split Squat (or pick from library)"
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Sets
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={exerciseDraft.sets}
                    onChange={(e) => setExerciseDraft({ ...exerciseDraft, sets: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Reps / Duration
                  </label>
                  <input
                    value={exerciseDraft.reps}
                    onChange={(e) => setExerciseDraft({ ...exerciseDraft, reps: e.target.value })}
                    placeholder="e.g. 10 or 45s"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Rest Time
                  </label>
                  <input
                    value={exerciseDraft.rest}
                    onChange={(e) => setExerciseDraft({ ...exerciseDraft, rest: e.target.value })}
                    placeholder="e.g. 60s"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Coaching Cue
                  </label>
                  <input
                    value={exerciseDraft.notes}
                    onChange={(e) => setExerciseDraft({ ...exerciseDraft, notes: e.target.value })}
                    placeholder="e.g. Pause 1s at bottom"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end">
                <button
                  type="button"
                  onClick={addExercise}
                  disabled={!exerciseDraft.name.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                  Append Exercise
                </button>
              </div>
            </div>

            {/* Exercise Sequence List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                  Program Sequence ({exercises.length})
                </h3>
                {exercises.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setExercises([])}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {exercises.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                  <Dumbbell className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm font-semibold text-slate-700">No exercises staged in this plan</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Add exercises using the form above or pick from the exercise library on the right.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {exercises.map((exercise, index) => (
                    <div
                      key={`${exercise.name}-${index}`}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-indigo-200 hover:shadow"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">{exercise.name}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">{exercise.sets} sets</span>
                            <span>•</span>
                            <span>{exercise.reps} reps</span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <Clock className="h-3 w-3" /> {exercise.rest}
                            </span>
                            {exercise.notes && (
                              <>
                                <span>•</span>
                                <span className="italic text-indigo-600">"{exercise.notes}"</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls: Up, Down, Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveExercise(index, -1)}
                          disabled={index === 0}
                          title="Move up"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExercise(index, 1)}
                          disabled={index === exercises.length - 1}
                          title="Move down"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExercise(index)}
                          title="Remove exercise"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="border-t border-slate-100 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !form.name.trim() || !form.assignedTo || exercises.length === 0}
                className="primary-button flex w-full items-center justify-center gap-2 py-3.5 text-base font-bold shadow-lg shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Assigning Program to Athlete...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Assign Program to Athlete ({exercises.length} Exercises)</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Right Column: Library & Assigned Programs */}
          <div className="space-y-6 xl:sticky xl:top-6">
            {/* Exercise Library Picker */}
            <div className="glass-panel rounded-[28px] p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Exercise Catalog</h2>
                  <p className="text-xs text-slate-500">Click any exercise to load into draft</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {filteredLibrary.length}
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Filter exercises..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white"
                />
              </div>

              {/* Category Pills */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {["all", "Legs", "Chest", "Back", "Shoulders", "Core"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setLibraryCategory(cat)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      libraryCategory.toLowerCase() === cat.toLowerCase()
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              {/* Exercise Items Grid */}
              <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                {filteredLibrary.length > 0 ? (
                  filteredLibrary.map((exercise, idx) => (
                    <div
                      key={exercise._id || idx}
                      className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">
                          {exercise.name}
                        </p>
                        {exercise.category && (
                          <span className="text-[10px] uppercase tracking-wider text-slate-400">
                            {exercise.category}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => addFromLibrary(exercise)}
                        className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-600 hover:text-white"
                      >
                        <Plus className="h-3 w-3" />
                        Select
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-xs text-slate-400">No exercises match search</p>
                )}
              </div>
            </div>

            {/* Assigned Programs List with Collapsible Details */}
            <div className="glass-panel rounded-[28px] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Assigned Rosters</h2>
                  <p className="text-xs text-slate-500">Active client training routines</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">{programs.length} total</span>
              </div>

              <div className="space-y-3">
                {programs.length > 0 ? (
                  programs.map((program) => {
                    const isExpanded = expandedProgramId === program._id;
                    return (
                      <div
                        key={program._id}
                        className="rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300"
                      >
                        <div className="flex items-start justify-between gap-2 p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900">{program.name}</p>
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                Active
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-500">
                              Athlete:{" "}
                              <span className="font-semibold text-slate-700">
                                {program.assignedTo?.name || "Unassigned"}
                              </span>
                            </p>
                            <p className="text-xs text-slate-400">
                              {program.exercises?.length || 0} exercises staged
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedProgramId(isExpanded ? null : program._id)
                              }
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              title="Toggle program exercises"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProgram(program._id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              title="Delete program"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Exercise Details */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50/60 p-4">
                            {program.description && (
                              <p className="mb-3 text-xs italic text-slate-600">
                                "{program.description}"
                              </p>
                            )}
                            <div className="space-y-1.5">
                              {program.exercises?.map((ex, exIdx) => (
                                <div
                                  key={ex._id || exIdx}
                                  className="flex items-center justify-between rounded-xl bg-white p-2 text-xs shadow-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
                                      {exIdx + 1}
                                    </span>
                                    <span className="font-semibold text-slate-800">{ex.name}</span>
                                  </div>
                                  <span className="text-slate-500">
                                    {ex.sets} × {ex.reps} ({ex.rest})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No programs assigned yet. Create your first blueprint above!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProgramBuilder;
