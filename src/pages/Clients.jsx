import Layout from "../components/Layout";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  CheckCircle2,
  Dumbbell,
  Plus,
  Search,
  StickyNote,
  Trash2,
  Users,
  AlertCircle,
  X,
  Filter,
  Check,
  ChevronRight,
  Sparkles,
  Layers,
  Flame,
  RefreshCw,
  UserCheck,
} from "lucide-react";
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  // New UI enhancement states
  const [rosterSearch, setRosterSearch] = useState("");
  const [librarySearch, setLibrarySearch] = useState("");
  const [workoutFilterTab, setWorkoutFilterTab] = useState("all"); // 'all' | 'pending' | 'completed'
  const [dragOverClientId, setDragOverClientId] = useState(null);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchClients(), fetchUsers(), fetchWorkouts()]);
    setIsRefreshing(false);
    showToast("Athlete roster refreshed ✅");
  };

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
  const availableUsers = useMemo(() => {
    return users.filter((u) => {
      return !clients.some((c) => {
        const cUid = c.userId?._id ? c.userId._id.toString() : c.userId?.toString();
        return cUid === u._id?.toString();
      });
    });
  }, [users, clients]);

  const filteredUsers = useMemo(() => {
    if (!searchUser.trim()) return availableUsers;
    const q = searchUser.toLowerCase().trim();
    return availableUsers.filter((u) =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [availableUsers, searchUser]);

  // Filtered athlete roster based on rosterSearch
  const filteredClients = useMemo(() => {
    if (!rosterSearch.trim()) return clients;
    const q = rosterSearch.toLowerCase().trim();
    return clients.filter((c) => {
      const email = c.email || (typeof c.userId === "object" ? c.userId?.email : "") || "";
      const name = c.name || "";
      return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
    });
  }, [clients, rosterSearch]);

  // Filtered workout templates in library
  const filteredLibrary = useMemo(() => {
    if (!librarySearch.trim()) return workouts;
    return workouts.filter((w) =>
      w.name.toLowerCase().includes(librarySearch.toLowerCase())
    );
  }, [workouts, librarySearch]);

  // ENROLL ATHLETE INTO ROSTER
  const enrollUser = async (userToEnroll = selectedUser) => {
    if (!userToEnroll) {
      showToast("Select a registered user from the dropdown first");
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post("/clients", { userId: userToEnroll._id });
      setSelectedUser(null);
      setSearchUser("");
      setShowDropdown(false);
      await Promise.all([fetchClients(), fetchUsers()]);
      showToast(`${userToEnroll.name} enrolled to athlete roster ✅`);
    } catch (err) {
      showToast(err.response?.data?.msg || "Failed to enroll athlete");
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
      showToast("Client removed from roster 🗑️");
    } catch {
      showToast("Error deleting client");
    }
  };

  // ADD GLOBAL WORKOUT TEMPLATE
  const addWorkout = async () => {
    if (!newWorkout.trim()) return;

    try {
      await API.post("/workouts", { name: newWorkout.trim() });
      setNewWorkout("");
      await fetchWorkouts();
      showToast("Exercise template saved to library 💪");
    } catch {
      showToast("Error adding workout template");
    }
  };

  // ASSIGN WORKOUT
  const assignWorkout = async (name, targetClientId = selectedClient?._id) => {
    if (!targetClientId) {
      showToast("Select a client first or drag onto an athlete card");
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
      showToast("Select an athlete and write a note first");
      return;
    }

    try {
      await API.post(`/clients/${selectedClient._id}/note`, { text: newNote.trim() });
      setNewNote("");
      await fetchClients();
      showToast("Coach note saved ✅");
    } catch (err) {
      showToast(err.response?.data?.msg || "Error adding note");
    }
  };

  const deleteCoachNote = async (nid) => {
    if (!selectedClient) return;
    try {
      await API.delete(`/clients/${selectedClient._id}/note/${nid}`);
      await fetchClients();
      showToast("Coach note removed 🗑️");
    } catch {
      showToast("Error deleting note");
    }
  };

  // DELETE SINGLE WORKOUT
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

  // MULTI DELETE WORKOUTS
  const deleteMultiple = async () => {
    if (!selectedWorkouts.length || !selectedClient) return;

    try {
      await API.post(`/clients/${selectedClient._id}/workout/delete-many`, {
        ids: selectedWorkouts,
      });

      setSelectedWorkouts([]);
      await fetchClients();
      showToast(`Deleted ${selectedWorkouts.length} workouts`);
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

  const toggleSelectAllWorkouts = (workoutsToToggle) => {
    if (!workoutsToToggle.length) return;
    const allIds = workoutsToToggle.map((w) => w._id);
    const allSelected = allIds.every((id) => selectedWorkouts.includes(id));

    if (allSelected) {
      setSelectedWorkouts((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedWorkouts((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  // Filter client's assigned workouts
  const visibleWorkouts = useMemo(() => {
    if (!selectedClient?.workouts) return [];
    if (workoutFilterTab === "pending") return selectedClient.workouts.filter((w) => !w.done);
    if (workoutFilterTab === "completed") return selectedClient.workouts.filter((w) => w.done);
    return selectedClient.workouts;
  }, [selectedClient, workoutFilterTab]);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Floating Toast Notification */}
        {toast && (
          <div className="fixed right-6 top-6 z-[100] flex items-center gap-2 rounded-2xl bg-slate-900/95 px-4 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur-md animate-fade-in border border-white/10">
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toast}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {clientToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center gap-3 text-red-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Remove Athlete</h3>
                  <p className="text-xs text-slate-500">Irreversible action</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-900">{clientToDelete.name}</strong>?
                All assigned workouts, coaching notes, and appointment schedules will be deleted.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setClientToDelete(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteClient}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-500/20 hover:bg-red-700 transition"
                >
                  Delete Athlete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Banner */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-white/10">
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300">
                Roster Operations
              </span>
              <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
                Athlete & Workout Studio
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Assign exercises, curate template libraries, and track individual athlete progress.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>{clients.length} Active Athletes</span>
            </div>
          </div>
        </section>

        {/* Summary Metric Counters */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass-panel rounded-2xl p-4 card-hover-lift">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Athletes</span>
            <p className="mt-1 text-2xl font-black text-slate-900">{clients.length}</p>
          </div>
          <div className="glass-panel rounded-2xl p-4 card-hover-lift">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exercise Templates</span>
            <p className="mt-1 text-2xl font-black text-blue-600">{workouts.length}</p>
          </div>
          <div className="glass-panel rounded-2xl p-4 card-hover-lift">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Assigned Workouts</span>
            <p className="mt-1 text-2xl font-black text-emerald-600">
              {clients.reduce((count, client) => count + (client.workouts || []).length, 0)}
            </p>
          </div>
        </div>

        {/* Enroll Athlete Account Card */}
        <div className="glass-panel relative z-40 rounded-[28px] p-6 overflow-visible">
          <div className="mb-3 flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <h2 className="font-bold text-slate-800 text-base">Enroll Athlete Account</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Search for registered user accounts to assign them to your active coaching roster.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div ref={dropdownRef} className="relative w-full max-w-md">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search registered athletes..."
                value={searchUser}
                onChange={(e) => {
                  setSearchUser(e.target.value);
                  setSelectedUser(null);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  fetchUsers();
                  setShowDropdown(true);
                }}
                className="input-field pl-10 pr-9"
              />
              {searchUser && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchUser("");
                    setSelectedUser(null);
                  }}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}

              {showDropdown && (
                <div className="absolute left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl p-2.5 ring-1 ring-slate-900/10">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100">
                    <span>Registered Clients ({filteredUsers.length})</span>
                    <span>Click user to select</span>
                  </div>

                  {filteredUsers.length > 0 ? (
                    <div className="space-y-1 pt-1.5">
                      {filteredUsers.map((u) => {
                        const isChosen = selectedUser?._id === u._id;
                        return (
                          <div
                            key={u._id}
                            className={`flex items-center justify-between p-2.5 rounded-xl transition ${
                              isChosen
                                ? "bg-blue-50 border border-blue-200"
                                : "hover:bg-slate-50 border border-transparent"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUser(u);
                                setSearchUser(u.name);
                                setShowDropdown(false);
                              }}
                              className="flex flex-1 items-center gap-2.5 text-left min-w-0"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700 text-xs shrink-0">
                                {u.name ? u.name.charAt(0).toUpperCase() : "A"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate">{u.name}</p>
                                <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                              </div>
                            </button>

                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => enrollUser(u)}
                              className="ml-2 inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition shadow-sm shrink-0 active:scale-95"
                              title={`Enroll ${u.name} directly to roster`}
                            >
                              <Plus size={12} />
                              Enroll
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-xs text-slate-500 text-center">
                      {availableUsers.length === 0
                        ? "All registered clients are already enrolled in your active roster."
                        : `No registered clients match "${searchUser}".`}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => enrollUser()}
              disabled={!selectedUser || isSubmitting}
              className="primary-button shrink-0"
            >
              <Plus size={16} />
              {isSubmitting
                ? "Enrolling..."
                : selectedUser
                  ? `Enroll "${selectedUser.name}"`
                  : "Enroll to Roster"}
            </button>
          </div>
        </div>

        {/* Global Exercise Template Library */}
        <div className="glass-panel relative z-10 rounded-[28px] p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell size={18} className="text-blue-600" />
              <h2 className="font-bold text-slate-800 text-base">Exercise Template Library</h2>
            </div>
            <span className="text-xs text-slate-400">
              💡 Click to assign to current athlete, or drag onto any card below
            </span>
          </div>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 flex gap-2">
              <input
                value={newWorkout}
                onChange={(e) => setNewWorkout(e.target.value)}
                placeholder="New exercise name (e.g. Bulgarian Split Squat)..."
                className="input-field"
              />
              <button
                onClick={addWorkout}
                disabled={!newWorkout.trim()}
                className="primary-button shrink-0"
              >
                <Plus size={15} />
                Save Template
              </button>
            </div>

            {/* Quick search library filter */}
            <div className="relative w-full sm:w-60">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                placeholder="Filter templates..."
                className="input-field pl-8 py-2 text-xs"
              />
            </div>
          </div>

          {/* Exercise chips */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {filteredLibrary.length > 0 ? (
              filteredLibrary.map((w) => (
                <div
                  key={w._id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("workout", w.name)}
                  onClick={() => assignWorkout(w.name)}
                  title="Click to assign or drag onto athlete"
                  className="group cursor-grab active:cursor-grabbing inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 hover:shadow"
                >
                  <Dumbbell size={12} className="text-slate-400 group-hover:text-blue-600 transition" />
                  <span>{w.name}</span>
                  <span className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition">+</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-2">
                No exercise templates match your search.
              </p>
            )}
          </div>
        </div>

        {/* 2-Column: Athlete Roster + Selected Athlete Workouts */}
        <div className="grid items-start gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          {/* Athlete Roster */}
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800 text-base">Athletes ({clients.length})</h2>
                <p className="text-xs text-slate-400">Select to manage or drop workouts</p>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600 transition shadow-sm active:scale-95 disabled:opacity-50"
                title="Synchronize athlete roster with newly registered users"
              >
                <RefreshCw size={13} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
                <span>{isRefreshing ? "Syncing..." : "Refresh Roster"}</span>
              </button>
            </div>

            {/* Quick Filter Search for Roster */}
            <div className="relative mb-3">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter roster by athlete name or email..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="input-field pl-8 pr-8 py-2 text-xs"
              />
              {rosterSearch && (
                <button
                  type="button"
                  onClick={() => setRosterSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {clients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-xs text-slate-400">
                No athletes in your roster yet. Use the enrollment tool above or have athletes register.
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-xs text-slate-500">
                No athlete matches "{rosterSearch}".
                <button
                  type="button"
                  onClick={() => setRosterSearch("")}
                  className="mt-2 block mx-auto text-xs font-bold text-blue-600 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredClients.map((c) => {
                  const isSelected = selectedClient?._id === c._id;
                  const isDragOver = dragOverClientId === c._id;
                  const total = (c.workouts || []).length;
                  const done = (c.workouts || []).filter((w) => w.done).length;
                  const percent = total ? Math.round((done / total) * 100) : 0;
                  const athleteEmail = c.email || (typeof c.userId === "object" ? c.userId?.email : "") || "";

                  return (
                    <div
                      key={c._id}
                      onClick={() => setSelectedClient(c)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverClientId(c._id);
                      }}
                      onDragLeave={() => setDragOverClientId(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverClientId(null);
                        const name = e.dataTransfer.getData("workout");
                        if (name) assignWorkout(name, c._id);
                      }}
                      className={`relative flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all duration-200 ${
                        isDragOver
                          ? "border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20"
                          : isSelected
                            ? "border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-500/20"
                            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl font-bold text-sm ${
                          isSelected
                            ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {c.name ? c.name.charAt(0).toUpperCase() : "A"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                            {total === 0 && (
                              <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.2 text-[10px] font-bold">
                                New
                              </span>
                            )}
                          </div>
                          {athleteEmail && (
                            <p className="text-[11px] text-slate-400 leading-tight">
                              {athleteEmail}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-0.5">
                            {done}/{total} completed ({percent}%)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isDragOver ? (
                          <span className="rounded-full bg-emerald-500 text-white px-2.5 py-0.5 text-[11px] font-bold animate-pulse">
                            Drop to Assign
                          </span>
                        ) : (
                          <span className={`text-xs font-semibold ${isSelected ? "text-blue-700" : "text-slate-400"}`}>
                            {isSelected ? "Managing" : "Select →"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Athlete Workspace */}
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900 text-base">
                  {selectedClient ? `${selectedClient.name}'s Workout Routine` : "Workout Routine Manager"}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedClient
                    ? "Manage assigned sets, review completion, and write coaching cues."
                    : "Select an athlete from the list on the left to begin."}
                </p>
              </div>

              {selectedClient && (
                <button
                  onClick={() => setClientToDelete(selectedClient)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/70 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                >
                  <Trash2 size={13} />
                  Remove Athlete
                </button>
              )}
            </div>

            {selectedClient ? (
              <>
                {/* Progress Bar Header */}
                {(() => {
                  const total = selectedClient.workouts?.length || 0;
                  const done = selectedClient.workouts?.filter((w) => w.done).length || 0;
                  const percent = total ? Math.round((done / total) * 100) : 0;

                  return (
                    <div className="mb-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="font-semibold text-slate-600">Athlete Completion Progress</span>
                        <span className="font-bold text-slate-900">{percent}% ({done} of {total} done)</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Filter Tabs & Batch Controls */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                    <button
                      onClick={() => setWorkoutFilterTab("all")}
                      className={`rounded-lg px-3 py-1.5 transition ${workoutFilterTab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      All ({(selectedClient.workouts || []).length})
                    </button>
                    <button
                      onClick={() => setWorkoutFilterTab("pending")}
                      className={`rounded-lg px-3 py-1.5 transition ${workoutFilterTab === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Pending ({(selectedClient.workouts || []).filter((w) => !w.done).length})
                    </button>
                    <button
                      onClick={() => setWorkoutFilterTab("completed")}
                      className={`rounded-lg px-3 py-1.5 transition ${workoutFilterTab === "completed" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Done ({(selectedClient.workouts || []).filter((w) => w.done).length})
                    </button>
                  </div>

                  {visibleWorkouts.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSelectAllWorkouts(visibleWorkouts)}
                        className="text-xs font-semibold text-slate-600 hover:text-blue-600"
                      >
                        {visibleWorkouts.every((w) => selectedWorkouts.includes(w._id))
                          ? "Deselect Tab"
                          : "Select Tab"}
                      </button>

                      {selectedWorkouts.length > 0 && (
                        <button
                          onClick={deleteMultiple}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-200 transition"
                        >
                          <Trash2 size={12} />
                          Delete ({selectedWorkouts.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Workouts List */}
                <div className="space-y-2 mb-6">
                  {visibleWorkouts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-xs text-slate-400">
                      No workouts in this view. Click an exercise from the template library above to assign.
                    </div>
                  ) : (
                    visibleWorkouts.map((w) => (
                      <div
                        key={w._id}
                        className={`flex items-center gap-3 rounded-2xl border p-3.5 transition-all ${
                          selectedWorkouts.includes(w._id)
                            ? "border-blue-400 bg-blue-50/60"
                            : w.done
                              ? "border-emerald-200 bg-emerald-50/40"
                              : "border-slate-200 bg-slate-50/70 hover:bg-white"
                        }`}
                      >
                        {/* Batch selection checkbox */}
                        <input
                          type="checkbox"
                          title="Select for batch delete"
                          checked={selectedWorkouts.includes(w._id)}
                          onChange={() => toggleSelectWorkout(w._id)}
                          className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                        />

                        {/* Workout completion checkbox */}
                        <input
                          type="checkbox"
                          title="Toggle completion status"
                          checked={w.done || false}
                          onChange={async () => {
                            await API.put(`/clients/${selectedClient._id}/workout/${w._id}`);
                            fetchClients();
                          }}
                          className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                        />

                        <span className={`flex-1 text-sm font-semibold ${w.done ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {w.name}
                        </span>

                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          w.done ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {w.done ? "Done" : "Pending"}
                        </span>

                        <button
                          onClick={() => deleteWorkout(w._id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete workout"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Coach Note Box */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-800">
                    <StickyNote size={15} className="text-blue-600" />
                    <span>Add Coach Cue for {selectedClient.name}</span>
                  </div>
                  <textarea
                    rows="3"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={`e.g. Focus on keeping the chest high during squats. Hydrate well before conditioning.`}
                    className="w-full rounded-xl border border-blue-200/70 bg-white p-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <div className="mt-2.5 flex justify-end">
                    <button
                      onClick={addCoachNote}
                      disabled={!newNote.trim()}
                      className="primary-button text-xs py-2 px-4"
                    >
                      Save Coaching Note
                    </button>
                  </div>
                </div>

                {/* Existing Saved Coach Notes */}
                {selectedClient.notes && selectedClient.notes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Saved Coaching Cues ({selectedClient.notes.length})
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedClient.notes.map((note) => (
                        <div
                          key={note._id}
                          className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition hover:border-slate-300"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-slate-800 font-medium leading-relaxed italic">"{note.text}"</p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                              {new Date(note.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteCoachNote(note._id)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition shrink-0"
                            title="Delete note"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center text-slate-400">
                <Users size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-sm font-semibold">No athlete selected</p>
                <p className="text-xs text-slate-400 mt-1">
                  Choose an athlete from the left column to view workouts and log cues.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Clients;