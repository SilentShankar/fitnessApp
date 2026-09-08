import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api";
import { getUser } from "../utils/auth";

function Messages() {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const isClient = getUser()?.role === "client";

  useEffect(() => {
    if (isClient) {
      fetchClientProfile();
    } else {
      fetchClients();
    }
  }, []);

  useEffect(() => {
    if (!selectedClientId) return undefined;

    const syncTimer = setInterval(() => {
      fetchMessages(selectedClientId);
    }, 5000);

    return () => clearInterval(syncTimer);
  }, [selectedClientId]);

  const fetchClientProfile = async () => {
    try {
      const res = await API.get("/clients/me");
      setClients([res.data]);
      setSelectedClientId(res.data._id);
      fetchMessages(res.data._id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await API.get("/clients");
      setClients(res.data);
      if (res.data[0]) {
        setSelectedClientId(res.data[0]._id);
        fetchMessages(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (clientId) => {
    try {
      const res = await API.get(`/clients/${clientId}/messages`);
      setMessages(res.data || []);
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error(err);
      setMessages([]);
    }
  };

  const handleClientChange = (clientId) => {
    setSelectedClientId(clientId);
    fetchMessages(clientId);
  };

  const sendMessage = async () => {
    if (!selectedClientId || !draft.trim()) return;

    try {
      await API.post(`/clients/${selectedClientId}/message`, {
        text: draft,
        sender: isClient ? "client" : "trainer",
      });
      setDraft("");
      fetchMessages(selectedClientId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6 p-2">
        <section className="rounded-[28px] bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">Communication</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black">Coach messaging</h1>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Live sync
            </span>
          </div>
          {lastSyncedAt && (
            <p className="mt-2 text-xs text-sky-100/70">
              Updated {lastSyncedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          )}
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel rounded-[28px] p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-800">{isClient ? "Your coach" : "Clients"}</h2>
            <div className="space-y-3">
              {clients.map((client) => (
                <button
                  key={client._id}
                  onClick={() => handleClientChange(client._id)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    selectedClientId === client._id
                      ? "border-blue-200 bg-blue-50"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-semibold text-slate-800">{client.name}</div>
                  <div className="text-xs text-slate-500">{(client.messages || []).length} messages</div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[28px] p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-800">
              {isClient ? "Conversation with your coach" : "Conversation"}
            </h2>

            <div className="mb-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {messages.length > 0 ? messages.map((message, index) => (
                <div
                  key={message._id || index}
                  className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                    message.sender === "trainer"
                      ? "ml-auto bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-80">
                    {message.sender === "trainer" ? "Coach" : "Client"}
                  </div>
                  <p>{message.text}</p>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  No messages yet for this client.
                </div>
              )}
            </div>

            <div className="space-y-3">
              <textarea
                rows="4"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={isClient ? "Message your coach..." : "Type your coaching message..."}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700"
              />
              <button
                onClick={sendMessage}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/20"
              >
                Send message
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Messages;
