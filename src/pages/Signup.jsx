import { useState } from "react";
import API from "../api";
import { setAuth } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, AlertCircle, Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await API.post("/auth/signup", form);

      setAuth(res.data.token, res.data.user);
      navigate("/client-dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed. Please try a different email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 p-4 sm:p-6 antialiased">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/4 h-[450px] w-[450px] rounded-full bg-blue-600/15 blur-[120px]" />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/60 shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:grid-cols-2">
        {/* Left Side Presentation Panel */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-900 p-8 sm:p-12 text-white">
          <div className="relative z-10">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ArrowLeft size={13} />
              Back to Home
            </Link>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-violet-700 font-black text-xl shadow-lg">
                F
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200">ForgeFit OS</span>
                <span className="text-xl font-black text-white">Athlete Portal</span>
              </div>
            </div>

            <h1 className="mt-8 text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Build your routine. Own your progress.
            </h1>

            <p className="mt-4 text-sm text-violet-100/90 leading-relaxed font-normal">
              Get direct access to assigned workout programs, log your morning vitals, and keep a direct line to your performance coach.
            </p>
          </div>

          <div className="relative z-10 mt-10 space-y-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-100">
                <CheckCircle2 size={16} className="text-emerald-300" />
                <span>Coach-Approved Workout Prescriptions</span>
              </div>
              <p className="mt-2 text-xs text-violet-200 leading-normal">
                Structured sets, reps, load targets, and rest intervals directly configured by your coach.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white/5 p-3 text-xs text-violet-200 border border-white/10">
              <ShieldCheck size={16} className="text-emerald-300 shrink-0" />
              <span>Full privacy protection & encrypted messaging</span>
            </div>
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="flex flex-col justify-center bg-white p-8 sm:p-12">
          <form onSubmit={handleSignup} className="w-full max-w-md mx-auto">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Get Started</span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Create athlete account</h2>
              <p className="mt-1 text-sm text-slate-500">Sign up to access your training dashboard.</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-600 animate-fade-in">
                <AlertCircle size={17} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="name"
                    placeholder="Alex Morgan"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    placeholder="alex@example.com"
                    value={form.email}
                    onChange={handleChange}
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
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={handleChange}
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <UserPlus size={18} />
                    Create Account
                  </span>
                )}
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-violet-600 hover:text-violet-700 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}