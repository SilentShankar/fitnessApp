import Layout from "../components/Layout";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import {
  Users,
  Flame,
  Dumbbell,
  Clock3,
  TrendingUp,
  CalendarDays,
  Plus,
  MessageSquare,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  Video,
  ChevronRight,
  Sparkles,
  Salad,
  Droplets,
  Scale,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    clients: 0,
    workouts: 0,
    calories: 0,
    time: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await API.get("/clients");
      setClients(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalClients = clients.length;
  const allWorkouts = clients.flatMap((c) => c.workouts || []);
  const totalWorkouts = allWorkouts.length;
  const completed = allWorkouts.filter((w) => w.done).length;
  const remaining = totalWorkouts - completed;

  const calories = completed * 50;
  const time = (completed * 5) / 60;

  useEffect(() => {
    let timer;
    const stepAnimation = () => {
      setStats((prev) => {
        const nextClients = prev.clients < totalClients
          ? Math.min(totalClients, prev.clients + Math.ceil((totalClients - prev.clients) / 5))
          : totalClients;
        const nextWorkouts = prev.workouts < totalWorkouts
          ? Math.min(totalWorkouts, prev.workouts + Math.ceil((totalWorkouts - prev.workouts) / 5))
          : totalWorkouts;
        const nextCalories = prev.calories < calories
          ? Math.min(calories, prev.calories + Math.ceil((calories - prev.calories) / 5))
          : calories;
        const nextTime = prev.time < time
          ? Math.min(time, Number((prev.time + Math.max(0.05, (time - prev.time) / 5)).toFixed(2)))
          : time;

        const isDone =
          nextClients === totalClients &&
          nextWorkouts === totalWorkouts &&
          nextCalories === calories &&
          nextTime >= time;

        if (!isDone) {
          timer = setTimeout(stepAnimation, 40);
        }

        return {
          clients: nextClients,
          workouts: nextWorkouts,
          calories: nextCalories,
          time: nextTime,
        };
      });
    };

    timer = setTimeout(stepAnimation, 40);
    return () => clearTimeout(timer);
  }, [totalClients, totalWorkouts, calories, time]);

  const percent = totalWorkouts === 0 ? 0 : Math.round((completed / totalWorkouts) * 100);

  const liveClients = clients.filter((client) => (client.workouts || []).length > 0).length;
  const focusList = clients.slice(0, 4).map((client) => ({
    name: client.name,
    progress: client.workouts?.length
      ? Math.round((client.workouts.filter((w) => w.done).length / client.workouts.length) * 100)
      : 0,
    total: client.workouts?.length || 0,
    done: client.workouts?.filter((w) => w.done).length || 0,
  }));

  const checkinFeed = clients
    .map((client) => {
      const latest = (client.checkIns || []).slice(-1)[0];
      return latest ? { ...latest, clientName: client.name } : null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const checkinsNeedingAttention = checkinFeed.filter(
    (checkin) => checkin.energy <= 4 || checkin.mood === "Low"
  ).length;

  const upcomingSessions = clients
    .flatMap((client) => (client.sessions || []).map((session) => ({
      ...session,
      clientName: client.name,
    })))
    .filter((session) => session.status !== "Completed")
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 4);

  const coachNotes = clients
    .flatMap((client) => (client.notes || []).map((note) => ({
      ...note,
      clientName: client.name,
    })))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  const nutritionSummary = clients.map((c) => {
    const latestLog = (c.nutritionLogs || []).slice(-1)[0] || null;
    const latestMetric = (c.bodyMetrics || []).slice(-1)[0] || null;
    const targetCalories = c.nutritionTargets?.calories || c.nutritionTargets?.dailyCalories || 2400;
    const targetWater = c.nutritionTargets?.water || c.nutritionTargets?.waterMl || 3000;
    const loggedCalories = latestLog?.calories || 0;
    const calorieAdherence = targetCalories > 0 ? Math.round((loggedCalories / targetCalories) * 100) : 0;
    return {
      _id: c._id,
      name: c.name,
      avatar: c.name.charAt(0),
      latestLog,
      latestMetric,
      targetCalories,
      targetWater,
      calorieAdherence,
    };
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Executive Banner */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-white/10">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                <Sparkles size={13} className="text-blue-400" />
                Performance Operations
              </div>
              <h1 className="mt-2.5 text-2xl sm:text-3xl font-black tracking-tight text-white">
                Executive Fitness Cockpit
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Real-time athlete compliance, scheduled sessions, and physiological recovery trends.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]" />
                Live Sync Engine Active
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="relative z-10 mt-6 flex flex-wrap gap-2.5 pt-5 border-t border-white/10">
            <button
              onClick={() => navigate("/clients")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <Users size={14} className="text-blue-300" />
              Manage Roster
            </button>
            <button
              onClick={() => navigate("/programs")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <Dumbbell size={14} className="text-indigo-300" />
              Build Program
            </button>
            <button
              onClick={() => navigate("/schedule")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <CalendarDays size={14} className="text-emerald-300" />
              Book Session
            </button>
            <button
              onClick={() => navigate("/nutrition")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <Salad size={14} className="text-emerald-300" />
              Nutrition & Habits
            </button>
            <button
              onClick={() => navigate("/messages")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <MessageSquare size={14} className="text-sky-300" />
              Athlete Messages
            </button>
          </div>
        </section>

        {/* 4 Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Enrolled Athletes"
            value={stats.clients}
            icon={Users}
            trend="+100% Active"
            accent="from-blue-600 to-indigo-600"
            iconColor="text-blue-600 bg-blue-50 border-blue-200"
          />
          <StatCard
            title="Assigned Workouts"
            value={stats.workouts}
            icon={Dumbbell}
            trend={`${percent}% Completed`}
            accent="from-emerald-600 to-teal-600"
            iconColor="text-emerald-600 bg-emerald-50 border-emerald-200"
          />
          <StatCard
            title="Burned Calories"
            value={stats.calories.toLocaleString()}
            icon={Flame}
            trend="Est. metabolic load"
            accent="from-amber-500 to-orange-600"
            iconColor="text-orange-600 bg-orange-50 border-orange-200"
          />
          <StatCard
            title="Training Volume"
            value={`${stats.time.toFixed(1)}h`}
            icon={Clock3}
            trend="Logged workout time"
            accent="from-violet-600 to-purple-600"
            iconColor="text-violet-600 bg-violet-50 border-violet-200"
          />
        </div>

        {/* Charts & Completion */}
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Athlete Workout Adherence</h2>
                <p className="text-xs text-slate-500">Assigned vs. completed sessions per client</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                Live Data
              </span>
            </div>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={clients.map((c) => {
                    const total = c.workouts?.length || 0;
                    const done = c.workouts?.filter((w) => w.done).length || 0;
                    return {
                      name: c.name.split(" ")[0],
                      assigned: total,
                      completed: done,
                    };
                  })}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "14px",
                      color: "#fff",
                      fontSize: "12px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                    }}
                  />
                  <Bar dataKey="assigned" name="Assigned" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-slate-300" />
                <span>Assigned</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-blue-500" />
                <span>Completed</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[28px] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Completion Ratio</h2>
                <span className="text-xs font-semibold text-blue-600">{completed} of {totalWorkouts} done</span>
              </div>

              <div className="relative flex items-center justify-center py-2">
                <ResponsiveContainer width={240} height={240}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Completed", value: completed || 1 },
                        { name: "Remaining", value: remaining || 0 },
                      ]}
                      dataKey="value"
                      innerRadius={72}
                      outerRadius={95}
                      paddingAngle={4}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#6366f1" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute flex flex-col items-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">{percent}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Progress</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Completed</span>
                <p className="mt-1 text-2xl font-black text-emerald-900">{completed}</p>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Pending</span>
                <p className="mt-1 text-2xl font-black text-indigo-900">{remaining}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions & Coach Notes */}
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {/* Upcoming sessions */}
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Upcoming Live Sessions</h2>
                <p className="text-xs text-slate-500">Next confirmed athlete appointments</p>
              </div>
              <button
                onClick={() => navigate("/schedule")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <Plus size={13} />
                Book Slot
              </button>
            </div>

            <div className="space-y-3">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session, index) => (
                  <div
                    key={`${session.clientName}-${session._id || index}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 transition hover:bg-white hover:border-blue-200 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">{session.clientName}</span>
                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
                          {session.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{session.title}</p>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        {session.date} at {session.time}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {session.meetingLink && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Video size={13} />
                          Join
                        </a>
                      )}
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          session.status === "Confirmed"
                            ? "bg-emerald-100 text-emerald-700"
                            : session.status === "Pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-sm text-slate-400">
                  No upcoming sessions booked. Use the button above to schedule.
                </div>
              )}
            </div>
          </div>

          {/* Coach notes */}
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Recent Coach Notes</h2>
                <p className="text-xs text-slate-500">Cues & reminders for athlete sessions</p>
              </div>
              <button
                onClick={() => navigate("/clients")}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View all →
              </button>
            </div>

            <div className="space-y-3">
              {coachNotes.length > 0 ? (
                coachNotes.map((item, index) => (
                  <div key={item._id || index} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 transition hover:bg-white hover:border-slate-300">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">{item.clientName}</span>
                      {item.createdAt && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{item.text}"</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-sm text-slate-400">
                  No coach notes added yet. Add notes from the Clients page.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client Focus & Real-time Check-ins */}
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {/* Client Progress Overview */}
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Athlete Roster Progress</h2>
                <p className="text-xs text-slate-500">{liveClients} active athletes with assigned workouts</p>
              </div>
              <Link to="/clients" className="text-xs font-bold text-blue-600 hover:underline">
                Manage roster →
              </Link>
            </div>

            {clients.length === 0 ? (
              <p className="text-sm text-slate-400">No athletes enrolled yet.</p>
            ) : (
              <div className="space-y-4">
                {clients.map((c) => {
                  const total = c.workouts?.length || 0;
                  const done = c.workouts?.filter((w) => w.done).length || 0;
                  const prog = total ? Math.round((done / total) * 100) : 0;

                  return (
                    <div key={c._id} className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 transition hover:bg-white hover:border-blue-200">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white text-xs">
                            {c.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-800">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono">{done}/{total} done</span>
                          <span className="font-bold text-slate-900">{prog}%</span>
                        </div>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                          style={{ width: `${prog}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Focus Board Priorities */}
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Focus Board</h2>
                <p className="text-xs text-slate-500">Highest attention athlete routines</p>
              </div>
              <span className="text-xs font-bold text-indigo-600">Weekly Target</span>
            </div>

            <div className="space-y-3">
              {focusList.map((item) => (
                <div key={item.name} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="font-semibold text-slate-600">{item.progress}% completed</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Recovery Check-ins */}
        <section className="glass-panel rounded-[28px] p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Athlete Recovery & Readiness Feed</h2>
              <p className="text-xs text-slate-500">Daily morning signals submitted by your athletes.</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                checkinsNeedingAttention > 0
                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                  : "bg-emerald-100 text-emerald-700 border border-emerald-200"
              }`}
            >
              {checkinsNeedingAttention > 0
                ? `${checkinsNeedingAttention} athletes need attention`
                : "All athletes trending steady"}
            </span>
          </div>

          {checkinFeed.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-sm text-slate-400">
              No daily check-ins submitted yet. Athletes can log energy and sleep from their dashboard.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {checkinFeed.slice(0, 6).map((checkin) => {
                const needsAttention = checkin.energy <= 4 || checkin.mood === "Low";

                return (
                  <div
                    key={`${checkin.clientName}-${checkin.createdAt}`}
                    className={`rounded-2xl border p-4 transition ${
                      needsAttention
                        ? "border-amber-200 bg-amber-50/30"
                        : "border-slate-200/80 bg-slate-50/80 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{checkin.clientName}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(checkin.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          needsAttention ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {needsAttention ? "Review" : "On Track"}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-xl border border-slate-100 bg-white p-2">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Energy</span>
                        <p className="mt-0.5 font-bold text-slate-900">{checkin.energy}/10</p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-white p-2">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Sleep</span>
                        <p className="mt-0.5 font-bold text-slate-900">{checkin.sleep}h</p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-white p-2">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Mood</span>
                        <p className="mt-0.5 truncate font-bold text-slate-900">{checkin.mood}</p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-600 line-clamp-2 italic">
                      "{checkin.note || "No comments added."}"
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Athlete Nutrition, Hydration & Transformation Cockpit */}
        <section className="glass-panel rounded-[28px] p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <Salad size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Athlete Nutrition & Body Composition Oversight
                </h2>
                <p className="text-xs text-slate-500">
                  Daily macro adherence, hydration volumes, step consistency, and weigh-in trend tracking
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/nutrition")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Open Nutrition Manager
              <ChevronRight size={14} />
            </button>
          </div>

          {nutritionSummary.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-sm text-slate-400">
              No athletes found. Add athletes from the Clients page to assign nutrition targets.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nutritionSummary.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 transition hover:bg-white hover:border-emerald-200 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 font-bold text-white text-xs">
                        {item.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{item.name}</h3>
                        <p className="text-[11px] text-slate-400">
                          {item.latestLog ? `Logged ${item.latestLog.date}` : "No daily log yet"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/nutrition?client=${item._id}`)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition"
                      title="Inspect & Adjust Targets"
                    >
                      <ArrowUpRight size={15} />
                    </button>
                  </div>

                  {/* Macro adherence progress */}
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 font-semibold text-slate-600">
                        <Flame size={12} className="text-orange-500" />
                        Calories
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {item.latestLog?.calories || 0} / {item.targetCalories} kcal
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.calorieAdherence > 110
                            ? "bg-amber-500"
                            : item.calorieAdherence >= 80
                            ? "bg-emerald-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.min(100, item.calorieAdherence)}%` }}
                      />
                    </div>
                  </div>

                  {/* 3 mini stats: Hydration, Steps, Weight */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl border border-slate-100 bg-white p-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Water</span>
                      <span className="font-bold text-slate-800 font-mono text-[11px]">
                        {(item.latestLog?.water || item.latestLog?.waterMl) ? `${(((item.latestLog.water || item.latestLog.waterMl)) / 1000).toFixed(1)}L` : "-"}
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white p-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Steps</span>
                      <span className="font-bold text-slate-800 font-mono text-[11px]">
                        {item.latestLog?.steps ? item.latestLog.steps.toLocaleString() : "-"}
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white p-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Weight</span>
                      <span className="font-bold text-slate-800 font-mono text-[11px]">
                        {item.latestMetric?.weight ? `${item.latestMetric.weight}kg` : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, trend, accent, iconColor }) {
  return (
    <div className="glass-panel rounded-[24px] p-5 card-hover-lift">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="mt-2 text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
          <p className="mt-1.5 text-xs font-medium text-slate-400">{trend}</p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${iconColor} shadow-sm`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;