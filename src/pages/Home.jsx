import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  TrendingUp,
  Dumbbell,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Check,
  ChevronRight,
  Sparkles,
  Star,
  Activity,
  Flame,
  ArrowRight,
  Menu,
  X,
  Clock,
  HeartPulse,
  Award,
} from "lucide-react";

const features = [
  {
    icon: Dumbbell,
    title: "Smart Program Builder",
    text: "Craft periodized routines, supersets, and rep ranges in seconds with a drag-and-drop exercise library.",
    accent: "from-blue-500 to-indigo-600",
  },
  {
    icon: Activity,
    title: "Real-time Adherence Tracking",
    text: "Monitor workout completion rates, energy trends, and daily sleep check-ins from a centralized coach cockpit.",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    icon: Calendar,
    title: "Integrated Session Scheduling",
    text: "Book 1:1 coaching slots, group conditioning, and live video check-ins with automated calendar synchronization.",
    accent: "from-violet-500 to-purple-600",
  },
  {
    icon: MessageSquare,
    title: "Direct Athlete Messaging",
    text: "Two-way live coaching communication with instant notifications, technique reviews, and accountability cues.",
    accent: "from-sky-500 to-blue-600",
  },
  {
    icon: HeartPulse,
    title: "Daily Recovery Signals",
    text: "Athletes log energy, sleep hours, and mood every morning, allowing coaches to adjust volume proactively.",
    accent: "from-rose-500 to-pink-600",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Grade Platform",
    text: "Role-based access control with dedicated views for head trainers, assistants, and private client portals.",
    accent: "from-amber-500 to-orange-600",
  },
];

const stats = [
  { label: "Active athletes", value: "4,850+" },
  { label: "Program completion", value: "94.2%" },
  { label: "Coach retention", value: "98.5%" },
  { label: "Check-ins logged", value: "120k+" },
];

const testimonials = [
  {
    quote: "ForgeFit transformed how our 6 trainers manage 140+ private clients. Our program compliance jumped from 68% to 94% in 60 days.",
    author: "Marcus Vance",
    role: "Head Strength Coach, Apex Performance NYC",
    rating: 5,
  },
  {
    quote: "As an athlete, having my daily plan, sleep log, and coach chat in one sleek interface keeps me relentlessly accountable.",
    author: "Elena Rostova",
    role: "Competitive CrossFit Athlete",
    rating: 5,
  },
  {
    quote: "The live session scheduler and interactive focus board cut our weekly coaching admin time by over 10 hours.",
    author: "David Chen",
    role: "Owner, Kinetic Human Performance",
    rating: 5,
  },
];

const pricingTiers = [
  {
    name: "Starter Coach",
    price: "$29",
    period: "per month",
    description: "Ideal for independent trainers building their roster.",
    features: ["Up to 15 active clients", "Unlimited workout templates", "Daily client check-in logs", "Standard messaging"],
    highlighted: false,
    cta: "Start 14-Day Free Trial",
  },
  {
    name: "Performance Pro",
    price: "$79",
    period: "per month",
    description: "For serious trainers and boutique fitness studios.",
    features: [
      "Up to 60 active clients",
      "Full Program Builder & Library",
      "1:1 Live Session Scheduler & Zoom links",
      "Live sync notifications & priority chat",
      "Exportable progress analytics",
    ],
    highlighted: true,
    badge: "Most Popular",
    cta: "Launch Pro Coaching",
  },
  {
    name: "Elite Studio",
    price: "$189",
    period: "per month",
    description: "Multi-coach gyms and performance academies.",
    features: [
      "Unlimited clients & 5 coach seats",
      "Custom branding & subdomains",
      "Dedicated account manager",
      "Custom workout integrations",
      "API & webhook access",
    ],
    highlighted: false,
    cta: "Contact Enterprise",
  },
];

