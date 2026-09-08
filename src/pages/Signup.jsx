import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/signup", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/client-dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed ❌");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-blue-900 p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl md:grid-cols-2">
        <div className="flex flex-col justify-between bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 p-8 text-white">
          <div>
            <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-100">
              ForgeFit
            </div>
            <h1 className="mt-8 text-4xl font-black leading-tight">Build your routine. Own your progress.</h1>
          </div>

          <div className="mt-10 rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-violet-100">Coach approved</p>
            <p className="mt-2 text-2xl font-bold">Personal training, reimagined</p>
          </div>
        </div>

        <div className="flex items-center justify-center bg-white/90 p-8">
          <form onSubmit={handleSignup} className="w-full max-w-md">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Create account</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">Sign up</h2>
            </div>

            <div className="space-y-4">
              <input
                name="name"
                placeholder="Full name"
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white"
              />

              <input
                name="email"
                placeholder="Email address"
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white"
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white"
              />

              <button type="submit" className="primary-button w-full">
                Create account
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="cursor-pointer font-semibold text-violet-600">
                Sign in
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}