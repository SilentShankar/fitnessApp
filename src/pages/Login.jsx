import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const demoAccounts = [
  {
    label: "Admin demo",
    email: "admin@forgefit.com",
    password: "admin123",
  },
  {
    label: "Client demo",
    email: "client@forgefit.com",
    password: "client123",
  },
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/client-dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed ❌");
    }
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

        <div className="flex items-center justify-center bg-white/90 p-8">
          <form onSubmit={handleLogin} className="w-full max-w-md">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Welcome back</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">Sign in</h2>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              {demoAccounts.map((demo) => (
                <div
                  key={demo.email}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left"
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700">{demo.label}</span>
                  </div>
                  <p className="mt-2 truncate text-xs text-slate-500">{demo.email}</p>
                  <p className="mt-1 text-xs text-slate-500">Password: <span className="font-semibold text-slate-700">{demo.password}</span></p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button type="submit" className="primary-button w-full">
                Login
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don’t have an account?{" "}
              <span onClick={() => navigate("/signup")} className="cursor-pointer font-semibold text-blue-600">
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