import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api";

function Schedule() {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [session, setSession] = useState({
    title: "1:1 Coaching Session",
    date: "2026-09-10",
    time: "18:30",
    type: "Strength",
    status: "Confirmed",
    meetingLink: "https://zoom.us/j/123456789",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await API.get("/clients");
      setClients(res.data);
      if (res.data[0]) setSelectedClientId(res.data[0]._id);
    } catch (err) {
      console.error(err);
    }
  };

  const addSession = async () => {
    if (!selectedClientId) return;

    try {
      await API.post(`/clients/${selectedClientId}/session`, session);
      setSession({
        title: "1:1 Coaching Session",
        date: "2026-09-10",
        time: "18:30",
        type: "Strength",
        status: "Confirmed",
        meetingLink: "https://zoom.us/j/123456789",
      });
      fetchClients();
      alert("Session scheduled successfully");
    } catch (err) {
      alert(err.response?.data?.msg || "Unable to schedule session");
    }
  };

  const updateSessionStatus = async (clientId, sessionId, status) => {
    try {
      await API.put(`/clients/${clientId}/session/${sessionId}`, { status });
      fetchClients();
    } catch (err) {
      alert(err.response?.data?.msg || "Unable to update session");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6 p-2">
        <section className="rounded-[28px] bg-gradient-to-r from-slate-900 via-indigo-900 to-sky-900 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">Online coach operations</p>
          <h1 className="mt-2 text-3xl font-black">Session planner</h1>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel rounded-[28px] p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Book a coaching session</h2>

            <div className="space-y-4 text-sm">
              <label className="block">
                <span className="mb-1 block text-slate-600">Client</span>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700"
                >
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>{client.name}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-slate-600">Session title</span>
                <input
                  value={session.title}
                  onChange={(e) => setSession({ ...session, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-slate-600">Date</span>
                  <input
                    type="date"
                    value={session.date}
                    onChange={(e) => setSession({ ...session, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-slate-600">Time</span>
                  <input
                    type="time"
                    value={session.time}
                    onChange={(e) => setSession({ ...session, time: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-slate-600">Type</span>
                  <select
                    value={session.type}
                    onChange={(e) => setSession({ ...session, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700"
                  >
                    <option>Confirmed</option>
                    <option>Pending</option>
                    <option>Booked</option>
                    <option>Completed</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-slate-600">Meeting link</span>
                <input
                  value={session.meetingLink}
                  onChange={(e) => setSession({ ...session, meetingLink: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700"
                />
              </label>

              <button
                onClick={addSession}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/20"
              >
                Save session
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-[28px] p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Upcoming schedule</h2>

            <div className="space-y-3">
              {clients.flatMap((client) =>
                (client.sessions || []).map((sessionItem, idx) => (
                  <div key={`${client._id}-${sessionItem._id || idx}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">{client.name}</p>
                        <p className="text-sm text-slate-500">{sessionItem.title}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
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
                    <p className="mt-2 text-sm text-slate-600">{sessionItem.date} • {sessionItem.time}</p>
                    <p className="text-xs text-slate-400">{sessionItem.type}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {sessionItem.meetingLink && (
                        <a href={sessionItem.meetingLink} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600">
                          Join link
                        </a>
                      )}
                      {sessionItem.status !== "Completed" && sessionItem.status !== "Cancelled" && (
                        <>
                          <button onClick={() => updateSessionStatus(client._id, sessionItem._id, "Completed")} className="text-xs font-semibold text-emerald-700 hover:underline">
                            Mark completed
                          </button>
                          <button onClick={() => updateSessionStatus(client._id, sessionItem._id, "Cancelled")} className="text-xs font-semibold text-red-600 hover:underline">
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Schedule;
