import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import API from "../api";

function ClientDashboard() {
  const [client, setClient] = useState(undefined);
  const [programs, setPrograms] = useState([]);
  const [today, setToday] = useState(new Date());
  const [newMessage, setNewMessage] = useState("");
  const [checkin, setCheckin] = useState({
    energy: 8,
    sleep: 7,
    mood: "Strong",
    note: "Feeling good after yesterday's recovery session.",
  });

  const saveCheckin = async () => {
    try {
      await API.post(`/clients/${client._id}/checkin`, checkin);
      fetchClient();
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await API.post(`/clients/${client._id}/message`, {
        text: newMessage,
        sender: "client",
      });
      setNewMessage("");
      fetchClient();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClient();
    fetchPrograms();

    const timer = setInterval(() => setToday(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await API.get("/programs/mine");
      setPrograms(res.data || []);
    } catch (err) {
      console.error(err);
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

  const fetchClient = async () => {
    try {
      const res = await API.get("/clients/me");
      setClient(res.data);
    } catch (err) {
      console.error(err);
      setClient(null);
    }
  };

  const toggleWorkout = async (wid) => {
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
        <div className="rounded-[28px] bg-white p-8 shadow-sm">
          <p className="text-slate-500">Loading your training plan...</p>
        </div>
      </Layout>
    );
  }

  if (client === null) {
    return (
      <Layout>
        <div className="rounded-[28px] bg-red-50 p-8 text-red-600 shadow-sm">
          No client data found. Contact your coach.
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
    ? (recentCheckins.reduce((sum, item) => sum + Number(item.energy || 0), 0) / recentCheckins.length).toFixed(1)
    : "-";
  const averageSleep = recentCheckins.length
    ? (recentCheckins.reduce((sum, item) => sum + Number(item.sleep || 0), 0) / recentCheckins.length).toFixed(1)
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

  return (
    <Layout>
      <div className="space-y-6">
        <section className="rounded-[28px] bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-950 p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.2)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Performance dashboard</p>
              <h1 className="mt-2 text-3xl font-black">Welcome back, {client.name}</h1>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-200">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
              Live training sync
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="glass-panel rounded-[24px] p-5">
            <p className="text-sm text-slate-500">Total sessions</p>
            <h3 className="mt-3 text-3xl font-black text-slate-900">{total}</h3>
          </div>

          <div className="glass-panel rounded-[24px] p-5">
            <p className="text-sm text-slate-500">Completed</p>
            <h3 className="mt-3 text-3xl font-black text-emerald-600">{completed}</h3>
          </div>

          <div className="glass-panel rounded-[24px] p-5">
            <p className="text-sm text-slate-500">Progress</p>
            <h3 className="mt-3 text-3xl font-black text-violet-600">{Math.round(progress)}%</h3>
          </div>
        </div>

        <section className="glass-panel rounded-[28px] p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Progress analytics</p>
              <h2 className="mt-1 text-lg font-bold text-slate-800">Your recent performance signals</h2>
            </div>
            <span className="text-xs text-slate-400">Based on your last {recentCheckins.length || 0} check-ins</span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Average energy</p>
              <p className="mt-2 text-3xl font-black text-emerald-900">{averageEnergy}{averageEnergy !== "-" && "/10"}</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-sm text-blue-700">Average sleep</p>
              <p className="mt-2 text-3xl font-black text-blue-900">{averageSleep}{averageSleep !== "-" && "h"}</p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-4">
              <p className="text-sm text-violet-700">Program completion</p>
              <p className="mt-2 text-3xl font-black text-violet-900">{programProgress}%</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Energy trend</p>
              <span className="text-xs text-slate-400">Newest on the right</span>
            </div>
            {recentCheckins.length > 0 ? (
              <div className="flex h-28 items-end gap-2 sm:gap-3">
                {recentCheckins.map((item, index) => (
                  <div key={item._id || index} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">{item.energy}/10</span>
                    <div className="flex h-16 w-full items-end rounded-lg bg-slate-200 px-1">
                      <div className="w-full rounded-md bg-gradient-to-t from-blue-600 to-cyan-400 transition-all" style={{ height: `${Math.max(Number(item.energy || 0) * 10, 8)}%` }} />
                    </div>
                    <span className="truncate text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString([], { weekday: "short" })}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Complete a daily check-in to start your trend.</p>
            )}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Your workouts</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                {today.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>

            {workouts.length === 0 ? (
              <p className="text-slate-500">No workouts assigned yet.</p>
            ) : (
              <ul className="space-y-3">
                {workouts.map((w) => (
                  <li
                    key={w._id}
                    className={`flex items-center justify-between rounded-2xl border p-4 transition ${
                      w.done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={w.done}
                        onChange={() => toggleWorkout(w._id)}
                        className="h-4 w-4 accent-emerald-500"
                      />
                      <span className={`font-medium ${w.done ? "text-slate-400 line-through" : "text-slate-700"}`}>
                        {w.name}
                      </span>
                    </label>

                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${w.done ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {w.done ? "Completed" : "Pending"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-[28px] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">My programs</h2>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{programs.length} active</span>
              </div>

              {programs.length > 0 ? programs.slice(0, 2).map((program) => (
                <div key={program._id} className="mb-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 last:mb-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-800">{program.name}</p>
                    <span className="text-xs font-semibold text-blue-700">
                      {program.exercises.filter((exercise) => exercise.done).length}/{program.exercises.length}
                    </span>
                  </div>
                  {program.description && <p className="mt-1 text-sm text-slate-600">{program.description}</p>}
                  <div className="mt-3 space-y-2">
                    {program.exercises.map((exercise, index) => (
                      <label key={`${exercise.name}-${index}`} className={`flex cursor-pointer items-center justify-between rounded-xl bg-white px-3 py-2 text-sm ${exercise.done ? "opacity-60" : ""}`}>
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(exercise.done)}
                            onChange={() => toggleProgramExercise(program._id, exercise._id)}
                            className="h-4 w-4 accent-blue-600"
                          />
                          <span className={`font-medium text-slate-700 ${exercise.done ? "line-through" : ""}`}>{exercise.name}</span>
                        </span>
                        <span className="text-xs text-slate-500">{exercise.sets} x {exercise.reps}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500">Your coach has not assigned a program yet.</p>
              )}
            </div>

            <div className="glass-panel rounded-[28px] p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-800">Progress</h2>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Today</span>
                <span className="font-semibold text-slate-700">{Math.round(progress)}%</span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-800">Daily check-in</h2>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Energy</span>
                  <span className="font-semibold text-slate-800">{checkin.energy}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkin.energy}
                  onChange={(e) => setCheckin({ ...checkin, energy: Number(e.target.value) })}
                  className="w-full accent-emerald-500"
                />

                <div className="flex items-center justify-between">
                  <span>Sleep</span>
                  <span className="font-semibold text-slate-800">{checkin.sleep}h</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  value={checkin.sleep}
                  onChange={(e) => setCheckin({ ...checkin, sleep: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />

                <label className="block">
                  <span className="mb-1 block">Mood</span>
                  <select
                    value={checkin.mood}
                    onChange={(e) => setCheckin({ ...checkin, mood: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700"
                  >
                    <option>Strong</option>
                    <option>Good</option>
                    <option>Okay</option>
                    <option>Low</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block">Coach note</span>
                  <textarea
                    rows="3"
                    value={checkin.note}
                    onChange={(e) => setCheckin({ ...checkin, note: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700"
                  />
                </label>

                <button
                  onClick={saveCheckin}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/20"
                >
                  Save check-in
                </button>
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-800">Latest check-in</h2>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-800">Energy:</span> {latestCheckin ? `${latestCheckin.energy}/10` : "No check-in yet"}</p>
                <p><span className="font-semibold text-slate-800">Sleep:</span> {latestCheckin ? `${latestCheckin.sleep}h` : "-"}</p>
                <p><span className="font-semibold text-slate-800">Mood:</span> {latestCheckin ? latestCheckin.mood : "-"}</p>
                <p className="mt-2 text-slate-500">{latestCheckin ? latestCheckin.note : "Fill your daily check-in to share how you’re feeling."}</p>
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-800">Next focus</h2>
              <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 p-4 text-white">
                <div className="text-xs uppercase tracking-[0.18em] text-blue-100">Recommended</div>
                <div className="mt-2 text-xl font-bold">{nextWorkout ? nextWorkout.name : "Rest & recovery"}</div>
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-800">Coach comments</h2>
              <div className="space-y-3">
                {coachNotes.length > 0 ? coachNotes.map((note, index) => (
                  <div key={note._id || index} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    {note.text}
                  </div>
                )) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                    No coach notes yet.
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-800">Upcoming sessions</h2>
              <div className="space-y-3">
                {upcomingSessions.length > 0 ? upcomingSessions.map((session, index) => (
                  <div key={session._id || index} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-800">{session.title}</p>
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                        {session.status || "Booked"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{session.date} • {session.time}</p>
                    <p className="text-xs text-slate-400">{session.type}</p>
                    {session.meetingLink && (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        Join session
                      </a>
                    )}
                  </div>
                )) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                    No sessions booked yet.
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-800">Messages</h2>
              <div className="space-y-3">
                {recentMessages.length > 0 ? recentMessages.map((message, index) => (
                  <div key={message._id || index} className={`rounded-2xl p-3 text-sm ${message.sender === "client" ? "bg-blue-50 text-blue-900" : "bg-slate-50 text-slate-700"}`}>
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {message.sender === "client" ? "You" : "Coach"}
                    </div>
                    <p>{message.text}</p>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                    No messages yet.
                  </div>
                )}

                <div className="mt-3 space-y-2">
                  <textarea
                    rows="3"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700"
                    placeholder="Send a message to your coach..."
                  />
                  <button
                    onClick={sendMessage}
                    className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-3 py-2.5 font-semibold text-white"
                  >
                    Send message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ClientDashboard;