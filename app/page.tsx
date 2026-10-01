"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo as apiDeleteTodo,
  clearCompleted as apiClearCompleted,
  checkHealth,
  type Todo,
  type Priority,
} from "@/lib/api";

type FilterType = "all" | "active" | "completed";

export default function Home() {
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const loadTodos = useCallback(async () => {
    try {
      setError(null);
      const data = await getTodos();
      setTodos(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
    loadTodos();
  }, [loadTodos]);

  const addTodo = async () => {
    if (!task.trim()) return;
    try {
      setError(null);
      const created = await createTodo({ text: task.trim(), priority });
      setTodos((prev) => [created, ...prev]);
      setTask("");
      setPriority("medium");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const newCompleted = !todo.completed;
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t))
    );
    try {
      setError(null);
      await updateTodo(id, { completed: newCompleted });
    } catch (e) {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: todo.completed } : t))
      );
      setError((e as Error).message);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const saveEdit = async (id: string) => {
    if (!editingText.trim()) return;
    try {
      setError(null);
      const updated = await updateTodo(id, { text: editingText.trim() });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
      setEditingText("");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const deleteTodo = async (id: string) => {
    try {
      setError(null);
      await apiDeleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const clearCompleted = async () => {
    try {
      setError(null);
      await apiClearCompleted();
      setTodos((prev) => prev.filter((t) => !t.completed));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, completed, active };
  }, [todos]);

  const priorityStyles: Record<Priority, { dot: string; badge: string; glow: string }> = {
    low: {
      dot: "bg-emerald-400",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      glow: "shadow-[0_0_12px_rgba(16,185,129,0.25)]",
    },
    medium: {
      dot: "bg-amber-400",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      glow: "shadow-[0_0_12px_rgba(245,158,11,0.25)]",
    },
    high: {
      dot: "bg-rose-400",
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      glow: "shadow-[0_0_12px_rgba(251,113,133,0.25)]",
    },
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b0b12] p-4 sm:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-fuchsia-600/25 via-pink-500/15 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center py-8">
        <div className="w-full rounded-3xl border border-white/[0.07] bg-white/[0.03] p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-8">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-white via-indigo-100 to-white bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                TaskFlow
              </h1>
              <p className="mt-1.5 text-sm text-white/40">
                Organize your day with style
              </p>
            </div>
          </div>

          {backendOnline === false && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400"></span>
              </span>
              <span>
                Cannot reach backend. Make sure the server is running on
                <code className="mx-1 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono">
                  http://localhost:5000
                </code>
              </span>
            </div>
          )}

          <div className="mb-6 grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: stats.total, color: "from-slate-500/40 to-slate-600/20", text: "text-slate-200" },
              { label: "Active", value: stats.active, color: "from-indigo-500/30 to-violet-600/20", text: "text-indigo-200" },
              { label: "Done", value: stats.completed, color: "from-emerald-500/30 to-teal-600/20", text: "text-emerald-200" },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br ${s.color} p-3 text-center backdrop-blur`}
              >
                <div className={`text-2xl font-bold ${s.text} sm:text-3xl`}>
                  {s.value}
                </div>
                <div className="mt-0.5 text-[11px] uppercase tracking-wider text-white/40 sm:text-xs">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <input
                  type="text"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTodo();
                  }}
                  placeholder="What needs to be done?"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all duration-300 focus:border-indigo-400/50 focus:bg-white/[0.07] focus:shadow-[0_0_20px_-4px_rgba(99,102,241,0.3)]"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
                  {(Object.keys(priorityStyles) as Priority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all duration-200 ${
                        priority === p
                          ? `${priorityStyles[p].badge} ${priorityStyles[p].glow} border`
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      <span className={`inline-block h-1.5 w-1.5 rounded-full align-middle mr-1.5 mb-[1px] ${priorityStyles[p].dot}`}></span>
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={addTodo}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </span>
                  <div className="absolute inset-0 translate-x-[-100%] bg-white/10 transition-transform duration-500 group-hover:translate-x-[100%]" />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-rose-300/70 hover:text-rose-200">
                ✕
              </button>
            </div>
          )}

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
              {(["all", "active", "completed"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-medium capitalize transition-all duration-200 ${
                    filter === f
                      ? "bg-gradient-to-r from-indigo-500/80 to-violet-500/80 text-white shadow-md shadow-indigo-500/20"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {stats.completed > 0 && (
              <button
                onClick={clearCompleted}
                className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 text-xs font-medium text-rose-300 transition-all duration-200 hover:border-rose-500/40 hover:bg-rose-500/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear done
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
            {loading ? (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/[0.08] py-16 text-sm text-white/40">
                Loading tasks…
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-16 px-6 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-white/20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white/60">
                  {filter === "all" ? "No tasks yet" : filter === "active" ? "No active tasks" : "No completed tasks"}
                </h3>
                <p className="mt-1.5 max-w-xs text-sm text-white/30">
                  {filter === "all"
                    ? "Add your first task above and start being productive"
                    : filter === "active"
                    ? "All your tasks are completed. Great job!"
                    : "Complete some tasks to see them here"}
                </p>
              </div>
            ) : (
              filteredTodos.map((todo, index) => {
                const pStyle = priorityStyles[todo.priority];
                return (
                  <div
                    key={todo.id}
                    style={{ animationDelay: `${index * 40}ms` }}
                    className={`group relative flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.06] hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.5)] ${
                      todo.completed ? "opacity-60" : pStyle.glow
                    }`}
                  >
                    <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${pStyle.dot} opacity-60`} />

                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                        todo.completed
                          ? "border-emerald-400 bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/30"
                          : "border-white/20 hover:border-indigo-400/60 hover:bg-white/5"
                      }`}
                    >
                      {todo.completed && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 text-white drop-shadow"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {editingId === todo.id ? (
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(todo.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        className="flex-1 rounded-lg border border-indigo-400/40 bg-white/[0.07] px-3 py-2 text-sm text-white outline-none focus:border-indigo-400 focus:shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]"
                      />
                    ) : (
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm transition-all duration-300 ${
                            todo.completed
                              ? "text-white/30 line-through decoration-white/20"
                              : "text-white/85"
                          }`}
                        >
                          {todo.text}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${pStyle.badge}`}
                          >
                            <span className={`h-1 w-1 rounded-full ${pStyle.dot}`}></span>
                            {todo.priority}
                          </span>
                          <span className="text-[10px] text-white/25">
                            {new Date(todo.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100">
                      {editingId === todo.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(todo.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/80 text-white shadow-md transition-all duration-200 hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-95"
                            title="Save"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 transition-all duration-200 hover:bg-white/20 hover:text-white active:scale-95"
                            title="Cancel"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(todo)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300/80 transition-all duration-200 hover:bg-amber-500/20 hover:text-amber-300 active:scale-95"
                            title="Edit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-300/80 transition-all duration-200 hover:bg-rose-500/20 hover:text-rose-300 active:scale-95"
                            title="Delete"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/[0.05] pt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-white/25"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-[11px] text-white/25">
              Press <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd> to add •{" "}
              <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> to cancel
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}