import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await API.get("/clients");
      setClients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const totalClients = clients.length;
  const allWorkouts = clients.flatMap((c) => c.workouts || []);
  const totalWorkouts = allWorkouts.length;
  const completed = allWorkouts.filter((w) => w.done).length;
  const remaining = totalWorkouts - completed;

  const calories = completed * 50;
  const time = (completed * 5) / 60;

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        clients: animate(prev.clients, totalClients),
        workouts: animate(prev.workouts, totalWorkouts),
        calories: animate(prev.calories, calories),
        time: animate(prev.time, time),
      }));
    }, 30);

    return () => clearInterval(interval);
  }, [totalClients, totalWorkouts, calories, time]);

  const animate = (current, target) => {
    if (current < target) {
      return current + Math.ceil((target - current) / 10);
    }
    return target;
  };

  const percent = totalWorkouts === 0 ? 0 : Math.round((completed / totalWorkouts) * 100);

  const liveClients = clients.filter((client) => (client.workouts || []).length > 0).length;
  const focusList = clients.slice(0, 3).map((client) => ({
    name: client.name,
    progress: client.workouts?.length
      ? Math.round((client.workouts.filter((w) => w.done).length / client.workouts.length) * 100)
      : 0,
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
    .slice(0, 3);

  const coachNotes = clients
    .flatMap((client) => (client.notes || []).map((note) => ({
      ...note,
      clientName: client.name,
    })))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <Layout>
      <div className="space-y-8">
        <section className="rounded-[28px] bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 p-6 text-white shadow-[0_20px_50px_rgba(30,41,59,0.3)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Real-time performance</p>
              <h1 className="mt-2 text-3xl font-black">Executive fitness overview</h1>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-200">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
              Live sync active
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-4">
          <StatCard title="Clients" value={stats.clients} icon="👥" accent="from-blue-500 to-indigo-500" />
          <StatCard title="Calories" value={stats.calories} icon="🔥" accent="from-orange-500 to-amber-500" />
          <StatCard title="Workouts" value={stats.workouts} icon="🏋️" accent="from-emerald-500 to-green-500" />
          <StatCard title="Time" value={`${stats.time.toFixed(1)}h`} icon="⏱️" accent="from-violet-500 to-purple-500" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Upcoming sessions</h2>
              <button
                onClick={() => navigate("/schedule")}
                className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
              >
                + Book slot
              </button>
            </div>

            <div className="space-y-3">
              {upcomingSessions.length > 0 ? upcomingSessions.map((session, index) => (
                <div key={`${session.clientName}-${session._id || index}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="font-semibold text-slate-800">{session.clientName}</p>
                    <p className="text-sm text-slate-500">{session.title}</p>
                    <p className="text-xs text-slate-400">{session.date} • {session.time}</p>
                  </div>
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
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  No upcoming sessions booked.
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Coach notes</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Quick brief</span>
            </div>

            <div className="space-y-3">
              {coachNotes.length > 0 ? coachNotes.map((item, index) => (
                <div key={item._id || index} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-500">{item.clientName}</p>
                    {item.createdAt && <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>}
                  </div>
                  <p className="text-sm text-slate-600">{item.text}</p>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  No coach notes have been added yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Workout performance</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Updated live</span>
            </div>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={clients.map((c) => {
                    const total = c.workouts?.length || 0;
                    const done = c.workouts?.filter((w) => w.done).length || 0;
                    return {
                      name: c.name,
                      assigned: total,
                      completed: done,
                    };
                  })}
                >
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="assigned" stackId="a" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="completed" stackId="a" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel rounded-[28px] p-6">
            <h2 className="mb-6 text-lg font-bold text-slate-800">Completion ratio</h2>

            <div className="relative flex items-center justify-center">
              <ResponsiveContainer width={260} height={260}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Completed", value: completed },
                      { name: "Remaining", value: remaining },
                    ]}
                    dataKey="value"
                    innerRadius={78}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#6366f1" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "none",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-900">{percent}%</span>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Completion</span>
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Done {completed}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-indigo-500" />
                <span className="text-slate-600">Left {remaining}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Client progress</h2>
              <span className="text-sm font-medium text-slate-500">{liveClients} active</span>
            </div>

            {clients.length === 0 ? (
              <p className="text-slate-400">No clients yet</p>
            ) : (
              <div className="space-y-5">
                {clients.map((c) => {
                  const total = c.workouts?.length || 0;
                  const done = c.workouts?.filter((w) => w.done).length || 0;
                  const progress = total ? Math.round((done / total) * 100) : 0;

                  return (
                    <div key={c._id}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700">{c.name}</span>
                        <span className="text-slate-500">{progress}%</span>
                      </div>

                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass-panel rounded-[28px] p-6">
            <h2 className="mb-5 text-lg font-bold text-slate-800">Focus board</h2>
            <div className="space-y-3">
              {focusList.map((item) => (
                <div key={item.name} className="rounded-2xl bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">{item.name}</span>
                    <span className="text-slate-500">{item.progress}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="glass-panel rounded-[28px] p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Client check-ins</h2>
              <p className="mt-1 text-sm text-slate-500">The latest recovery signal from each client.</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              checkinsNeedingAttention > 0
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}>
              {checkinsNeedingAttention > 0
                ? `${checkinsNeedingAttention} need attention`
                : "Everyone looks steady"}
            </span>
          </div>

          {checkinFeed.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
              No client check-ins have been submitted yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {checkinFeed.slice(0, 6).map((checkin) => {
                const needsAttention = checkin.energy <= 4 || checkin.mood === "Low";

                return (
                  <div key={`${checkin.clientName}-${checkin.createdAt}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">{checkin.clientName}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(checkin.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        needsAttention ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {needsAttention ? "Review" : "On track"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-xl bg-white p-2">
                        <p className="text-slate-400">Energy</p>
                        <p className="mt-1 font-bold text-slate-800">{checkin.energy}/10</p>
                      </div>
                      <div className="rounded-xl bg-white p-2">
                        <p className="text-slate-400">Sleep</p>
                        <p className="mt-1 font-bold text-slate-800">{checkin.sleep}h</p>
                      </div>
                      <div className="rounded-xl bg-white p-2">
                        <p className="text-slate-400">Mood</p>
                        <p className="mt-1 truncate font-bold text-slate-800">{checkin.mood}</p>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm text-slate-600">{checkin.note || "No note added."}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon, accent }) {
  return (
    <div className="glass-panel rounded-[24px] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">{value}</h2>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;