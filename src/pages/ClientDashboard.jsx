import Layout from "../components/Layout";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import {
  CheckCircle2,
  Calendar,
  Zap,
  Moon,
  TrendingUp,
  Dumbbell,
  Video,
  MessageSquare,
  Send,
  Flame,
  Smile,
  Award,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  Activity,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Salad,
  Droplets,
  Scale,
} from "lucide-react";

function RestTimer() {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [initialDuration, setInitialDuration] = useState(60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const selectPreset = (secs) => {
    setInitialDuration(secs);
    setSecondsLeft(secs);
    setIsRunning(false);
  };

  const toggle = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(initialDuration);
    }
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(initialDuration);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const isDone = secondsLeft === 0;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
            <Timer className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Rest Stopwatch
            </h3>
            <p className="text-[11px] text-slate-400">Time between sets</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`rounded-xl px-3 py-1 font-mono text-base font-black tracking-tight transition ${
              isDone
                ? "bg-emerald-100 text-emerald-800 animate-pulse"
                : isRunning
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                : "bg-slate-100 text-slate-800"
            }`}
          >
            {isDone ? "REST OVER!" : formatTime(secondsLeft)}
          </div>

          <button
            type="button"
            onClick={toggle}
            className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold transition ${
              isRunning
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/30"
            }`}
            title={isRunning ? "Pause timer" : "Start timer"}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={reset}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
            title="Reset timer"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 pt-2.5 border-t border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
          Preset:
        </span>
        {[30, 60, 90, 120].map((sec) => (
          <button
            key={sec}
            type="button"
            onClick={() => selectPreset(sec)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              initialDuration === sec
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"
            }`}
          >
            {sec}s
          </button>
        ))}
      </div>
    </div>
  );
}

const MOODS = [
  { label: "Strong", icon: "⚡", bg: "hover:bg-amber-50 hover:border-amber-300", active: "bg-amber-100 border-amber-400 text-amber-900" },
  { label: "Good", icon: "😊", bg: "hover:bg-emerald-50 hover:border-emerald-300", active: "bg-emerald-100 border-emerald-400 text-emerald-900" },
  { label: "Okay", icon: "😐", bg: "hover:bg-blue-50 hover:border-blue-300", active: "bg-blue-100 border-blue-400 text-blue-900" },
  { label: "Tired", icon: "😴", bg: "hover:bg-rose-50 hover:border-rose-300", active: "bg-rose-100 border-rose-400 text-rose-900" }
];

