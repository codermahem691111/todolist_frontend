export type Priority = "low" | "medium" | "high";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
}

export interface CreateTodoPayload {
  text: string;
  priority?: Priority;
}

export interface UpdateTodoPayload {
  text?: string;
  completed?: boolean;
  priority?: Priority;
}

export interface ClearCompletedResult {
  message: string;
  deletedCount: number;
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const TODOS_ENDPOINT = `${API_BASE}/api/todos`;

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let body: any = {};
  try {
    body = await res.json();
  } catch {
    // no-op
  }

  if (!res.ok) {
    throw new ApiError(body?.error || `Request failed (${res.status})`, res.status);
  }

  return body as T;
}

export async function getTodos(): Promise<Todo[]> {
  return request<Todo[]>(`${TODOS_ENDPOINT}`, {
    method: "GET",
    cache: "no-store",
  });
}

export async function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  return request<Todo>(`${TODOS_ENDPOINT}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTodo(
  id: string,
  payload: UpdateTodoPayload
): Promise<Todo> {
  return request<Todo>(`${TODOS_ENDPOINT}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTodo(id: string): Promise<{ message: string; id: string }> {
  return request(`${TODOS_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
}

export async function clearCompleted(): Promise<ClearCompletedResult> {
  return request<ClearCompletedResult>(`${TODOS_ENDPOINT}/completed`, {
    method: "DELETE",
  });
}

export async function checkHealth(): Promise<{
  status: string;
  message: string;
  timestamp: number;
  mongodb: string;
}> {
  return request(`${API_BASE}/api/health`, { method: "GET", cache: "no-store" });
}
