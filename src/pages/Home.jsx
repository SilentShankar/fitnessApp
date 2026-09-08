import { Link } from "react-router-dom";

const features = [
  {
    title: "Smart programming",
    text: "Personalized weekly plans that adapt to performance, recovery, and goals.",
  },
  {
    title: "Real-time progress",
    text: "Track client completion, movement quality, and consistency from a single view.",
  },
  {
    title: "Elite coaching",
    text: "Keep training organized with clear milestones and easy daily accountability.",
  },
];

const stats = [
  { label: "Active clients", value: "4.8k" },
  { label: "Avg. completion", value: "92%" },
  { label: "Coach retention", value: "96%" },
];

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 font-black text-lg">
            F
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">ForgeFit</div>
            <div className="text-sm text-slate-300">Performance studio</div>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#results" className="transition hover:text-white">Results</a>
          <a href="#pricing" className="transition hover:text-white">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5">
            Log in
          </Link>
          <Link to="/signup" className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110">
            Start now
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-20 pt-10 lg:grid-cols-2 lg:px-10 lg:pt-16">
          <div>
            <div className="inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              Built for modern coaching
            </div>
            <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight lg:text-6xl">
              Train harder.
              <span className="block bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Perform smarter.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              A premium fitness operating system for coaches and clients to manage programs, track habits, and achieve measurable results in real time.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup" className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(59,130,246,0.33)] transition hover:brightness-110">
                Get started
              </Link>
              <Link to="/login" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
                View dashboard
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black text-white">{item.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-transparent blur-3xl" />
            <div className="relative rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl">
              <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Live overview</div>
                    <div className="mt-1 text-xl font-bold text-white">Performance board</div>
                  </div>
                  <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                    Online
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <div className="rounded-2xl bg-slate-800/80 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                      <span>Client completion</span>
                      <span className="font-semibold text-white">92%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-700">
                      <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-400 to-green-500" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-blue-100">Sessions</div>
                      <div className="mt-3 text-3xl font-black text-white">128</div>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-violet-100">Recovery</div>
                      <div className="mt-3 text-3xl font-black text-white">87%</div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-800/80 p-4">
                    <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
                      <span>Coach focus</span>
                      <span className="font-semibold text-white">5 priorities</span>
                    </div>
                    <div className="space-y-3">
                      {['Power', 'Mobility', 'Strength', 'Conditioning'].map((task, idx) => (
                        <div key={task}>
                          <div className="mb-1 flex justify-between text-xs text-slate-300">
                            <span>{task}</span>
                            <span>{70 + idx * 8}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                              style={{ width: `${70 + idx * 8}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Everything your gym needs</p>
            <h2 className="mt-3 text-4xl font-black text-white">Built for serious performance</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-xl shadow-lg shadow-blue-500/20">
                  ✦
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="mt-3 text-slate-300">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="results" className="bg-white text-slate-900">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2 lg:px-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Results</p>
              <h2 className="mt-3 text-4xl font-black">Elite systems. Measurable outcomes.</h2>
              <p className="mt-5 max-w-xl text-lg text-slate-600">
                From planning and accountability to client check-ins and progress visibility, everything is aligned around results.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-[24px] bg-slate-100 p-5">
                <div className="text-3xl font-black text-slate-900">+34%</div>
                <div className="mt-2 text-slate-600">Average workout adherence</div>
              </div>
              <div className="rounded-[24px] bg-slate-100 p-5">
                <div className="text-3xl font-black text-slate-900">3x</div>
                <div className="mt-2 text-slate-600">Faster client follow-up</div>
              </div>
              <div className="rounded-[24px] bg-slate-100 p-5">
                <div className="text-3xl font-black text-slate-900">24/7</div>
                <div className="mt-2 text-slate-600">Access from anywhere</div>
              </div>
              <div className="rounded-[24px] bg-slate-100 p-5">
                <div className="text-3xl font-black text-slate-900">1 click</div>
                <div className="mt-2 text-slate-600">Program updates</div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-r from-blue-600 to-indigo-600 p-10 text-center shadow-[0_30px_60px_rgba(59,130,246,0.3)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">Start today</p>
            <h2 className="mt-3 text-4xl font-black text-white">Turn your fitness business into a results engine.</h2>
            <div className="mt-8 flex justify-center gap-4">
              <Link to="/signup" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-700 transition hover:bg-slate-100">
                Build your plan
              </Link>
              <Link to="/login" className="rounded-full border border-white/30 bg-transparent px-6 py-3 text-sm font-bold text-white transition hover:bg-white/5">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;