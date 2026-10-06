import Layout from "../components/Layout";
import { useState, useEffect, useRef, useCallback } from "react";
import { CheckCircle2, Dumbbell, Plus, Search, StickyNote, Trash2, Users, AlertCircle, X } from "lucide-react";
import API from "../api";

function Clients() {
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchUser, setSearchUser] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newWorkout, setNewWorkout] = useState("");
  const [newNote, setNewNote] = useState("");
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [toast, setToast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const dropdownRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await API.get("/clients");
      setClients(res.data);
      setSelectedClient((prev) => {
        if (!prev) return null;
        return res.data.find((c) => c._id === prev._id) || null;
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get("/auth/users");
      setUsers(res.data.filter((u) => u.role === "client"));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchWorkouts = useCallback(async () => {
    try {
      const res = await API.get("/workouts");
      setWorkouts(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchClients();
    fetchUsers();
    fetchWorkouts();
  }, [fetchClients, fetchUsers, fetchWorkouts]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Clear selected batch workouts when client changes
  useEffect(() => {
    setSelectedWorkouts([]);
  }, [selectedClient?._id]);

  // Available client users not already enrolled
  const availableUsers = users.filter(
    (u) => !clients.some((c) => c.userId?.toString() === u._id)
  );

  const filteredUsers = availableUsers.filter((u) =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  // ADD CLIENT
  const addClient = async () => {
    if (!selectedUser) {
      showToast("Select a client user first");
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post("/clients", { userId: selectedUser._id });
      setSelectedUser(null);
      setSearchUser("");
      setShowDropdown(false);
      await fetchClients();
      showToast("Client added successfully ✅");
    } catch (err) {
      showToast(err.response?.data?.msg || "Failed to add client");
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE CLIENT
  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;

    try {
      await API.delete(`/clients/${clientToDelete._id}`);
      if (selectedClient?._id === clientToDelete._id) {
        setSelectedClient(null);
      }
      setSelectedWorkouts([]);
      setClientToDelete(null);
      await fetchClients();
      showToast("Client removed 🗑️");
    } catch {
      showToast("Error deleting client");
    }
  };

  // ADD GLOBAL WORKOUT
  const addWorkout = async () => {
    if (!newWorkout.trim()) return;

    try {
      await API.post("/workouts", { name: newWorkout.trim() });
      setNewWorkout("");
      await fetchWorkouts();
      showToast("Workout template added 💪");
    } catch {
      showToast("Error adding workout template");
    }
  };

  // ASSIGN WORKOUT (Supports targetClientId for drag-and-drop onto specific client)
  const assignWorkout = async (name, targetClientId = selectedClient?._id) => {
    if (!targetClientId) {
      showToast("Select a client first or drag onto a client");
      return;
    }

    try {
      await API.post(`/clients/${targetClientId}/workout`, { name });
      await fetchClients();
      showToast(`Assigned "${name}" ✅`);
    } catch (err) {
      showToast(err.response?.data?.msg || "Error assigning workout");
    }
  };

  const addCoachNote = async () => {
    if (!selectedClient || !newNote.trim()) {
      showToast("Select a client and write a note first");
      return;
    }

    try {
      await API.post(`/clients/${selectedClient._id}/note`, { text: newNote.trim() });
      setNewNote("");
      await fetchClients();
      showToast("Coach note saved");
    } catch (err) {
      showToast(err.response?.data?.msg || "Error adding note");
    }
  };

  // DELETE SINGLE
  const deleteWorkout = async (wid) => {
    try {
      await API.delete(`/clients/${selectedClient._id}/workout/${wid}`);
      setSelectedWorkouts((prev) => prev.filter((id) => id !== wid));
      await fetchClients();
      showToast("Workout removed");
    } catch {
      showToast("Error removing workout");
    }
  };

  // MULTI DELETE
  const deleteMultiple = async () => {
    if (!selectedWorkouts.length || !selectedClient) return;

    try {
      await API.post(`/clients/${selectedClient._id}/workout/delete-many`, {
        ids: selectedWorkouts,
      });

      setSelectedWorkouts([]);
      await fetchClients();
      showToast("Deleted selected workouts");
    } catch {
      showToast("Error deleting selected workouts");
    }
  };

  const toggleSelectWorkout = (workoutId) => {
    setSelectedWorkouts((prev) =>
      prev.includes(workoutId)
        ? prev.filter((id) => id !== workoutId)
        : [...prev, workoutId]
    );
  };

  const toggleSelectAllWorkouts = () => {
    if (!selectedClient?.workouts?.length) return;
    if (selectedWorkouts.length === selectedClient.workouts.length) {
      setSelectedWorkouts([]);
    } else {
      setSelectedWorkouts(selectedClient.workouts.map((w) => w._id));
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">

        {/* TOAST NOTIFICATION */}
        {toast && (
          <div className="fixed right-6 top-6 z-[100] flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toast}
          </div>
        )}

        {/* CONFIRM DELETE MODAL */}
        {clientToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle size={24} />
                <h3 className="text-lg font-bold text-slate-900">Remove Client</h3>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Are you sure you want to remove <strong className="text-slate-900">{clientToDelete.name}</strong>? All assigned workouts, notes, and session schedules for this client will be deleted.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setClientToDelete(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteClient}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:bg-red-700"
                >
                  Delete Client
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="rounded-[28px] bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">Client operations</p>
              <h1 className="mt-2 text-3xl font-black">Manage your clients</h1>
              <p className="mt-2 text-sm text-slate-300">Assign workouts, write coaching notes, and keep every athlete moving forward.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-100">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              {clients.length} active clients
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-sm text-slate-500">Clients</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{clients.length}</p>
          </div>
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-sm text-slate-500">Library exercises</p>
            <p className="mt-1 text-2xl font-black text-blue-700">{workouts.length}</p>
          </div>
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-sm text-slate-500">Assigned workouts</p>
            <p className="mt-1 text-2xl font-black text-emerald-600">
              {clients.reduce((count, client) => count + (client.workouts || []).length, 0)}
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <h2 className="font-bold text-slate-800">Add a client account</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div ref={dropdownRef} className="relative w-full max-w-md">
              <Search size={17} className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search available client accounts..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />

              {showDropdown && filteredUsers.length > 0 && (
                <div className="mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                  {filteredUsers.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(u);
                        setSearchUser(u.name);
                        setShowDropdown(false);
                      }}
                      className="block w-full border-b border-slate-100 p-3 text-left transition last:border-0 hover:bg-blue-50"
                    >
                      <p className="font-medium text-slate-800">{u.name}</p>
                      <p className="text-sm text-slate-500">{u.email}</p>
                    </button>
                  ))}
                </div>
              )}
              {showDropdown && filteredUsers.length === 0 && (
                <p className="mt-2 text-sm text-slate-500">
                  {availableUsers.length === 0
                    ? "All client accounts are already added."
                    : "No available clients match your search."}
                </p>
              )}
            </div>

            <button
              onClick={addClient}
              disabled={!selectedUser || isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Plus size={17} />
              {isSubmitting ? "Adding..." : "Add Client"}
            </button>
          </div>
        </div>

        {/* WORKOUT LIBRARY */}
        <div className="glass-panel rounded-[28px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell size={18} className="text-blue-600" />
              <h2 className="font-bold text-slate-800">Workout library</h2>
            </div>
            <span className="text-xs text-slate-400">Click to assign to selected client or drag onto any client</span>
          </div>

          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={newWorkout}
              onChange={(e) => setNewWorkout(e.target.value)}
              placeholder="New exercise template name..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-400 sm:max-w-xs"
            />
            <button
              onClick={addWorkout}
              className="primary-button"
            >
              Add template
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {workouts.map((w) => (
              <div
                key={w._id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("workout", w.name)}
                onClick={() => assignWorkout(w.name)}
                title="Click to assign to current client or drag onto client card"
                className="cursor-grab active:cursor-grabbing rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 shadow-sm"
              >
                {w.name}
              </div>
            ))}
          </div>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[0.8fr_1.2fr]">

          {/* CLIENT LIST */}
          <div className="glass-panel rounded-[28px] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Clients</h2>
              <span className="text-xs text-slate-400">Select or drop workouts below</span>
            </div>

            {clients.length === 0 ? (
              <p className="text-sm text-slate-400">No clients yet. Add one from above.</p>
            ) : (
              clients.map((c) => (
                <div
                  key={c._id}
                  onClick={() => setSelectedClient(c)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const name = e.dataTransfer.getData("workout");
                    if (name) assignWorkout(name, c._id);
                  }}
                  className={`mb-2 flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${
                    selectedClient?._id === c._id
                      ? "border-blue-300 bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-white"
                  }`}
                >
                  <div>
                    <span className="font-semibold text-slate-700">{c.name}</span>
                    <p className="text-xs text-slate-400">{(c.workouts || []).length} workouts assigned</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 hover:underline">
                    {selectedClient?._id === c._id ? "Viewing" : "Manage"}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* WORKOUT SECTION */}
          <div className="glass-panel rounded-[28px] p-5">

            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">
                {selectedClient
                  ? `${selectedClient.name}'s Workouts`
                  : "Select a client to view workouts"}
              </h2>

              {selectedClient && (
                <button
                  onClick={() => setClientToDelete(selectedClient)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                >
                  <Trash2 size={15} />
                  Delete Client
                </button>
              )}
            </div>

            {selectedClient && (
              <>
                <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <StickyNote size={16} className="text-blue-600" /> Add coach note
                  </p>
                  <textarea
                    rows="3"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={`Write a coaching note for ${selectedClient.name}...`}
                    className="w-full rounded-xl border border-blue-100 bg-white p-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={addCoachNote}
                    disabled={!newNote.trim()}
                    className="primary-button mt-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save note
                  </button>
                </div>

                {/* PROGRESS BAR */}
                {(() => {
                  const total = selectedClient.workouts?.length || 0;
                  const done = selectedClient.workouts?.filter((w) => w.done).length || 0;
                  const percent = total ? Math.round((done / total) * 100) : 0;

                  return (
                    <div className="mb-4">
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-slate-500">Completion</span>
                        <span className="font-semibold text-slate-700">{percent}% ({done}/{total})</span>
                      </div>

                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* BATCH ACTION CONTROLS */}
                {selectedClient.workouts?.length > 0 && (
                  <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
                    <button
                      type="button"
                      onClick={toggleSelectAllWorkouts}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-600"
                    >
                      {selectedWorkouts.length === selectedClient.workouts.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>

                    {selectedWorkouts.length > 0 && (
                      <button
                        onClick={deleteMultiple}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                      >
                        <Trash2 size={13} />
                        Delete Selected ({selectedWorkouts.length})
                      </button>
                    )}
                  </div>
                )}

                {selectedClient.workouts?.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-400">
                    No workouts assigned yet. Click or drag an exercise template from the library above.
                  </p>
                ) : (
                  selectedClient.workouts.map((w) => (
                    <div
                      key={w._id}
                      className={`mb-2 flex items-center gap-3 rounded-2xl border p-3 transition ${
                        selectedWorkouts.includes(w._id)
                          ? "border-blue-300 bg-blue-50/70"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      {/* Selection checkbox for batch delete */}
                      <input
                        type="checkbox"
                        title="Select for batch delete"
                        checked={selectedWorkouts.includes(w._id)}
                        onChange={() => toggleSelectWorkout(w._id)}
                        className="h-4 w-4 rounded accent-blue-600"
                      />

                      {/* Workout completion checkbox */}
                      <input
                        type="checkbox"
                        title="Mark workout complete"
                        checked={w.done || false}
                        onChange={async () => {
                          await API.put(
                            `/clients/${selectedClient._id}/workout/${w._id}`
                          );
                          fetchClients();
                        }}
                        className="h-4 w-4 rounded accent-emerald-500"
                      />

                      <span className={`flex-1 text-sm font-medium ${w.done ? "line-through text-slate-400" : "text-slate-700"}`}>
                        {w.name}
                      </span>

                      <button
                        onClick={() => deleteWorkout(w._id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Clients;