function ClientDashboard() {
  const [client, setClient] = useState(undefined);
  const [programs, setPrograms] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isSavingCheckin, setIsSavingCheckin] = useState(false);
  const [checkinSavedSuccess, setCheckinSavedSuccess] = useState(false);
  const [checkin, setCheckin] = useState({
    energy: 8,
    sleep: 7,
    mood: "Strong",
    note: "Feeling primed for training today. Ready to push heavy sets.",
  });

  const fetchClient = useCallback(async () => {
    try {
      const res = await API.get("/clients/me");
      setClient(res.data);
    } catch (err) {
      console.error(err);
      setClient(null);
    }
  }, []);

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await API.get("/programs/mine");
      setPrograms(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchClient();
    fetchPrograms();
  }, [fetchClient, fetchPrograms]);

  const saveCheckin = async () => {
    if (!client?._id) return;
    setIsSavingCheckin(true);
    try {
      await API.post(`/clients/${client._id}/checkin`, checkin);
      await fetchClient();
      setCheckinSavedSuccess(true);
      setTimeout(() => setCheckinSavedSuccess(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingCheckin(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !client?._id || isSendingMessage) return;
    setIsSendingMessage(true);
    try {
      await API.post(`/clients/${client._id}/message`, {
        text: newMessage.trim(),
        sender: "client",
      });
      setNewMessage("");
      await fetchClient();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const toggleProgramExercise = async (programId, exerciseId) => {
    try {
      await API.put(`/programs/${programId}/exercise/${exerciseId}`);
      fetchPrograms();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWorkout = async (wid) => {
    if (!client?._id) return;
    try {
      await API.put(`/clients/${client._id}/workout/${wid}`);
      fetchClient();
    } catch (err) {
      console.error(err);
    }
  };

  if (client === undefined) {
    return (
      <Layout>
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm font-semibold text-slate-600">Loading your athlete dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (client === null) {
    return (
      <Layout>
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-rose-800">No Athlete Profile Linked</h2>
          <p className="mt-2 text-sm text-rose-600">
            Your client profile is currently pending activation by your head coach.
          </p>
        </div>
      </Layout>
    );
  }

  const workouts = client.workouts || [];
  const completed = workouts.filter((w) => w.done).length;
  const total = workouts.length;
  const progress = total ? (completed / total) * 100 : 0;
  const nextWorkout = workouts.find((w) => !w.done) || workouts[0];
  const latestCheckin = (client.checkIns || []).slice(-1)[0];
  const recentCheckins = (client.checkIns || []).slice(-7);

  const averageEnergy = recentCheckins.length
    ? (
        recentCheckins.reduce((sum, item) => sum + Number(item.energy || 0), 0) /
        recentCheckins.length
      ).toFixed(1)
    : "-";

  const averageSleep = recentCheckins.length
    ? (
        recentCheckins.reduce((sum, item) => sum + Number(item.sleep || 0), 0) /
        recentCheckins.length
      ).toFixed(1)
    : "-";

  const programExercises = programs.flatMap((program) => program.exercises || []);
  const completedProgramExercises = programExercises.filter((exercise) => exercise.done).length;
  const programProgress = programExercises.length
    ? Math.round((completedProgramExercises / programExercises.length) * 100)
    : 0;

  const coachNotes = (client.notes || []).slice(-3).reverse();
  const upcomingSessions = (client.sessions || [])
    .filter((session) => session.status !== "Completed")
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 3);
  const recentMessages = (client.messages || []).slice(-4).reverse();
  const todayStr = new Date().toISOString().split("T")[0];
  const todayNutrition = (client.nutritionLogs || []).find((l) => l.date === todayStr) ||
    (client.nutritionLogs || []).slice(-1)[0] || null;
  const latestMetric = (client.bodyMetrics || []).slice(-1)[0] || null;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero Card */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                Athlete Command Center
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl lg:text-4xl">
                Welcome back, {client.name}
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Goal: <span className="font-semibold text-white">{client.goal || "Peak Performance & Hypertrophy"}</span> • Daily plan loaded and synced.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-300">Live Sync</span>
              </div>
              <Link
                to="/messages"
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500"
              >
                <MessageSquare className="h-4 w-4" />
                Open Coach Chat
              </Link>
            </div>
          </div>
        </section>

        {/* 4 Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass-panel group relative overflow-hidden rounded-[24px] p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Workouts Finished</span>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{completed}</span>
              <span className="text-sm font-semibold text-slate-400">/ {total} Total</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="glass-panel group relative overflow-hidden rounded-[24px] p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Energy</span>
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Zap className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{averageEnergy}</span>
              <span className="text-sm font-semibold text-slate-400">{averageEnergy !== "-" ? "/ 10" : "No logs"}</span>
            </div>
            <p className="mt-3 text-xs text-slate-500">Last 7 logged check-ins</p>
          </div>

          <div className="glass-panel group relative overflow-hidden rounded-[24px] p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Sleep</span>
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Moon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{averageSleep}</span>
              <span className="text-sm font-semibold text-slate-400">{averageSleep !== "-" ? "hrs / night" : "No logs"}</span>
            </div>
            <p className="mt-3 text-xs text-slate-500">Recovery baseline signal</p>
          </div>

          <div className="glass-panel group relative overflow-hidden rounded-[24px] p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Program Progress</span>
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-600">{programProgress}%</span>
              <span className="text-xs font-semibold text-slate-400">{completedProgramExercises}/{programExercises.length || 0} exercises</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${programProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2-Column Cockpit */}
        <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Left Column: Workouts, Programs & Analytics */}
          <div className="space-y-6">
            {/* Spotlight: Next Recommended Workout */}
            {nextWorkout && (
              <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-6 text-white shadow-lg shadow-indigo-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                      Recommended Next Session
                    </span>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    nextWorkout.done ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  }`}>
                    {nextWorkout.done ? "Completed" : "Ready to Train"}
                  </span>
                </div>

                <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-2xl font-black text-white">{nextWorkout.name}</h3>
                    <p className="mt-1 text-xs text-indigo-200">
                      Assigned by coach • Check off when finished or log sets in program below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleWorkout(nextWorkout._id)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold shadow-md transition ${
                      nextWorkout.done
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {nextWorkout.done ? "Mark as Pending" : "Mark as Completed"}
                  </button>
                </div>
              </div>
            )}

            {/* Rest Stopwatch for Workout Interval Management */}
            <RestTimer />

            {/* My Active Programs */}
            <div className="glass-panel rounded-[28px] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Assigned Training Programs</h2>
                  <p className="text-xs text-slate-500">Tap checkboxes to log completed sets</p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {programs.length} active
                </span>
              </div>

              {programs.length > 0 ? (
                <div className="space-y-4">
                  {programs.map((program) => {
                    const doneCount = program.exercises.filter((ex) => ex.done).length;
                    const percent = program.exercises.length
                      ? Math.round((doneCount / program.exercises.length) * 100)
                      : 0;

                    return (
                      <div
                        key={program._id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <h3 className="font-bold text-slate-900">{program.name}</h3>
                            {program.description && (
                              <p className="mt-0.5 text-xs text-slate-500">"{program.description}"</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">
                              {doneCount} / {program.exercises.length} Done ({percent}%)
                            </span>
                          </div>
                        </div>

                        {/* Exercise Checklist */}
                        <div className="mt-3 space-y-2">
                          {program.exercises.map((exercise, idx) => (
                            <label
                              key={exercise._id || idx}
                              className={`flex cursor-pointer items-center justify-between rounded-xl p-3 transition ${
                                exercise.done
                                  ? "bg-slate-50 border border-slate-100 text-slate-400"
                                  : "bg-slate-50/60 border border-slate-200/80 hover:bg-indigo-50/40 text-slate-800"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={Boolean(exercise.done)}
                                  onChange={() => toggleProgramExercise(program._id, exercise._id)}
                                  className="h-4 w-4 rounded accent-indigo-600"
                                />
                                <span
                                  className={`text-sm font-semibold ${
                                    exercise.done ? "line-through text-slate-400" : "text-slate-800"
                                  }`}
                                >
                                  {exercise.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                <span className="rounded bg-white px-2 py-0.5 shadow-sm">
                                  {exercise.sets} × {exercise.reps}
                                </span>
                                {exercise.rest && (
                                  <span className="hidden sm:inline text-slate-400">
                                    • {exercise.rest}
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400">
                  <Dumbbell className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm font-semibold text-slate-600">No active program assigned</p>
                  <p className="text-xs">Your coach will assign your training block shortly.</p>
                </div>
              )}
            </div>

            {/* Daily Workouts Roster */}
            <div className="glass-panel rounded-[28px] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Workout Roster</h2>
                  <p className="text-xs text-slate-500">Comprehensive schedule</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {workouts.length} total
                </span>
              </div>

              {workouts.length === 0 ? (
                <p className="text-xs text-slate-400">No standalone workouts assigned.</p>
              ) : (
                <ul className="space-y-2">
                  {workouts.map((w) => (
                    <li
                      key={w._id}
                      className={`flex items-center justify-between rounded-xl border p-3.5 transition ${
                        w.done
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={w.done}
                          onChange={() => toggleWorkout(w._id)}
                          className="h-4 w-4 rounded accent-emerald-600"
                        />
                        <span
                          className={`text-sm font-semibold ${
                            w.done ? "line-through text-slate-400" : "text-slate-800"
                          }`}
                        >
                          {w.name}
                        </span>
                      </label>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          w.done
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {w.done ? "Completed" : "Pending"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Energy Trend Visualization */}
            <div className="glass-panel rounded-[28px] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Energy & Recovery Trend</h2>
                  <p className="text-xs text-slate-500">Last 7 logged check-ins</p>
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>

              {recentCheckins.length > 0 ? (
                <div className="flex h-32 items-end gap-2 sm:gap-4 pt-4">
                  {recentCheckins.map((item, index) => {
                    const energyVal = Number(item.energy || 0);
                    return (
                      <div
                        key={item._id || index}
                        className="group flex min-w-0 flex-1 flex-col items-center gap-2"
                      >
                        <span className="text-xs font-bold text-slate-600">{energyVal}/10</span>
                        <div className="flex h-20 w-full items-end rounded-xl bg-slate-100 px-1 py-1">
                          <div
                            className={`w-full rounded-lg transition-all duration-300 ${
                              energyVal >= 8
                                ? "bg-gradient-to-t from-emerald-500 to-green-400"
                                : energyVal >= 6
                                ? "bg-gradient-to-t from-blue-500 to-cyan-400"
                                : "bg-gradient-to-t from-amber-500 to-orange-400"
                            }`}
                            style={{ height: `${Math.max(energyVal * 10, 10)}%` }}
                          />
                        </div>
                        <span className="truncate text-[10px] font-semibold text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString([], { weekday: "short" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Log your daily check-in on the right to visualize your energy curve.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Check-in, Upcoming Sessions & Coach Feed */}
          <div className="space-y-6">
            {/* Nutrition & Habits Quick Snapshot */}
            <div className="glass-panel rounded-[28px] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Nutrition & Daily Habits</h2>
                  <p className="text-xs text-slate-500">Metabolic targets & progress</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                  <Salad className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-3.5">
                {/* Calories */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Flame className="h-4 w-4 text-orange-500" />
                      Calories
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {todayNutrition?.calories || 0} / {client?.nutritionTargets?.calories || client?.nutritionTargets?.dailyCalories || 2200} kcal
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((todayNutrition?.calories || 0) /
                              (client?.nutritionTargets?.calories || client?.nutritionTargets?.dailyCalories || 2200)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Hydration & Steps 2-Col */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Droplets className="h-3.5 w-3.5 text-sky-500" />
                      Hydration
                    </div>
                    <p className="mt-1 text-sm font-black text-slate-900 font-mono">
                      {(((todayNutrition?.water || todayNutrition?.waterMl || 0)) / 1000).toFixed(1)}L
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Target: {(((client?.nutritionTargets?.water || client?.nutritionTargets?.waterMl || 3000)) / 1000).toFixed(1)}L
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                      Daily Steps
                    </div>
                    <p className="mt-1 text-sm font-black text-slate-900 font-mono">
                      {(todayNutrition?.steps || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Target: {(client?.nutritionTargets?.steps || client?.nutritionTargets?.dailySteps || 10000).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Weigh-in metric */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
                      <Scale className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Latest Weigh-In
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {latestMetric?.weight ? `${latestMetric.weight} kg` : "No weigh-in yet"}
                      </span>
                    </div>
                  </div>
                  {(latestMetric?.bodyFat !== undefined && latestMetric?.bodyFat !== null) ||
                  (latestMetric?.bodyFatPercent !== undefined && latestMetric?.bodyFatPercent !== null) ? (
                    <span className="rounded-lg bg-purple-50 px-2 py-1 text-xs font-bold text-purple-700">
                      {latestMetric.bodyFat ?? latestMetric.bodyFatPercent}% BF
                    </span>
                  ) : null}
                </div>

                {/* Link to full nutrition page */}
                <Link
                  to="/nutrition"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:shadow-md hover:from-emerald-700 hover:to-teal-700"
                >
                  <Salad className="h-4 w-4" />
                  Full Nutrition & Habits Tracker
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Daily Check-in Widget */}
            <div className="glass-panel rounded-[28px] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Daily Check-In</h2>
                  <p className="text-xs text-slate-500">Share your readiness score with coach</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                  <Activity className="h-4 w-4" />
                </div>
              </div>

              {checkinSavedSuccess && (
                <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Check-in saved and transmitted to coach!
                </div>
              )}

              <div className="space-y-4">
                {/* Energy Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      Energy Readiness
                    </span>
                    <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-amber-700">
                      {checkin.energy} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={checkin.energy}
                    onChange={(e) => setCheckin({ ...checkin, energy: Number(e.target.value) })}
                    className="mt-2 w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1 (Drained)</span>
                    <span>10 (Peak)</span>
                  </div>
                </div>

                {/* Sleep Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Moon className="h-3.5 w-3.5 text-blue-500" />
                      Sleep Duration
                    </span>
                    <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-blue-700">
                      {checkin.sleep} hrs
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="11"
                    step="0.5"
                    value={checkin.sleep}
                    onChange={(e) => setCheckin({ ...checkin, sleep: Number(e.target.value) })}
                    className="mt-2 w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>4 hrs</span>
                    <span>11+ hrs</span>
                  </div>
                </div>

                {/* Mood Selector Chips */}
                <div>
                  <span className="mb-2 block text-xs font-bold text-slate-700">Readiness Mood</span>
                  <div className="grid grid-cols-4 gap-2">
                    {MOODS.map((m) => {
                      const isSelected = checkin.mood === m.label;
                      return (
                        <button
                          key={m.label}
                          type="button"
                          onClick={() => setCheckin({ ...checkin, mood: m.label })}
                          className={`flex flex-col items-center justify-center rounded-xl border p-2 text-xs font-semibold transition ${
                            isSelected
                              ? m.active
                              : `border-slate-200 bg-white text-slate-700 ${m.bg}`
                          }`}
                        >
                          <span className="text-base">{m.icon}</span>
                          <span className="mt-1 text-[11px]">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Coaching Note / Soreness
                  </label>
                  <textarea
                    rows="2"
                    value={checkin.note}
                    onChange={(e) => setCheckin({ ...checkin, note: e.target.value })}
                    placeholder="Log muscle soreness, nutrition notes, or fatigue..."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={saveCheckin}
                  disabled={isSavingCheckin}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition hover:shadow-lg disabled:opacity-50"
                >
                  {isSavingCheckin ? "Saving Check-In..." : "Transmit Daily Check-In"}
                </button>
              </div>

              {/* Latest Check-in Snapshot */}
              {latestCheckin && (
                <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Latest Transmitted Check-in</span>
                    <span>{new Date(latestCheckin.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="rounded bg-white px-2 py-0.5 font-bold text-slate-800 shadow-sm">
                      ⚡ {latestCheckin.energy}/10
                    </span>
                    <span className="rounded bg-white px-2 py-0.5 font-bold text-slate-800 shadow-sm">
                      🌙 {latestCheckin.sleep}h
                    </span>
                    <span className="rounded bg-white px-2 py-0.5 font-bold text-slate-800 shadow-sm">
                      {latestCheckin.mood}
                    </span>
                  </div>
                  {latestCheckin.note && (
                    <p className="mt-2 italic text-slate-500">"{latestCheckin.note}"</p>
                  )}
                </div>
              )}
            </div>

            {/* Upcoming Sessions */}
            <div className="glass-panel rounded-[28px] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Coaching Sessions</h2>
                  <p className="text-xs text-slate-500">Upcoming booked calls & reviews</p>
                </div>
                <Calendar className="h-4 w-4 text-indigo-600" />
              </div>

              <div className="space-y-3">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session, idx) => (
                    <div
                      key={session._id || idx}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">{session.title}</p>
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                          {session.status || "Upcoming"}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {session.date} at {session.time}
                      </p>
                      <span className="mt-1 inline-block text-[11px] font-semibold text-slate-400">
                        {session.type}
                      </span>
                      {session.meetingLink && (
                        <div className="mt-3">
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
                          >
                            <Video className="h-3.5 w-3.5" />
                            Launch Video Call
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                    No upcoming video consultations scheduled.
                  </div>
                )}
              </div>
            </div>

            {/* Coach Comments */}
            <div className="glass-panel rounded-[28px] p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Coach Guidance Feed</h2>
                  <p className="text-xs text-slate-500">Direct cues from trainer</p>
                </div>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>

              <div className="space-y-2.5">
                {coachNotes.length > 0 ? (
                  coachNotes.map((note, index) => (
                    <div
                      key={note._id || index}
                      className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3.5 text-xs text-slate-700 shadow-sm"
                    >
                      <p className="font-medium leading-relaxed">{note.text}</p>
                      {(note.createdAt || note.date) && (
                        <span className="mt-1.5 block text-[10px] text-indigo-500 font-semibold">
                          {new Date(note.createdAt || note.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No notes posted yet by your coach.</p>
                )}
              </div>
            </div>

            {/* Quick Coach Message */}
            <div className="glass-panel rounded-[28px] p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Send Coach Message</h2>
                <Link
                  to="/messages"
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Full Chat <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-2">
                <textarea
                  rows="2"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Drop a quick note, question, or win..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSendingMessage}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSendingMessage ? "Sending..." : "Send to Coach"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ClientDashboard;