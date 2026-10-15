import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { LogIn, AlertCircle, Mail, Lock, Eye, EyeOff, ArrowLeft, Shield, User, Sparkles } from "lucide-react";

const demoAccounts = [
  {
    label: "Admin Demo",
    email: "admin@forgefit.com",
    password: "admin123",
    roleText: "Coach & Studio Admin",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    label: "Athlete Demo",
    email: "client@forgefit.com",
    password: "client123",
    roleText: "Trainee Portal & Logging",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState("");
  const navigate = useNavigate();

  const performLogin = async (loginEmail, loginPassword) => {
    setError("");
    setIsLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/client-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
      setActiveDemo("");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    performLogin(email, password);
  };

  const handleSelectDemo = (demo) => {
    setActiveDemo(demo.email);
    setEmail(demo.email);
    setPassword(demo.password);
    setError("");
    performLogin(demo.email, demo.password);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 p-4 sm:p-6 antialiased">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[450px] w-[450px] rounded-full bg-indigo-600/15 blur-[120px]" />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/60 shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:grid-cols-2">
        {/* Left Side Presentation Panel */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-900 p-8 sm:p-12 text-white">
          <div className="relative z-10">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ArrowLeft size={13} />
              Back to Home
            </Link>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-700 font-black text-xl shadow-lg">
                F
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">ForgeFit OS</span>
                <span className="text-xl font-black text-white">Performance Studio</span>
              </div>
            </div>

            <h1 className="mt-8 text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Train with purpose. Coach with clarity.
            </h1>

            <p className="mt-4 text-sm text-blue-100/90 leading-relaxed font-normal">
              Access your real-time athlete roster, assigned training programs, and live recovery analytics from one synchronized cockpit.
            </p>
          </div>

          <div className="relative z-10 mt-10 space-y-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-blue-100">
                <span>Synchronized Roster</span>
                <span className="font-bold text-emerald-300">● Live Connection</span>
              </div>
              <p className="mt-2 text-xl font-bold">94.2% Athlete Adherence</p>
            </div>

            <div className="flex gap-3 text-xs">
              <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="text-blue-200 block text-[10px] uppercase font-semibold">Security</span>
                <span className="font-bold text-white">JWT Encrypted</span>
              </div>
              <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="text-blue-200 block text-[10px] uppercase font-semibold">Database</span>
                <span className="font-bold text-white">In-Memory Sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="flex flex-col justify-center bg-white p-8 sm:p-12">
          <form onSubmit={handleLogin} className="w-full max-w-md mx-auto">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Secure Access</span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Welcome back</h2>
              <p className="mt-1 text-sm text-slate-500">Sign in to your ForgeFit account or pick a demo role.</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-600 animate-fade-in">
                <AlertCircle size={17} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Demo Access Bar */}
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Sparkles size={14} className="text-blue-600" />
                <span className="text-xs font-bold text-slate-700">One-Click Demo Access</span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {demoAccounts.map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelectDemo(demo)}
                    className={`group relative rounded-xl border p-2.5 text-left transition-all duration-200 ${
                      activeDemo === demo.email
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{demo.label}</span>
                      <span className="text-[10px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        {activeDemo === demo.email ? "Signing in..." : "Login →"}
                      </span>
                    </div>
                    <span className="mt-0.5 block text-[11px] text-slate-500 leading-tight">{demo.roleText}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@forgefit.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="primary-button w-full py-3 mt-2"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <LogIn size={18} />
                    Sign in to Account
                  </span>
                )}
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-slate-600">
              Don't have an account?{" "}
              <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                Create one now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;