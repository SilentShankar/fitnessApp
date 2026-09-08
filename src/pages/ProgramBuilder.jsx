import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api";

const emptyExercise = { name: "", sets: 3, reps: "10", rest: "60 sec", notes: "" };

function ProgramBuilder() {
  const [clients, setClients] = useState([]);
  const [library, setLibrary] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", assignedTo: "" });
  const [exercises, setExercises] = useState([]);
  const [exerciseDraft, setExerciseDraft] = useState(emptyExercise);
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadBuilderData();
  }, []);

  const loadBuilderData = async () => {
    try {
      const [clientsResponse, libraryResponse, programsResponse] = await Promise.all([
        API.get("/clients"),
        API.get("/workouts"),
        API.get("/programs"),
      ]);
      setClients(clientsResponse.data);
      setLibrary(libraryResponse.data);
      setPrograms(programsResponse.data);
      if (clientsResponse.data[0]) {
        setForm((current) => ({ ...current, assignedTo: clientsResponse.data[0].userId }));
      }
    } catch (err) {
      setStatus(err.response?.data?.msg || "Unable to load program builder");
    }
  };

  const addExercise = () => {
    if (!exerciseDraft.name.trim()) return;
    setExercises((current) => [...current, { ...exerciseDraft, name: exerciseDraft.name.trim() }]);
    setExerciseDraft(emptyExercise);
  };

  const addFromLibrary = (name) => {
    setExerciseDraft((current) => ({ ...current, name }));
  };

  const removeExercise = (index) => {
    setExercises((current) => current.filter((_, exerciseIndex) => exerciseIndex !== index));
  };

  const saveProgram = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.assignedTo || exercises.length === 0) {
      setStatus("Add a name, client, and at least one exercise.");
      return;
    }

    try {
      await API.post("/programs", { ...form, exercises });
      setStatus("Program assigned successfully.");
      setForm((current) => ({ ...current, name: "", description: "" }));
      setExercises([]);
      loadBuilderData();
    } catch (err) {
      setStatus(err.response?.data?.msg || "Unable to save program");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">Trainer studio</p>
          <h1 className="mt-2 text-3xl font-black">Build a training program</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Assemble a focused plan and assign it directly to a client.</p>
        </section>

        {status && <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{status}</div>}

        <div className="grid items-start gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <form onSubmit={saveProgram} className="glass-panel rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Program details</h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{exercises.length} exercises</span>
            </div>

            <div className="space-y-4">
              <label className="block text-sm text-slate-600">
                <span className="mb-1 block">Program name</span>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Lower body strength block" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white" />
              </label>

              <label className="block text-sm text-slate-600">
                <span className="mb-1 block">Assign to client</span>
                <select required value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white">
                  <option value="">Choose a client</option>
                  {clients.map((client) => <option key={client._id} value={client.userId}>{client.name}</option>)}
                </select>
              </label>

              <label className="block text-sm text-slate-600">
                <span className="mb-1 block">Coach description</span>
                <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Training focus, intent, and coaching cues" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white" />
              </label>

              <div className="border-t border-slate-200 pt-5">
                <h3 className="mb-3 font-semibold text-slate-800">Add exercise</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm text-slate-600 sm:col-span-2">
                    <span className="mb-1 block font-medium">Exercise name</span>
                    <input value={exerciseDraft.name} onChange={(e) => setExerciseDraft({ ...exerciseDraft, name: e.target.value })} placeholder="e.g. Pull-ups" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white" />
                  </label>
                  <label className="block text-sm text-slate-600">
                    <span className="mb-1 block font-medium">Sets</span>
                    <input type="number" min="1" value={exerciseDraft.sets} onChange={(e) => setExerciseDraft({ ...exerciseDraft, sets: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white" />
                  </label>
                  <label className="block text-sm text-slate-600">
                    <span className="mb-1 block font-medium">Reps / duration</span>
                    <input value={exerciseDraft.reps} onChange={(e) => setExerciseDraft({ ...exerciseDraft, reps: e.target.value })} placeholder="e.g. 10 or 30 sec" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white" />
                  </label>
                  <label className="block text-sm text-slate-600">
                    <span className="mb-1 block font-medium">Rest</span>
                    <input value={exerciseDraft.rest} onChange={(e) => setExerciseDraft({ ...exerciseDraft, rest: e.target.value })} placeholder="e.g. 60 sec" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white" />
                  </label>
                  <label className="block text-sm text-slate-600">
                    <span className="mb-1 block font-medium">Coaching note</span>
                    <input value={exerciseDraft.notes} onChange={(e) => setExerciseDraft({ ...exerciseDraft, notes: e.target.value })} placeholder="Optional cue" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white" />
                  </label>
                </div>
                <button type="button" onClick={addExercise} className="primary-button mt-3">Add exercise</button>
              </div>

              <div className="space-y-3">
                {exercises.map((exercise, index) => (
                  <div key={`${exercise.name}-${index}`} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <p className="font-semibold text-slate-800">{index + 1}. {exercise.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{exercise.sets} sets · {exercise.reps} · {exercise.rest}</p>
                      {exercise.notes && <p className="mt-1 text-xs text-slate-400">{exercise.notes}</p>}
                    </div>
                    <button type="button" onClick={() => removeExercise(index)} className="text-sm font-semibold text-red-500">Remove</button>
                  </div>
                ))}
              </div>

              <button type="submit" disabled={!form.name.trim() || !form.assignedTo || exercises.length === 0} className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-50">Assign program</button>
            </div>
          </form>

          <div className="space-y-6 xl:sticky xl:top-6">
            <div className="glass-panel rounded-[28px] p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-800">Exercise library</h2>
              <div className="flex flex-wrap gap-2">
                {library.length > 0 ? library.map((exercise) => (
                  <button key={exercise._id} type="button" onClick={() => addFromLibrary(exercise.name)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                    {exercise.name}
                  </button>
                )) : <p className="text-sm text-slate-500">Your workout library is empty. Add exercises from the Clients page first.</p>}
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Assigned programs</h2>
                <span className="text-sm text-slate-500">{programs.length} total</span>
              </div>
              <div className="space-y-3">
                {programs.length > 0 ? programs.slice(0, 5).map((program) => (
                  <div key={program._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">{program.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{program.assignedTo?.name || "Unassigned"}</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">Active</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">{program.exercises.length} exercises</p>
                  </div>
                )) : <p className="text-sm text-slate-500">No programs assigned yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProgramBuilder;
