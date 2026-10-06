import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { LogIn, AlertCircle } from "lucide-react";

const demoAccounts = [
  {
    label: "Admin demo",
    email: "admin@forgefit.com",
    password: "admin123",
    roleText: "Coaching & Management",
  },
  {
    label: "Client demo",
    email: "client@forgefit.com",
    password: "client123",
    roleText: "Athlete & Trainee",
  },
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    setEmail(demo.email);
    setPassword(demo.password);
    setError("");
    performLogin(demo.email, demo.password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl md:grid-cols-2">
        <div className="flex flex-col justify-between bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-8 text-white">
          <div>
            <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
              ForgeFit
            </div>
            <h1 className="mt-8 text-4xl font-black leading-tight">Train smarter. Perform stronger.</h1>
          </div>

          <div className="mt-10 space-y-4 text-sky-50">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Live metrics</p>
              <p className="mt-2 text-2xl font-bold">92% goal completion</p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">+18% energy</div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">4.8 rating</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-white/95 p-8">
          <form onSubmit={handleLogin} className="w-full max-w-md">
            <div className="mb-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Welcome back</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">Sign in</h2>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-600">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Quick demo access</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {demoAccounts.map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className="group rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-400 hover:bg-blue-50/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700 group-hover:text-blue-700">{demo.label}</span>
                      <span className="text-[10px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition">Login →</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{demo.roleText}</p>
                    <p className="mt-1 font-mono text-[11px] text-slate-400 truncate">{demo.email}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={isLoading}
                className="primary-button w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <LogIn size={18} />
                    Login
                  </span>
                )}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don’t have an account?{" "}
              <span onClick={() => navigate("/signup")} className="cursor-pointer font-semibold text-blue-600 hover:underline">
                Sign up
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;