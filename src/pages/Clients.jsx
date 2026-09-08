import Layout from "../components/Layout";
import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Dumbbell, Plus, Search, StickyNote, Trash2, Users } from "lucide-react";
import API from "../api";

function Clients() {
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [workouts, setWorkouts] = useState([]);

  const [selectedClient, setSelectedClient] = useState(null);

  // 🔥 Searchable dropdown
  const [searchUser, setSearchUser] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef();

  const [newWorkout, setNewWorkout] = useState("");
  const [newNote, setNewNote] = useState("");
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);

  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchClients();
    fetchUsers();
    fetchWorkouts();
  }, []);

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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1500);
  };

  const fetchClients = async () => {
    const res = await API.get("/clients");
    setClients(res.data);

    if (selectedClient) {
      const updated = res.data.find(c => c._id === selectedClient._id);
      setSelectedClient(updated || null);
    }
  };

  const fetchUsers = async () => {
    const res = await API.get("/auth/users");
    setUsers(res.data.filter(u => u.role === "client"));
  };

  const fetchWorkouts = async () => {
    const res = await API.get("/workouts");
    setWorkouts(res.data);
  };

  // ✅ Only users not already added
  const availableUsers = users.filter(
    (u) => !clients.some(c => c.userId?.toString() === u._id)
  );

  // 🔍 Search filter
  const filteredUsers = availableUsers.filter((u) =>
    u.name.toLowerCase().includes(searchUser.toLowerCase())
  );

  // ADD CLIENT
  const addClient = async () => {
    if (!selectedUser) {
      showToast("Select user first");
      return;
    }

    try {
      await API.post("/clients", { userId: selectedUser._id });
      setSelectedUser(null);
      setSearchUser("");
      setShowDropdown(false);
      fetchClients();
      showToast("Client added ✅");
    } catch (err) {
      showToast(err.response?.data?.msg || "Error");
    }
  };

  // DELETE CLIENT
  const deleteClient = async () => {
    if (!selectedClient) return;

    if (!window.confirm(`Delete ${selectedClient.name}?`)) return;

    try {
      await API.delete(`/clients/${selectedClient._id}`);
      setSelectedClient(null);
      setSelectedWorkouts([]);
      fetchClients();
      showToast("Client deleted 🗑️");
    } catch {
      showToast("Error deleting client");
    }
  };

  // ADD GLOBAL WORKOUT
  const addWorkout = async () => {
    if (!newWorkout) return;

    try {
      await API.post("/workouts", { name: newWorkout });
      setNewWorkout("");
      fetchWorkouts();
      showToast("Workout added 💪");
    } catch {
      showToast("Error adding workout");
    }
  };

  // ASSIGN WORKOUT
  const assignWorkout = async (name) => {
    if (!selectedClient) {
      showToast("Select client first");
      return;
    }

    try {
      await API.post(`/clients/${selectedClient._id}/workout`, { name });
      fetchClients();
      showToast("Assigned ✅");
    } catch (err) {
      showToast(err.response?.data?.msg || "Error");
    }
  };

  const addCoachNote = async () => {
    if (!selectedClient || !newNote.trim()) {
      showToast("Select a client and write a note first");
      return;
    }

    try {
      await API.post(`/clients/${selectedClient._id}/note`, { text: newNote });
      setNewNote("");
      fetchClients();
      showToast("Coach note added");
    } catch (err) {
      showToast(err.response?.data?.msg || "Error adding note");
    }
  };

  // DELETE SINGLE
  const deleteWorkout = async (wid) => {
    try {
      await API.delete(`/clients/${selectedClient._id}/workout/${wid}`);
      fetchClients();
      showToast("Removed");
    } catch {
      showToast("Error removing");
    }
  };

  // MULTI DELETE
  const deleteMultiple = async () => {
    try {
      await API.post(`/clients/${selectedClient._id}/workout/delete-many`, {
        ids: selectedWorkouts,
      });

      setSelectedWorkouts([]);
      fetchClients();
      showToast("Deleted selected");
    } catch {
      showToast("Error deleting");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">

        {/* TOAST */}
        {toast && (
          <div className="fixed right-6 top-6 z-[100] rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl">
            {toast}
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
          <div className="glass-panel rounded-2xl p-4"><p className="text-sm text-slate-500">Clients</p><p className="mt-1 text-2xl font-black text-slate-900">{clients.length}</p></div>
          <div className="glass-panel rounded-2xl p-4"><p className="text-sm text-slate-500">Library exercises</p><p className="mt-1 text-2xl font-black text-blue-700">{workouts.length}</p></div>
          <div className="glass-panel rounded-2xl p-4"><p className="text-sm text-slate-500">Assigned workouts</p><p className="mt-1 text-2xl font-black text-emerald-600">{clients.reduce((count, client) => count + (client.workouts || []).length, 0)}</p></div>
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
              <div className="mt-2 max-h-60 w-full overflow-y-auto overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
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
            disabled={!selectedUser}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Plus size={17} />
            Add Client
          </button>
          </div>
        </div>

        {/* WORKOUT LIBRARY */}
        <div className="glass-panel rounded-[28px] p-5">
          <div className="mb-4 flex items-center gap-2"><Dumbbell size={18} className="text-blue-600" /><h2 className="font-bold text-slate-800">Workout library</h2></div>

          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={newWorkout}
              onChange={(e) => setNewWorkout(e.target.value)}
              placeholder="Add workout"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-400 sm:max-w-xs"
            />
            <button
              onClick={addWorkout}
              className="primary-button"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {workouts.map(w => (
              <div
                key={w._id}
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData("workout", w.name)
                }
                onClick={() => assignWorkout(w.name)}
                className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {w.name}
              </div>
            ))}
          </div>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[0.8fr_1.2fr]">

          {/* CLIENT LIST */}
          <div className="glass-panel rounded-[28px] p-5">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-slate-800">Clients</h2><span className="text-xs text-slate-400">Select to manage</span></div>

            {clients.map(c => (
              <div
                key={c._id}
                onClick={() => setSelectedClient(c)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const name = e.dataTransfer.getData("workout");
                  assignWorkout(name);
                }}
                className={`mb-2 flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${
                  selectedClient?._id === c._id
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-white"
                }`}
              >
                <span className="font-semibold text-slate-700">{c.name}</span>
                <span className="text-xs text-slate-400">{(c.workouts || []).length} workouts</span>
              </div>
            ))}
          </div>

          {/* WORKOUT SECTION */}
          <div className="glass-panel rounded-[28px] p-5">

            <div className="flex justify-between mb-3">
              <h2 className="font-bold text-slate-800">
                {selectedClient
                  ? `${selectedClient.name}'s Workouts`
                  : "Select client"}
              </h2>

              {selectedClient && (
                <button
                  onClick={deleteClient}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-700"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              )}
            </div>

            {selectedClient && (
              <>
                <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><StickyNote size={16} className="text-blue-600" /> Add coach note</p>
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

                {/* ✅ PROGRESS BAR */}
                {(() => {
                  const total = selectedClient.workouts.length;
                  const done = selectedClient.workouts.filter(w => w.done).length;
                  const percent = total ? Math.round((done / total) * 100) : 0;

                  return (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-500">Progress</span>
                        <span>{percent}%</span>
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

                {selectedWorkouts.length > 0 && (
                  <button
                    onClick={deleteMultiple}
                    className="text-red-500 mb-3 text-sm"
                  >
                    Delete Selected ({selectedWorkouts.length})
                  </button>
                )}

                {selectedClient.workouts.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No workouts assigned
                  </p>
                ) : (
                  selectedClient.workouts.map(w => (
                    <div
                      key={w._id}
                      className="mb-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <input
                        type="checkbox"
                        checked={w.done || false}
                        onChange={async () => {
                          await API.put(
                            `/clients/${selectedClient._id}/workout/${w._id}`
                          );
                          fetchClients();
                        }}
                      />

                      <span className={`flex-1 ${w.done ? "line-through text-gray-400" : ""}`}>
                        {w.name}
                      </span>

                      <button
                        onClick={() => deleteWorkout(w._id)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-700"
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