export const TODOS_API_URL =
  process.env.TODOS_API_URL ?? "http://localhost:3013/api/todos";

export interface Todo {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
}

interface TodosApiResponse {
  success: boolean;
  data: Todo[];
  total: number;
}

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(TODOS_API_URL, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(
      `Todos API responded with ${response.status} ${response.statusText}`
    );
  }

  const body = (await response.json()) as TodosApiResponse;

  if (!body.success || !Array.isArray(body.data)) {
    throw new Error("Todos API returned an unexpected response shape");
  }

  return body.data;
}

interface AddTodoPayload {
  title: string;
  description: string;
  deadline?: string;
}

export async function addTodo(payload: AddTodoPayload): Promise<Todo> {
  const response = await fetch(TODOS_API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(
      `Todos API responded with ${response.status} ${response.statusText}`
    );
  }

  const body = (await response.json()) as { success: boolean; data: Todo };

  if (!body.success || !body.data) {
    throw new Error("Todos API returned an unexpected response shape");
  }

  return body.data;
}