import { useEffect, useState, useCallback, useMemo } from "react";
import Layout from "../components/Layout";
import API from "../api";
import {
  CheckCircle2,
  CalendarDays,
  Clock,
  Video,
  Plus,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  Copy,
  Calendar,
  Sparkles,
  Trash2,
} from "lucide-react";

const sessionTypes = [
  { label: "Strength", color: "border-blue-200 bg-blue-50 text-blue-700" },
  { label: "Conditioning", color: "border-orange-200 bg-orange-50 text-orange-700" },
  { label: "Mobility", color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { label: "Recovery", color: "border-violet-200 bg-violet-50 text-violet-700" },
  { label: "Technique Review", color: "border-sky-200 bg-sky-50 text-sky-700" },
];

function Schedule() {
  const getTodayDate = () => new Date().toISOString().slice(0, 10);
  const getRelativeDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [toast, setToast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'upcoming' | 'completed' | 'cancelled'

  const [session, setSession] = useState({
    title: "1:1 Coaching & Form Check",
    date: getTodayDate(),
    time: "18:00",
    type: "Strength",
    status: "Confirmed",
    meetingLink: "https://zoom.us/j/forgefit-session",
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
      showToast("Please choose an athlete");
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
        title: "1:1 Coaching & Form Check",
        date: getTodayDate(),
        time: "18:00",
        type: "Strength",
        status: "Confirmed",
        meetingLink: "https://zoom.us/j/forgefit-session",
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Meeting link copied to clipboard 📋");
  };

  const deleteSession = async (clientId, sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      await API.delete(`/clients/${clientId}/session/${sessionId}`);
      await fetchClients();
      showToast("Session deleted 🗑️");
    } catch (err) {
      showToast(err.response?.data?.msg || "Unable to delete session");
    }
  };

  // Compile all sessions across all clients
  const allSessions = useMemo(() => {
    return clients.flatMap((client) =>
      (client.sessions || []).map((s) => ({
        ...s,
        clientId: client._id,
        clientName: client.name,
      }))
    );
  }, [clients]);

  // Filtered session list
  const filteredSessions = useMemo(() => {
    return allSessions.filter((s) => {
      // Status filter
      if (statusFilter === "upcoming" && (s.status === "Completed" || s.status === "Cancelled")) return false;
      if (statusFilter === "completed" && s.status !== "Completed") return false;
      if (statusFilter === "cancelled" && s.status !== "Cancelled") return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          s.clientName.toLowerCase().includes(query) ||
          s.title.toLowerCase().includes(query) ||
          s.type.toLowerCase().includes(query)
        );
      }
      return true;
    }).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [allSessions, statusFilter, searchQuery]);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Floating Notification */}
        {toast && (
          <div className="fixed right-6 top-6 z-[100] flex items-center gap-2 rounded-2xl bg-slate-900/95 px-4 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur-md animate-fade-in border border-white/10">
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toast}
          </div>
        )}

        {/* Page Banner */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-white/10">
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300">
                Operations & Booking
              </span>
              <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
                Coaching Session Planner
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Schedule 1:1 movement reviews, remote conditioning sessions, and video appointments.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-300">
              <Calendar size={14} />
              <span>{allSessions.length} Total Bookings</span>
            </div>
          </div>
        </section>

        {/* 2-Column: Booking Form + Schedule List */}
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          {/* Booking Form Panel */}
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <CalendarDays size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Book Coaching Session</h2>
                <p className="text-xs text-slate-400">Configure appointment details</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-600">
              {/* Client Selection */}
              <div>
                <label className="block text-slate-700 mb-1.5">Athlete</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="input-field"
                >
                  {clients.length === 0 ? (
                    <option value="">No athletes available</option>
                  ) : (
                    clients.map((client) => {
                      const athleteEmail = client.email || (typeof client.userId === "object" ? client.userId?.email : "");
                      return (
                        <option key={client._id} value={client._id}>
                          {client.name} {athleteEmail ? `(${athleteEmail})` : ""}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-700 mb-1.5">Session Title</label>
                <input
                  value={session.title}
                  onChange={(e) => setSession({ ...session, title: e.target.value })}
                  placeholder="e.g. 1:1 Movement Review & Technique Check"
                  className="input-field"
                />
              </div>

              {/* Date & Date Shortcuts */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-700">Date</label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSession({ ...session, date: getTodayDate() })}
                      className="text-[10px] rounded-md bg-slate-100 px-2 py-0.5 text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setSession({ ...session, date: getRelativeDate(1) })}
                      className="text-[10px] rounded-md bg-slate-100 px-2 py-0.5 text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setSession({ ...session, date: getRelativeDate(3) })}
                      className="text-[10px] rounded-md bg-slate-100 px-2 py-0.5 text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      In 3 Days
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={session.date}
                  onChange={(e) => setSession({ ...session, date: e.target.value })}
                  className="input-field"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-slate-700 mb-1.5">Time</label>
                <input
                  type="time"
                  value={session.time}
                  onChange={(e) => setSession({ ...session, time: e.target.value })}
                  className="input-field"
                />
              </div>

              {/* Session Type Chips */}
              <div>
                <label className="block text-slate-700 mb-1.5">Training Discipline</label>
                <div className="flex flex-wrap gap-2">
                  {sessionTypes.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setSession({ ...session, type: t.label })}
                      className={`rounded-xl border px-3 py-1.5 text-xs transition ${
                        session.type === t.label
                          ? "border-blue-500 bg-blue-600 text-white font-bold shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-slate-700 mb-1.5">Status</label>
                <select
                  value={session.status}
                  onChange={(e) => setSession({ ...session, status: e.target.value })}
                  className="input-field"
                >
                  <option>Confirmed</option>
                  <option>Pending</option>
                  <option>Booked</option>
                  <option>Completed</option>
                </select>
              </div>

              {/* Video Link */}
              <div>
                <label className="block text-slate-700 mb-1.5">Meeting Link (Zoom, Meet)</label>
                <input
                  value={session.meetingLink}
                  onChange={(e) => setSession({ ...session, meetingLink: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                  className="input-field font-mono text-xs"
                />
              </div>

              <button
                onClick={addSession}
                disabled={!selectedClientId || isSubmitting}
                className="primary-button w-full py-3 mt-4"
              >
                {isSubmitting ? "Saving Booking..." : "Confirm & Schedule Session"}
              </button>
            </div>
          </div>

          {/* Schedule Feed Panel */}
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">Scheduled Appointments</h2>
                <p className="text-xs text-slate-400">All athlete video calls & sessions</p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-48">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sessions..."
                  className="input-field pl-8 py-1.5 text-xs"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-4 flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setStatusFilter("all")}
                className={`flex-1 rounded-lg py-1.5 transition ${statusFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                All ({allSessions.length})
              </button>
              <button
                onClick={() => setStatusFilter("upcoming")}
                className={`flex-1 rounded-lg py-1.5 transition ${statusFilter === "upcoming" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`flex-1 rounded-lg py-1.5 transition ${statusFilter === "completed" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                Done
              </button>
            </div>

            {/* Session Cards */}
            <div className="space-y-3">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((sessionItem, idx) => (
                  <div
                    key={`${sessionItem.clientId}-${sessionItem._id || idx}`}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 transition-all hover:bg-white hover:border-blue-200 hover:shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{sessionItem.clientName}</span>
                          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                            {sessionItem.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{sessionItem.title}</p>
                      </div>

                      <span
                        className={`self-start rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          sessionItem.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : sessionItem.status === "Completed"
                              ? "bg-slate-200 text-slate-700"
                              : sessionItem.status === "Pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {sessionItem.status || "Booked"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-blue-500" />
                        <span className="font-medium text-slate-700">{sessionItem.date}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-indigo-500" />
                        <span className="font-medium text-slate-700">{sessionItem.time}</span>
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      {sessionItem.meetingLink ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={sessionItem.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-blue-700 transition"
                          >
                            <Video size={13} />
                            Launch Call
                          </a>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(sessionItem.meetingLink)}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-slate-800 transition"
                            title="Copy link"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">In-person session</span>
                      )}

                      <div className="flex items-center gap-2">
                        {sessionItem.status !== "Completed" && sessionItem.status !== "Cancelled" && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateSessionStatus(sessionItem.clientId, sessionItem._id, "Completed")}
                              className="font-bold text-emerald-600 hover:text-emerald-700 transition text-xs"
                            >
                              ✓ Mark Done
                            </button>
                            <button
                              onClick={() => updateSessionStatus(sessionItem.clientId, sessionItem._id, "Cancelled")}
                              className="font-bold text-amber-600 hover:text-amber-700 transition text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => deleteSession(sessionItem.clientId, sessionItem._id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete session"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-xs text-slate-400">
                  No sessions match this filter. Use the form on the left to schedule an appointment.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Schedule;

