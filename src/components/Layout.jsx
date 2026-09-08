import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, CalendarDays, MessageSquareText, LogOut, Menu, Activity, Clock3, Dumbbell } from "lucide-react";
import API from "../api";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState(new Date());
  const [hasMessageUpdate, setHasMessageUpdate] = useState(false);
  const [messagePopup, setMessagePopup] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null") || {};
  const name = user?.name || "User";
  const role = user?.role || "client";

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const dashboardPath = role === "admin" ? "/dashboard" : "/client-dashboard";
  const messageStorageKey = `forgefit-message-count-${user.id || name}`;
  const messageSignatureKey = `forgefit-message-latest-${user.id || name}`;

  useEffect(() => {
    let isFirstSync = true;

    const syncMessages = async () => {
      try {
        const response = role === "admin"
          ? await API.get("/clients")
          : await API.get("/clients/me");
        const clients = role === "admin" ? response.data : [response.data];
        const messages = clients.flatMap((client) => client.messages || []);
        const previousSignature = localStorage.getItem(messageSignatureKey);
        const latestMessage = [...messages].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        )[0];
        const currentSignature = latestMessage
          ? `${latestMessage._id || latestMessage.createdAt}-${latestMessage.sender}-${latestMessage.text}`
          : "empty";

        if (isFirstSync || !previousSignature) {
          localStorage.setItem(messageSignatureKey, currentSignature);
        } else if (currentSignature !== previousSignature) {
          const incoming = latestMessage.sender !== (role === "admin" ? "trainer" : "client");
          if (incoming) {
            setHasMessageUpdate(true);
          }
          setMessagePopup(incoming
            ? `New message from ${role === "admin" ? "a client" : "your coach"}`
            : "Message sent successfully");
          window.setTimeout(() => setMessagePopup(""), 4500);
          localStorage.setItem(messageSignatureKey, currentSignature);
        }

        localStorage.setItem(messageStorageKey, String(messages.length));

        isFirstSync = false;
      } catch (err) {
        console.error(err);
      }
    };

    syncMessages();
    const syncTimer = window.setInterval(syncMessages, 5000);
    return () => window.clearInterval(syncTimer);
  }, [messageStorageKey, role]);

  useEffect(() => {
    if (location.pathname === "/messages") {
      setHasMessageUpdate(false);
    }
  }, [location.pathname]);

  const menuItem = (path, label, Icon, hasUpdate = false) => (
    <button
      onClick={() => navigate(path)}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
        location.pathname === path
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon size={18} />
      {!collapsed && <span className="font-medium">{label}</span>}
      {hasUpdate && <span className="ml-auto h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.75)]" />}
    </button>
  );

  const pageTitle = location.pathname
    .replace("/", "")
    .replace(/-/g, " ")
    .replace(/^./, (char) => char.toUpperCase());

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800">
      <aside
        className={`${collapsed ? "w-24" : "w-72"} flex flex-col justify-between border-r border-slate-200 bg-white/90 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition-all duration-300`}
      >
        <div>
          <div className="mb-7 flex items-center justify-between">
            {!collapsed && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-500">
                  Performance OS
                </div>
                <h1 className="mt-1 text-xl font-black text-slate-900">ForgeFit</h1>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:text-blue-600"
            >
              <Menu size={18} />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItem(dashboardPath, "Dashboard", LayoutDashboard)}
            {(role === "admin" || role === "trainer") && menuItem("/clients", "Clients", Users)}
            {(role === "admin" || role === "trainer") && menuItem("/schedule", "Schedule", CalendarDays)}
            {(role === "admin" || role === "trainer") && menuItem("/programs", "Programs", Dumbbell)}
            {(role === "admin" || role === "client") && menuItem("/messages", "Messages", MessageSquareText, hasMessageUpdate)}
          </nav>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-3 text-white">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-300">
              <Activity size={12} />
              Live status
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              <span className="text-sm font-medium">Training online</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-3 py-2.5 font-medium text-white transition hover:bg-red-600"
          >
            <LogOut size={16} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        {messagePopup && (
          <div className="fixed right-6 top-6 z-[100] flex items-center gap-3 rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.7)]" />
            {messagePopup}
          </div>
        )}
        <header className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Operations overview</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">{pageTitle}</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <Clock3 size={16} className="text-blue-600" />
                {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-800">{name}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{role}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="h-[calc(100vh-88px)] overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;