function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState("workout");

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
      </div>

      {/* Header Navigation */}
      <header className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-400 font-black text-xl shadow-lg shadow-blue-500/30">
            F
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400">ForgeFit OS</div>
            <div className="text-sm font-black tracking-tight text-white">Performance Studio</div>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#demo" className="transition hover:text-white">Live Demo</a>
          <a href="#results" className="transition hover:text-white">Results</a>
          <a href="#testimonials" className="transition hover:text-white">Testimonials</a>
          <a href="#pricing" className="transition hover:text-white">Pricing</a>
        </nav>

        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110"
          >
            Start Free
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-300"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="relative z-30 border-b border-white/10 bg-slate-900/95 p-6 backdrop-blur-2xl md:hidden animate-slide-down">
          <div className="flex flex-col gap-4 text-sm font-medium text-slate-200">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1">Features</a>
            <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="py-1">Live Demo</a>
            <a href="#results" onClick={() => setMobileMenuOpen(false)} className="py-1">Results</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="py-1">Testimonials</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-1">Pricing</a>
            <div className="mt-2 flex flex-col gap-2 pt-4 border-t border-white/10">
              <Link to="/login" className="w-full text-center rounded-xl border border-white/20 py-2.5 font-semibold text-white">Log in</Link>
              <Link to="/signup" className="w-full text-center rounded-xl bg-blue-600 py-2.5 font-semibold text-white">Get Started</Link>
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-10 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                <Sparkles size={14} className="text-blue-400" />
                The Next-Gen Coaching Operating System
              </div>

              <h1 className="mt-6 text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                Train harder.{" "}
                <span className="block bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
                  Perform smarter.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg text-slate-300 leading-relaxed font-normal">
                ForgeFit gives elite coaches and athletes a synchronized platform for personalized program design, real-time recovery metrics, habit tracking, and session scheduling.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-[0_16px_35px_rgba(59,130,246,0.35)] transition-all hover:brightness-110 active:scale-95"
                >
                  Start free trial
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
                >
                  Explore demo portal
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
                    <div className="text-2xl font-black text-white">{item.value}</div>
                    <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HERO INTERACTIVE DEMO BOARD */}
            <div id="demo" className="relative">
              <div className="absolute inset-0 rounded-[36px] bg-gradient-to-tr from-blue-500/25 via-indigo-500/20 to-sky-400/20 blur-2xl" />
              <div className="relative rounded-[32px] border border-white/15 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-indigo-950/90 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
                {/* Demo Card Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Live Cockpit</div>
                      <div className="text-sm font-bold text-white">Ava Martinez — Performance Block</div>
                    </div>
                  </div>
                  <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-300">
                    Day 18 / 30
                  </span>
                </div>

                {/* Interactive Demo Tabs */}
                <div className="mt-4 flex rounded-xl bg-slate-950/60 p-1 text-xs font-semibold">
                  <button
                    onClick={() => setActiveDemoTab("workout")}
                    className={`flex-1 rounded-lg py-2 transition ${activeDemoTab === "workout" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                  >
                    Workout Plan
                  </button>
                  <button
                    onClick={() => setActiveDemoTab("recovery")}
                    className={`flex-1 rounded-lg py-2 transition ${activeDemoTab === "recovery" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                  >
                    Vitals & Sleep
                  </button>
                  <button
                    onClick={() => setActiveDemoTab("coach")}
                    className={`flex-1 rounded-lg py-2 transition ${activeDemoTab === "coach" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                  >
                    Coach Feed
                  </button>
                </div>

                {/* Tab 1: Workout */}
                {activeDemoTab === "workout" && (
                  <div className="mt-5 space-y-4 animate-fade-in">
                    <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">Weekly Target Adherence</span>
                        <span className="font-bold text-emerald-400">92% Completed</span>
                      </div>
                      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-700/80">
                        <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { name: "Barbell Back Squat", sets: "4 × 8 reps", load: "185 lbs", done: true },
                        { name: "Romanian Deadlift", sets: "3 × 10 reps", load: "145 lbs", done: true },
                        { name: "Bulgarian Split Squats", sets: "3 × 12/side", load: "40 lbs", done: false },
                        { name: "Hanging Knee Tucks", sets: "3 × 15 reps", load: "Bodyweight", done: false },
                      ].map((ex) => (
                        <div
                          key={ex.name}
                          className={`flex items-center justify-between rounded-xl border p-3 text-xs transition ${
                            ex.done
                              ? "border-emerald-500/30 bg-emerald-500/10 text-slate-200"
                              : "border-white/10 bg-white/[0.03] text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`flex h-5 w-5 items-center justify-center rounded-md ${ex.done ? "bg-emerald-500 text-slate-950 font-bold" : "border border-white/30"}`}>
                              {ex.done && <Check size={12} strokeWidth={3} />}
                            </span>
                            <span className={`font-semibold ${ex.done ? "line-through opacity-70" : "text-white"}`}>{ex.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                            <span>{ex.sets}</span>
                            <span className="rounded-md bg-white/10 px-2 py-0.5 text-white">{ex.load}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 2: Recovery */}
                {activeDemoTab === "recovery" && (
                  <div className="mt-5 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-emerald-500/10 p-3 text-center">
                        <span className="text-[10px] font-semibold uppercase text-emerald-300">Energy</span>
                        <div className="mt-1 text-2xl font-black text-emerald-400">9/10</div>
                        <span className="text-[10px] text-slate-400">Peak state</span>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-blue-500/10 p-3 text-center">
                        <span className="text-[10px] font-semibold uppercase text-blue-300">Sleep</span>
                        <div className="mt-1 text-2xl font-black text-blue-400">8.2h</div>
                        <span className="text-[10px] text-slate-400">Deep recovery</span>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-violet-500/10 p-3 text-center">
                        <span className="text-[10px] font-semibold uppercase text-violet-300">Readiness</span>
                        <div className="mt-1 text-2xl font-black text-violet-400">96%</div>
                        <span className="text-[10px] text-slate-400">Optimal</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-4">
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="font-semibold text-slate-300">7-Day Energy Trend</span>
                        <span className="text-emerald-400 text-[11px] font-bold">Trending +14%</span>
                      </div>
                      <div className="flex items-end gap-2 h-20 pt-2">
                        {[6, 7, 7, 8, 8, 9, 9].map((val, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                            <div
                              className="w-full rounded-md bg-gradient-to-t from-blue-600 to-cyan-400"
                              style={{ height: `${val * 10}%` }}
                            />
                            <span className="text-[9px] text-slate-400 font-mono">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Coach Feed */}
                {activeDemoTab === "coach" && (
                  <div className="mt-5 space-y-3 animate-fade-in">
                    <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3.5 text-xs">
                      <div className="flex items-center justify-between font-semibold text-blue-300 mb-1">
                        <span>Coach Jordan</span>
                        <span className="text-[10px] text-slate-400">2h ago</span>
                      </div>
                      <p className="text-slate-200">
                        "Great tempo on yesterday's back squats. For today's RDLs, focus on hip hinge depth and keep the lats fully packed."
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-3.5 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-300 mb-1">
                        <span>Next 1:1 Session</span>
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300 font-bold text-[10px]">Confirmed</span>
                      </div>
                      <p className="text-slate-400">Tomorrow at 18:30 • Live Technique Review (Zoom)</p>
                    </div>
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-400">
                  <span>Updated real-time</span>
                  <Link to="/login" className="font-bold text-blue-400 hover:text-blue-300">
                    Try Admin Demo →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 border-t border-white/5">
          <div className="mx-auto max-w-2xl text-center">
            <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
              Complete Feature Suite
            </span>
            <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl lg:text-5xl tracking-tight">
              Built for coaches who demand excellence
            </h2>
            <p className="mt-4 text-slate-400">
              Replace scattered spreadsheets, chat apps, and paper clipboards with one unified fitness OS.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-[28px] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-1"
                >
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} text-white shadow-lg`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{feature.title}</h3>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed font-normal">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* RESULTS & METRICS */}
        <section id="results" className="relative bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-24 text-white lg:px-10 border-y border-white/5">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-400">Measurable Impact</span>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Real athletes. Real numbers. Verified outcomes.
              </h2>
              <p className="mt-5 text-base text-slate-300 leading-relaxed">
                By unifying your workout prescriptions with daily recovery check-ins, athletes miss fewer sessions, stay injury-free, and remain committed to your coaching philosophy.
              </p>

              <div className="mt-8 flex items-center gap-6">
                <div>
                  <div className="text-3xl font-black text-white">4.9 / 5.0</div>
                  <div className="flex gap-1 text-amber-400 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">From 350+ certified coaches</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="text-4xl font-black text-emerald-400">+34%</div>
                <div className="mt-2 text-sm font-bold text-white">Higher Workout Adherence</div>
                <p className="mt-1 text-xs text-slate-400">Automated check-ins and streaks drive consistency.</p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="text-4xl font-black text-blue-400">3x</div>
                <div className="mt-2 text-sm font-bold text-white">Faster Client Onboarding</div>
                <p className="mt-1 text-xs text-slate-400">Instant program presets and client account creation.</p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="text-4xl font-black text-violet-400">10 hrs</div>
                <div className="mt-2 text-sm font-bold text-white">Saved per Coach Weekly</div>
                <p className="mt-1 text-xs text-slate-400">Automated scheduling, notes, and progress rolls.</p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="text-4xl font-black text-amber-400">98.5%</div>
                <div className="mt-2 text-sm font-bold text-white">Annual Coach Retention</div>
                <p className="mt-1 text-xs text-slate-400">Athletes stay because they see measurable progress.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Success Stories</span>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl tracking-tight">
              Trusted by coaches and competitors worldwide
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, idx) => (
              <div key={idx} className="flex flex-col justify-between rounded-[28px] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">"{t.quote}"</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="font-bold text-white text-sm">{t.author}</div>
                  <div className="text-xs text-slate-400">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 border-t border-white/5">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Transparent Plans</span>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl tracking-tight">
              Simple pricing for serious growth
            </h2>
            <p className="mt-4 text-slate-400">All plans include full feature access, SSL security, and live sync.</p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col justify-between rounded-[32px] p-8 transition-all ${
                  tier.highlighted
                    ? "border-2 border-blue-500 bg-gradient-to-b from-blue-950/60 to-slate-900 shadow-[0_20px_60px_rgba(59,130,246,0.25)]"
                    : "border border-white/10 bg-white/[0.03]"
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                    {tier.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="mt-2 text-xs text-slate-400 min-h-[32px]">{tier.description}</p>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white tracking-tight">{tier.price}</span>
                    <span className="text-xs text-slate-400 font-medium">{tier.period}</span>
                  </div>

                  <ul className="mt-8 space-y-3.5 text-xs text-slate-300">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold">
                          ✓
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/signup"
                  className={`mt-8 w-full rounded-2xl py-3.5 text-center text-xs font-bold transition ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:brightness-110"
                      : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
          <div className="relative overflow-hidden rounded-[36px] border border-white/15 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 p-10 text-center shadow-[0_30px_80px_rgba(59,130,246,0.35)] sm:p-14">
            <div className="relative z-10">
              <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Start in 2 minutes
              </span>
              <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl tracking-tight">
                Turn your fitness roster into an elite results engine.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-blue-100 font-normal">
                No credit card required. Experience ForgeFit with our pre-loaded demo accounts or build your custom training plan now.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to="/signup"
                  className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-blue-700 shadow-xl transition hover:bg-slate-100 active:scale-95"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/login"
                  className="rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  Open Live Demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950 py-12 px-6 lg:px-10 text-slate-400 text-xs">
        <div className="mx-auto max-w-7xl flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-black text-white">
              F
            </div>
            <div>
              <span className="font-bold text-white">ForgeFit</span>
              <p className="text-[11px] text-slate-500">The Modern Athletic Performance OS</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-slate-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#results" className="hover:text-white transition">Results</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <Link to="/login" className="hover:text-white transition">Coach Sign-in</Link>
            <Link to="/signup" className="hover:text-white transition">Athlete Sign-up</Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            <span className="text-[11px] font-medium text-slate-400">Systems Operational • v2.4.0</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600">
          <p>© {new Date().getFullYear()} ForgeFit Technologies Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built for strength, hypertrophy, and high-performance coaches.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;