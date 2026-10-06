import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import API from "../api";
import { CheckCircle2, CalendarDays, Clock, Video } from "lucide-react";

function Schedule() {
  const getTodayDate = () => new Date().toISOString().slice(0, 10);

  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [toast, setToast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState({
    title: "1:1 Coaching Session",
    date: getTodayDate(),
    time: "18:00",
    type: "Strength",
    status: "Confirmed",
    meetingLink: "",
  });

  const showToast = useCallback((msg) => {
    setToast(msg);
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await API.get("/clients");
      setClients(res.data);
      if (res.data[0] && !selectedClientId) {
        setSelectedClientId(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedClientId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addSession = async () => {
    if (!selectedClientId) {
      showToast("Please choose a client");
      return;
    }
    if (!session.title.trim()) {
      showToast("Session title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post(`/clients/${selectedClientId}/session`, session);
      setSession({
        title: "1:1 Coaching Session",
        date: getTodayDate(),
        time: "18:00",
        type: "Strength",
        status: "Confirmed",
        meetingLink: "",
      });
      await fetchClients();
      showToast("Session scheduled successfully ✅");
    } catch (err) {
      showToast(err.response?.data?.msg || "Unable to schedule session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSessionStatus = async (clientId, sessionId, status) => {
    try {
      await API.put(`/clients/${clientId}/session/${sessionId}`, { status });
      await fetchClients();
      showToast(`Session marked as ${status}`);
    } catch (err) {
      showToast(err.response?.data?.msg || "Unable to update session");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6 p-2">
        {toast && (
          <div className="fixed right-6 top-6 z-[100] flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toast}
          </div>
        )}

        <section className="rounded-[28px] bg-gradient-to-r from-slate-900 via-indigo-900 to-sky-900 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">Online coach operations</p>
          <h1 className="mt-2 text-3xl font-black">Session planner</h1>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-slate-800">Book a coaching session</h2>
            </div>

            <div className="space-y-4 text-sm">
              <label className="block">
                <span className="mb-1 block text-slate-600">Client</span>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
                >
                  {clients.length === 0 ? (
                    <option value="">No clients available</option>
                  ) : (
                    clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-slate-600">Session title</span>
                <input
                  value={session.title}
                  onChange={(e) => setSession({ ...session, title: e.target.value })}
                  placeholder="e.g. 1:1 Movement Review"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-slate-600">Date</span>
                  <input
                    type="date"
                    value={session.date}
                    onChange={(e) => setSession({ ...session, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-slate-600">Time</span>
                  <input
                    type="time"
                    value={session.time}
                    onChange={(e) => setSession({ ...session, time: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-slate-600">Type</span>
                  <select
                    value={session.type}
                    onChange={(e) => setSession({ ...session, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
                  >
                    <option>Strength</option>
                    <option>Conditioning</option>
                    <option>Mobility</option>
                    <option>Recovery</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-slate-600">Status</span>
                  <select
                    value={session.status}
                    onChange={(e) => setSession({ ...session, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
                  >
                    <option>Confirmed</option>
                    <option>Pending</option>
                    <option>Booked</option>
                    <option>Completed</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-slate-600">Meeting link (Zoom, Google Meet, etc.)</span>
                <input
                  value={session.meetingLink}
                  onChange={(e) => setSession({ ...session, meetingLink: e.target.value })}
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
                />
              </label>

              <button
                onClick={addSession}
                disabled={!selectedClientId || isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Scheduling..." : "Save session"}
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Upcoming schedule</h2>
              <span className="text-xs text-slate-400">All client bookings</span>
            </div>

            <div className="space-y-3">
              {clients.flatMap((client) =>
                (client.sessions || []).map((sessionItem, idx) => (
                  <div key={`${client._id}-${sessionItem._id || idx}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">{client.name}</p>
                        <p className="text-sm text-slate-500">{sessionItem.title}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        sessionItem.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : sessionItem.status === "Completed"
                            ? "bg-slate-200 text-slate-600"
                            : sessionItem.status === "Pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {sessionItem.status || "Booked"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1 text-xs">
                        <CalendarDays size={14} className="text-blue-500" />
                        {sessionItem.date}
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <Clock size={14} className="text-indigo-500" />
                        {sessionItem.time}
                      </span>
                      <span className="text-xs text-slate-400">• {sessionItem.type}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {sessionItem.meetingLink && (
                        <a
                          href={sessionItem.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                        >
                          <Video size={13} />
                          Join link
                        </a>
                      )}
                      {sessionItem.status !== "Completed" && sessionItem.status !== "Cancelled" && (
                        <>
                          <button
                            onClick={() => updateSessionStatus(client._id, sessionItem._id, "Completed")}
                            className="text-xs font-semibold text-emerald-700 hover:underline"
                          >
                            Mark completed
                          </button>
                          <button
                            onClick={() => updateSessionStatus(client._id, sessionItem._id, "Cancelled")}
                            className="text-xs font-semibold text-red-600 hover:underline"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
              {clients.every((c) => (c.sessions || []).length === 0) && (
                <p className="py-6 text-center text-sm text-slate-400">
                  No sessions booked yet. Use the booking form on the left.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Schedule;
