import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../api";
import { getUser } from "../utils/auth";
import {
  Apple,
  Salad,
  Droplets,
  Footprints,
  Scale,
  TrendingDown,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Flame,
  Zap,
  Sparkles,
  X,
  Target,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Nutrition() {
  const [searchParams] = useSearchParams();
  const urlClientId = searchParams.get("client") || "";
  const currentUser = getUser();
  const isCoach = currentUser?.role === "admin";

  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(urlClientId);
  const [activeClient, setActiveClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);

  // Form states
  const [logForm, setLogForm] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    water: "",
    steps: "",
    notes: "",
  });

  const [metricForm, setMetricForm] = useState({
    weight: "",
    bodyFat: "",
    waist: "",
    chest: "",
    notes: "",
  });

  const [targetForm, setTargetForm] = useState({
    calories: 2400,
    protein: 180,
    carbs: 250,
    fats: 70,
    water: 3500,
    steps: 10000,
  });

  const showToast = useCallback((msg) => {
    setToast(msg);
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isCoach) {
        const res = await API.get("/clients");
        setClients(res.data);
        const current = selectedClientId
          ? res.data.find((c) => c._id === selectedClientId) || res.data[0]
          : res.data[0];
        if (current) {
          setSelectedClientId(current._id);
          setActiveClient(current);
          if (current.nutritionTargets) {
            setTargetForm({ ...current.nutritionTargets });
          }
        }
      } else {
        const res = await API.get("/clients/me");
        setActiveClient(res.data);
        if (res.data.nutritionTargets) {
          setTargetForm({ ...res.data.nutritionTargets });
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Unable to load nutrition data");
    } finally {
      setLoading(false);
    }
  }, [isCoach, selectedClientId, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (urlClientId && urlClientId !== selectedClientId) {
      setSelectedClientId(urlClientId);
    }
  }, [urlClientId]);

  const handleClientSelect = (clientId) => {
    setSelectedClientId(clientId);
    const c = clients.find((item) => item._id === clientId);
    if (c) {
      setActiveClient(c);
      if (c.nutritionTargets) {
        setTargetForm({ ...c.nutritionTargets });
      }
    }
  };

  // Nutrition targets and current intake for today
  const targets = useMemo(() => {
    return (
      activeClient?.nutritionTargets || {
        calories: 2400,
        protein: 180,
        carbs: 250,
        fats: 70,
        water: 3500,
        steps: 10000,
      }
    );
  }, [activeClient]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLog = useMemo(() => {
    const logs = activeClient?.nutritionLogs || [];
    return logs.find((l) => l.date === todayStr) || logs.slice(-1)[0] || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      water: 0,
      steps: 0,
    };
  }, [activeClient, todayStr]);

  // Quick hydration increment
  const addWater = async (amountMl) => {
    if (!activeClient?._id) return;
    const currentWater = Number(todayLog.water || 0);
    const updatedWater = currentWater + amountMl;

    try {
      await API.post(`/clients/${activeClient._id}/nutrition-log`, {
        date: todayStr,
        calories: todayLog.calories,
        protein: todayLog.protein,
        carbs: todayLog.carbs,
        fats: todayLog.fats,
        water: updatedWater,
        steps: todayLog.steps,
      });
      await loadData();
      showToast(`+${amountMl} ml hydration logged 💧`);
    } catch {
      showToast("Failed to update water intake");
    }
  };

  // Submit today's macro intake
  const handleSaveNutritionLog = async (e) => {
    e.preventDefault();
    if (!activeClient?._id) return;

    try {
      await API.post(`/clients/${activeClient._id}/nutrition-log`, {
        date: todayStr,
        calories: Number(logForm.calories) || todayLog.calories,
        protein: Number(logForm.protein) || todayLog.protein,
        carbs: Number(logForm.carbs) || todayLog.carbs,
        fats: Number(logForm.fats) || todayLog.fats,
        water: Number(logForm.water) || todayLog.water,
        steps: Number(logForm.steps) || todayLog.steps,
        notes: logForm.notes,
      });
      setShowLogModal(false);
      setLogForm({ calories: "", protein: "", carbs: "", fats: "", water: "", steps: "", notes: "" });
      await loadData();
      showToast("Today's nutrition logged successfully ✅");
    } catch {
      showToast("Error saving nutrition log");
    }
  };

  // Submit new weigh-in
  const handleSaveMetric = async (e) => {
    e.preventDefault();
    if (!activeClient?._id || !metricForm.weight) return;

    try {
      await API.post(`/clients/${activeClient._id}/metric`, {
        weight: Number(metricForm.weight),
        bodyFat: metricForm.bodyFat ? Number(metricForm.bodyFat) : null,
        waist: metricForm.waist ? Number(metricForm.waist) : null,
        chest: metricForm.chest ? Number(metricForm.chest) : null,
        notes: metricForm.notes,
      });
      setShowMetricModal(false);
      setMetricForm({ weight: "", bodyFat: "", waist: "", chest: "", notes: "" });
      await loadData();
      showToast("Body weigh-in logged successfully ⚖️");
    } catch {
      showToast("Error saving metric");
    }
  };

  // Delete weigh-in
  const handleDeleteMetric = async (mid) => {
    if (!window.confirm("Remove this weigh-in entry?")) return;
    try {
      await API.delete(`/clients/${activeClient._id}/metric/${mid}`);
      await loadData();
      showToast("Metric entry removed");
    } catch {
      showToast("Failed to delete entry");
    }
  };

  // Update targets (Coach only)
  const handleSaveTargets = async (e) => {
    e.preventDefault();
    if (!activeClient?._id) return;

    try {
      await API.post(`/clients/${activeClient._id}/nutrition-target`, targetForm);
      setShowTargetModal(false);
      await loadData();
      showToast("Nutrition targets updated for athlete 🎯");
    } catch {
      showToast("Failed to update targets");
    }
  };

  // Chart data for weight transformation
  const weightHistory = useMemo(() => {
    const list = activeClient?.bodyMetrics || [];
    return [...list].sort((a, b) => new Date(a.date) - new Date(b.date)).map((m) => ({
      date: new Date(m.date).toLocaleDateString([], { month: "short", day: "numeric" }),
      weight: m.weight,
      bodyFat: m.bodyFat,
      _id: m._id,
      notes: m.notes,
      rawDate: m.date,
    }));
  }, [activeClient]);

  const startWeight = weightHistory[0]?.weight;
  const currentWeight = weightHistory[weightHistory.length - 1]?.weight;
  const netWeightChange = startWeight && currentWeight ? (currentWeight - startWeight).toFixed(1) : 0;

  // Chart data for 7-day calorie adherence
  const recentNutritionLogs = useMemo(() => {
    const logs = activeClient?.nutritionLogs || [];
    return [...logs].slice(-7).map((l) => ({
      date: new Date(l.date).toLocaleDateString([], { weekday: "short" }),
      calories: l.calories || 0,
      protein: l.protein || 0,
      targetCalories: targets.calories,
    }));
  }, [activeClient, targets.calories]);

  // Calorie and Macro Percentages
  const calPercent = Math.min(100, Math.round(((todayLog.calories || 0) / targets.calories) * 100));
  const proPercent = Math.min(100, Math.round(((todayLog.protein || 0) / targets.protein) * 100));
  const carbPercent = Math.min(100, Math.round(((todayLog.carbs || 0) / targets.carbs) * 100));
  const fatPercent = Math.min(100, Math.round(((todayLog.fats || 0) / targets.fats) * 100));
  const waterPercent = Math.min(100, Math.round(((todayLog.water || 0) / targets.water) * 100));
  const stepsPercent = Math.min(100, Math.round(((todayLog.steps || 0) / targets.steps) * 100));

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white/95 px-4 py-3 text-sm font-bold text-emerald-800 shadow-xl backdrop-blur-md animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-white/10">
          <div className="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                <Salad className="h-3.5 w-3.5 text-emerald-400" />
                Metabolic Fueling & Habits OS
              </div>
              <h1 className="mt-2.5 text-2xl sm:text-3xl font-black tracking-tight text-white">
                Nutrition & Body Composition
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Caloric targets, daily macro precision, hydration consistency, and transformation analytics.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isCoach && clients.length > 0 && (
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-md">
                  <span className="text-xs text-slate-300 font-medium">Athlete:</span>
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleClientSelect(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                  >
                    {clients.map((c) => (
                      <option key={c._id} value={c._id} className="text-slate-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isCoach && (
                <button
                  onClick={() => setShowTargetModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  <Edit3 size={14} className="text-emerald-300" />
                  Configure Targets
                </button>
              )}

              <button
                onClick={() => {
                  setLogForm({
                    calories: todayLog.calories || "",
                    protein: todayLog.protein || "",
                    carbs: todayLog.carbs || "",
                    fats: todayLog.fats || "",
                    water: todayLog.water || "",
                    steps: todayLog.steps || "",
                    notes: todayLog.notes || "",
                  });
                  setShowLogModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-500"
              >
                <Plus size={14} />
                Log Today's Intake
              </button>

              <button
                onClick={() => setShowMetricModal(true)}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500"
              >
                <Scale size={14} />
                Log Weigh-In
              </button>
            </div>
          </div>
        </section>

        {/* 4 Macro Progress Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Calories */}
          <div className="glass-panel group relative overflow-hidden rounded-[24px] p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Daily Calories</span>
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Flame className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{todayLog.calories || 0}</span>
              <span className="text-sm font-semibold text-slate-400">/ {targets.calories} kcal</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${calPercent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] font-semibold text-slate-400">
              {Math.max(0, targets.calories - (todayLog.calories || 0))} kcal remaining today
            </p>
          </div>

          {/* Protein */}
          <div className="glass-panel group relative overflow-hidden rounded-[24px] p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Protein Target</span>
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Zap className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{todayLog.protein || 0}g</span>
              <span className="text-sm font-semibold text-slate-400">/ {targets.protein}g</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${proPercent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] font-semibold text-slate-400">
              {proPercent}% of daily lean tissue goal
            </p>
          </div>

          {/* Carbs */}
          <div className="glass-panel group relative overflow-hidden rounded-[24px] p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Carbohydrates</span>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <Apple className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{todayLog.carbs || 0}g</span>
              <span className="text-sm font-semibold text-slate-400">/ {targets.carbs}g</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${carbPercent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] font-semibold text-slate-400">
              Glycogen & performance fueling
            </p>
          </div>

          {/* Fats */}
          <div className="glass-panel group relative overflow-hidden rounded-[24px] p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Healthy Fats</span>
              <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{todayLog.fats || 0}g</span>
              <span className="text-sm font-semibold text-slate-400">/ {targets.fats}g</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-600 transition-all duration-500"
                style={{ width: `${fatPercent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] font-semibold text-slate-400">
              Hormone balance & joint health
            </p>
          </div>
        </div>

        {/* 2-Column: Hydration/Habits & Weight Transformation */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          {/* Left: Hydration & Daily Habits */}
          <div className="space-y-6">
            {/* Water Hydration Card */}
            <div className="glass-panel rounded-[28px] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Hydration Tracker</h2>
                  <p className="text-xs text-slate-500">Fluid balance & recovery support</p>
                </div>
                <div className="rounded-xl bg-sky-50 p-2.5 text-sky-600">
                  <Droplets className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-sky-600">{todayLog.water || 0}</span>
                  <span className="text-sm font-bold text-slate-400"> / {targets.water} ml</span>
                </div>
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700">
                  {waterPercent}% Goal
                </span>
              </div>

              {/* Water Progress Bar */}
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all duration-500"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>

              {/* Quick Tap Water Increment Buttons */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => addWater(250)}
                  className="rounded-xl border border-sky-200 bg-sky-50/70 py-2 text-xs font-bold text-sky-800 transition hover:bg-sky-100"
                >
                  +250 ml
                </button>
                <button
                  type="button"
                  onClick={() => addWater(500)}
                  className="rounded-xl border border-sky-200 bg-sky-50/70 py-2 text-xs font-bold text-sky-800 transition hover:bg-sky-100"
                >
                  +500 ml
                </button>
                <button
                  type="button"
                  onClick={() => addWater(1000)}
                  className="rounded-xl border border-sky-200 bg-sky-50/70 py-2 text-xs font-bold text-sky-800 transition hover:bg-sky-100"
                >
                  +1.0 L
                </button>
              </div>
            </div>

            {/* Daily Steps & Activity */}
            <div className="glass-panel rounded-[28px] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Daily Step Count</h2>
                  <p className="text-xs text-slate-500">Non-exercise activity thermogenesis (NEAT)</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                  <Footprints className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-slate-900">
                    {(todayLog.steps || 0).toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-400">
                    {" "}
                    / {targets.steps.toLocaleString()} steps
                  </span>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  {stepsPercent}% Target
                </span>
              </div>

              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
                  style={{ width: `${stepsPercent}%` }}
                />
              </div>
            </div>

            {/* 7-Day Caloric Adherence Chart */}
            <div className="glass-panel rounded-[28px] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">7-Day Caloric Intake</h2>
                  <p className="text-xs text-slate-500">Daily intake vs {targets.calories} kcal target</p>
                </div>
              </div>

              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recentNutritionLogs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="calories" name="Calories" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right: Body Weight & Transformation Curve */}
          <div className="space-y-6">
            <div className="glass-panel rounded-[28px] p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Body Weight & Composition Trend</h2>
                  <p className="text-xs text-slate-500">Transformation curve across logged weigh-ins</p>
                </div>
                <button
                  onClick={() => setShowMetricModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  <Plus size={13} />
                  Add Weigh-In
                </button>
              </div>

              {/* Transformation Snapshot Stats */}
              <div className="mt-4 grid grid-cols-4 gap-3 text-center">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Start</span>
                  <p className="mt-1 text-base font-black text-slate-800">
                    {startWeight ? `${startWeight} kg` : "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current</span>
                  <p className="mt-1 text-base font-black text-slate-900">
                    {currentWeight ? `${currentWeight} kg` : "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Net Change</span>
                  <p className="mt-1 text-base font-black text-emerald-800">
                    {netWeightChange > 0 ? `+${netWeightChange}` : `${netWeightChange}`} kg
                  </p>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Body Fat</span>
                  <p className="mt-1 text-base font-black text-indigo-800">
                    {weightHistory.slice(-1)[0]?.bodyFat ? `${weightHistory.slice(-1)[0].bodyFat}%` : "-"}
                  </p>
                </div>
              </div>

              {/* Weight Line Chart */}
              <div className="mt-6 h-64">
                {weightHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                      <YAxis
                        domain={["dataMin - 1", "dataMax + 1"]}
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        name="Weight (kg)"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{ fill: "#4f46e5", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    No weigh-in records yet. Log your first weigh-in above.
                  </div>
                )}
              </div>

              {/* Weigh-in History List */}
              <div className="mt-6 border-t border-slate-100 pt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Weigh-In Records ({weightHistory.length})
                </span>
                <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {weightHistory.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs transition hover:bg-white hover:border-slate-300"
                    >
                      <div className="flex items-center gap-3">
                        <Scale className="h-4 w-4 text-indigo-600" />
                        <div>
                          <span className="font-black text-slate-800 text-sm">{item.weight} kg</span>
                          {item.bodyFat && (
                            <span className="ml-2 font-semibold text-slate-500">• {item.bodyFat}% BF</span>
                          )}
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {item.notes && <span className="italic text-slate-500 hidden sm:inline">"{item.notes}"</span>}
                        <button
                          type="button"
                          onClick={() => handleDeleteMetric(item._id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Log Today's Intake */}
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Salad className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900">Log Daily Nutrition</h3>
                </div>
                <button onClick={() => setShowLogModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveNutritionLog} className="mt-4 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Total Calories (kcal)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2400"
                      value={logForm.calories}
                      onChange={(e) => setLogForm({ ...logForm, calories: e.target.value })}
                      className="input-field text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Protein (grams)</label>
                    <input
                      type="number"
                      placeholder="e.g. 180"
                      value={logForm.protein}
                      onChange={(e) => setLogForm({ ...logForm, protein: e.target.value })}
                      className="input-field text-xs py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Carbohydrates (g)</label>
                    <input
                      type="number"
                      placeholder="e.g. 250"
                      value={logForm.carbs}
                      onChange={(e) => setLogForm({ ...logForm, carbs: e.target.value })}
                      className="input-field text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Fats (g)</label>
                    <input
                      type="number"
                      placeholder="e.g. 70"
                      value={logForm.fats}
                      onChange={(e) => setLogForm({ ...logForm, fats: e.target.value })}
                      className="input-field text-xs py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Water Intake (ml)</label>
                    <input
                      type="number"
                      placeholder="e.g. 3500"
                      value={logForm.water}
                      onChange={(e) => setLogForm({ ...logForm, water: e.target.value })}
                      className="input-field text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Step Count</label>
                    <input
                      type="number"
                      placeholder="e.g. 10000"
                      value={logForm.steps}
                      onChange={(e) => setLogForm({ ...logForm, steps: e.target.value })}
                      className="input-field text-xs py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Meal / Digestion Notes</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. High protein breakfast, good satiety throughout afternoon..."
                    value={logForm.notes}
                    onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="mt-4 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-button text-xs py-2 px-5 bg-emerald-600 hover:bg-emerald-700">
                    Save Daily Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Log Weigh-In */}
        {showMetricModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900">Log Body Weigh-In</h3>
                </div>
                <button onClick={() => setShowMetricModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveMetric} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Body Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 78.4"
                    value={metricForm.weight}
                    onChange={(e) => setMetricForm({ ...metricForm, weight: e.target.value })}
                    className="input-field text-xs py-2 font-bold"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Body Fat %</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 15.5"
                      value={metricForm.bodyFat}
                      onChange={(e) => setMetricForm({ ...metricForm, bodyFat: e.target.value })}
                      className="input-field text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Waist (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 84"
                      value={metricForm.waist}
                      onChange={(e) => setMetricForm({ ...metricForm, waist: e.target.value })}
                      className="input-field text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Chest (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 104"
                      value={metricForm.chest}
                      onChange={(e) => setMetricForm({ ...metricForm, chest: e.target.value })}
                      className="input-field text-xs py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Progress Notes</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Morning fasted weigh-in, feeling leaner..."
                    value={metricForm.notes}
                    onChange={(e) => setMetricForm({ ...metricForm, notes: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="mt-4 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMetricModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-button text-xs py-2 px-5">
                    Save Weigh-In
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Configure Targets (Coach Only) */}
        {showTargetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900">Set Nutrition Targets</h3>
                </div>
                <button onClick={() => setShowTargetModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveTargets} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Target Calories (kcal/day)</label>
                  <input
                    type="number"
                    required
                    value={targetForm.calories}
                    onChange={(e) => setTargetForm({ ...targetForm, calories: Number(e.target.value) })}
                    className="input-field text-xs py-2 font-bold"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Protein (g)</label>
                    <input
                      type="number"
                      required
                      value={targetForm.protein}
                      onChange={(e) => setTargetForm({ ...targetForm, protein: Number(e.target.value) })}
                      className="input-field text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      required
                      value={targetForm.carbs}
                      onChange={(e) => setTargetForm({ ...targetForm, carbs: Number(e.target.value) })}
                      className="input-field text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Fats (g)</label>
                    <input
                      type="number"
                      required
                      value={targetForm.fats}
                      onChange={(e) => setTargetForm({ ...targetForm, fats: Number(e.target.value) })}
                      className="input-field text-xs py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Water Goal (ml/day)</label>
                    <input
                      type="number"
                      required
                      value={targetForm.water}
                      onChange={(e) => setTargetForm({ ...targetForm, water: Number(e.target.value) })}
                      className="input-field text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Daily Step Goal</label>
                    <input
                      type="number"
                      required
                      value={targetForm.steps}
                      onChange={(e) => setTargetForm({ ...targetForm, steps: Number(e.target.value) })}
                      className="input-field text-xs py-2"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTargetModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-button text-xs py-2 px-5">
                    Save Client Targets
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
