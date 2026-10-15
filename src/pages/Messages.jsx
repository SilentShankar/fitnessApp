import { useEffect, useState, useCallback, useRef } from "react";
import Layout from "../components/Layout";
import API from "../api";
import { getUser } from "../utils/auth";
import {
  Send,
  Search,
  MessageSquare,
  Sparkles,
  User,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCheck
} from "lucide-react";

const TRAINER_QUICK_SNIPPETS = [
  "Great job on completing today's session! Keep hydration high.",
  "Remember to log your morning recovery metrics and sleep score.",
  "Check out your updated program in the workout tab.",
  "Let's review your squat form in our upcoming check-in."
];

const CLIENT_QUICK_SNIPPETS = [
  "Just completed today's assigned workout! Felt strong.",
  "Felt a bit of knee tightness during split squats.",
  "Hydration and nutrition are on track today.",
  "Ready for next week's progression block!"
];

function Messages() {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUser = getUser();
  const isClient = currentUser?.role === "client";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async (clientId) => {
    if (!clientId) return;
    try {
      const res = await API.get(`/clients/${clientId}/messages`);
      setMessages(res.data || []);
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error(err);
      setMessages([]);
    }
  }, []);

  const fetchClientProfile = useCallback(async () => {
    try {
      const res = await API.get("/clients/me");
      setClients([res.data]);
      setSelectedClientId(res.data._id);
      fetchMessages(res.data._id);
    } catch (err) {
      console.error(err);
    }
  }, [fetchMessages]);

  const fetchClients = useCallback(async () => {
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
  }, [fetchMessages]);

  useEffect(() => {
    if (isClient) {
      fetchClientProfile();
    } else {
      fetchClients();
    }
  }, [isClient, fetchClientProfile, fetchClients]);

  useEffect(() => {
    if (!selectedClientId) return undefined;

    const syncTimer = setInterval(() => {
      fetchMessages(selectedClientId);
    }, 4000);

    return () => clearInterval(syncTimer);
  }, [selectedClientId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClientChange = (clientId) => {
    setSelectedClientId(clientId);
    fetchMessages(clientId);
  };

  const sendMessage = async () => {
    if (!selectedClientId || !draft.trim() || isSending) return;

    setIsSending(true);
    const messageText = draft.trim();
    setDraft("");

    try {
      await API.post(`/clients/${selectedClientId}/message`, {
        text: messageText,
        sender: isClient ? "client" : "trainer",
      });
      await fetchMessages(selectedClientId);
      scrollToBottom();
    } catch (err) {
      console.error(err);
      // Restore draft on failure
      setDraft(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeClient = clients.find((c) => c._id === selectedClientId);

  const filteredClients = clients.filter((c) =>
    (c.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const snippets = isClient ? CLIENT_QUICK_SNIPPETS : TRAINER_QUICK_SNIPPETS;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Header Card */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-950 via-sky-950 to-indigo-950 p-6 md:p-8 text-white shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
          <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
                Direct Communication Hub
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl lg:text-4xl">
                {isClient ? "Coach Direct Line" : "Athlete Messaging Center"}
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Real-time feedback, workout adjustments, accountability, and athlete support.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                Active Synced Stream
              </div>
              {lastSyncedAt && (
                <span className="text-xs text-sky-200/70 hidden sm:inline">
                  {lastSyncedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Messaging Two-Column Panel */}
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Left Column: Conversations List */}
          <div className="glass-panel flex flex-col rounded-[28px] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isClient ? "Your Coach" : "Athletes"}
                </h2>
                <p className="text-xs text-slate-500">
                  {filteredClients.length} {filteredClients.length === 1 ? "conversation" : "conversations"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => selectedClientId && fetchMessages(selectedClientId)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                title="Refresh messages"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* Search filter for trainers */}
            {!isClient && (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search athletes..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white"
                />
              </div>
            )}

            {/* Client List */}
            <div className="space-y-2 overflow-y-auto max-h-[520px] pr-1">
              {filteredClients.map((client) => {
                const isSelected = selectedClientId === client._id;
                const messageCount = client.messages?.length || 0;
                const initials = (client.name || "A")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <button
                    key={client._id}
                    onClick={() => handleClientChange(client._id)}
                    className={`group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                      isSelected
                        ? "border border-indigo-200 bg-indigo-50/70 shadow-sm"
                        : "border border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-bold text-white shadow-sm ${
                        isSelected
                          ? "bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-indigo-500/20"
                          : "bg-slate-700"
                      }`}
                    >
                      {initials}
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={`truncate text-sm font-bold ${
                            isSelected ? "text-indigo-950" : "text-slate-800"
                          }`}
                        >
                          {client.name}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {client.goal || (isClient ? "Coach" : "Athlete")}
                        </span>
                      </div>
                      <p className="truncate text-xs text-slate-500">
                        {messageCount > 0
                          ? `${messageCount} recorded message${messageCount === 1 ? "" : "s"}`
                          : "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })}

              {filteredClients.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No athletes found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Conversation */}
          <div className="glass-panel flex flex-col rounded-[28px] shadow-sm">
            {/* Conversation Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white shadow-sm">
                  {(activeClient?.name || (isClient ? "C" : "A"))
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    {isClient
                      ? "Head Coach Communication Channel"
                      : activeClient?.name || "Select Athlete"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Live & Encrypted
                    </span>
                    <span>•</span>
                    <span>{messages.length} messages exchange</span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                <span>Private Thread</span>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5 min-h-[380px] max-h-[480px]">
              {messages.length > 0 ? (
                messages.map((message, index) => {
                  const isMine = isClient
                    ? message.sender === "client"
                    : message.sender === "trainer";

                  return (
                    <div
                      key={message._id || index}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
                        {!isMine && (
                          <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                            {message.sender === "trainer" ? "TR" : "CL"}
                          </div>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-3 text-sm shadow-sm transition ${
                            isMine
                              ? "rounded-br-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                              : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                          }`}
                        >
                          <div
                            className={`mb-1 text-[10px] font-semibold uppercase tracking-wider ${
                              isMine ? "text-blue-100" : "text-slate-400"
                            }`}
                          >
                            {message.sender === "trainer" ? "Coach" : "Athlete"}
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                        </div>
                      </div>

                      <div
                        className={`mt-1 flex items-center gap-1 text-[10px] text-slate-400 ${
                          isMine ? "pr-2" : "pl-9"
                        }`}
                      >
                        <Clock className="h-2.5 w-2.5" />
                        <span>
                          {message.createdAt
                            ? new Date(message.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Just now"}
                        </span>
                        {isMine && <CheckCheck className="h-3 w-3 text-indigo-500" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="my-10 flex flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                    <MessageSquare className="h-7 w-7" />
                  </div>
                  <h4 className="mt-3 font-bold text-slate-800">No message history yet</h4>
                  <p className="mt-1 max-w-sm text-xs text-slate-500">
                    Send a coaching note, workout update, or feedback to start the conversation!
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick coaching prompts */}
            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-2.5">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-500">
                <span className="shrink-0 font-semibold text-slate-600">Quick Cues:</span>
                {snippets.map((snip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDraft(snip)}
                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95"
                  >
                    {snip.length > 40 ? snip.slice(0, 40) + "..." : snip}
                  </button>
                ))}
              </div>
            </div>

            {/* Composer Box */}
            <div className="p-4 border-t border-slate-100 bg-white rounded-b-[28px]">
              <div className="flex items-end gap-3">
                <textarea
                  rows="2"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isClient
                      ? "Ask your coach a question, report fatigue, or share a win... (Enter to send)"
                      : "Send feedback, workout motivation, or schedule updates... (Enter to send)"
                  }
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!draft.trim() || !selectedClientId || isSending}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
                  title="Send message (Enter)"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line</span>
                <span>Encrypted & secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Messages;
