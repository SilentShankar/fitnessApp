import { useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  MessageSquareText,
  LogOut,
  Menu,
  X,
  Activity,
  Clock3,
  Dumbbell,
  Shield,
  ChevronRight,
  BellRing,
  Salad,
} from "lucide-react";
import API from "../api";

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
      <Clock3 size={14} className="text-blue-600" />
      <span>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
    </div>
  );
}

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasMessageUpdate, setHasMessageUpdate] = useState(false);
  const [messagePopup, setMessagePopup] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null") || {};
  const name = user?.name || "User";
  const role = user?.role || "client";

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
  }, [messageStorageKey, messageSignatureKey, role]);

  useEffect(() => {
    if (location.pathname === "/messages") {
      setHasMessageUpdate(false);
    }
    // Close mobile drawer on route change
    setMobileOpen(false);
  }, [location.pathname]);

  const menuItem = (path, label, Icon, hasUpdate = false) => {
    const isActive = location.pathname === path;

    return (
      <button
        key={path}
        onClick={() => {
          navigate(path);
          setMobileOpen(false);
        }}
        className={`group relative flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        } ${collapsed ? "justify-center px-0" : ""}`}
        title={collapsed ? label : undefined}
      >
        <Icon size={19} className={`shrink-0 transition-transform duration-200 ${isActive ? "scale-105" : "group-hover:scale-110"}`} />
        {!collapsed && <span className="truncate">{label}</span>}
        {hasUpdate && (
          <span className={`${collapsed ? "absolute top-2 right-2" : "ml-auto"} flex h-2.5 w-2.5 items-center justify-center`}>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
        )}
      </button>
    );
  };

  const pageTitle = location.pathname
    .replace("/", "")
    .replace(/-/g, " ")
    .replace(/^./, (char) => char.toUpperCase());

  return (
    <div className="flex h-screen bg-slate-100/90 text-slate-800 antialiased overflow-hidden">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-slate-200/90 bg-white/95 p-4 backdrop-blur-xl shadow-xl transition-all duration-300 md:static ${
          mobileOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"
        } ${collapsed ? "md:w-20" : "md:w-64"}`}
      >
        <div>
          {/* Logo & Collapse Header */}
          <div className="mb-6 flex items-center justify-between pb-3 border-b border-slate-100">
            <Link to="/home" className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 font-black text-lg">
                F
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                    Performance OS
                  </span>
                  <span className="block text-lg font-black tracking-tight text-slate-900">
                    ForgeFit
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 transition"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu size={16} />
            </button>

            <button
              onClick={() => setMobileOpen(false)}
              className="flex md:hidden h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItem(dashboardPath, "Dashboard", LayoutDashboard)}
            {(role === "admin" || role === "trainer") && menuItem("/clients", "Clients", Users)}
            {(role === "admin" || role === "trainer") && menuItem("/schedule", "Schedule", CalendarDays)}
            {(role === "admin" || role === "trainer") && menuItem("/programs", "Programs", Dumbbell)}
            {menuItem("/nutrition", "Nutrition & Habits", Salad)}
            {(role === "admin" || role === "client") && menuItem("/messages", "Messages", MessageSquareText, hasMessageUpdate)}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          {!collapsed ? (
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-3.5 text-white shadow-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">
                <Activity size={12} className="text-emerald-400" />
                Live Engine
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-200">Sync status</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                  Active
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="Live status active">
              <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 ${
              collapsed ? "justify-center px-0" : ""
            }`}
            title="Log out"
          >
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Floating Message Notification */}
        {messagePopup && (
          <div className="fixed right-6 top-6 z-[100] flex items-center gap-3 rounded-2xl border border-blue-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-800 shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur-md animate-fade-in">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <BellRing size={16} />
            </span>
            <span>{messagePopup}</span>
            <button
              onClick={() => setMessagePopup("")}
              className="ml-2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Top Header */}
        <header className="border-b border-slate-200/80 bg-white/80 px-4 py-3.5 backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Menu size={18} />
              </button>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {role === "admin" ? "Coach workspace" : "Athlete portal"}
                </p>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {pageTitle || "Overview"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LiveClock />

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-1.5 pr-3 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-black text-white text-sm shadow-md shadow-blue-500/20">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">{name}</div>
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                    {role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;