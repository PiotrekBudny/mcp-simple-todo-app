import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fetchTodos, addTodo } from "./todos.js";

const server = new McpServer(
  {
    name: "mcp-simple-todo-app",
    version: "1.0.0",
  },
  {
    capabilities: {},
  }
);

const todoSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deadline: z.string().optional(),
});

server.registerTool(
  "get_todos",
  {
    title: "Get todos",
    description: "Fetch all todos from the todo API.",
    outputSchema: {
      todos: z.array(todoSchema),
      total: z.number(),
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: true,
    },
  },
  async () => {
    try {
      const todos = await fetchTodos();
      const structuredContent = { todos, total: todos.length };

      return {
        content: [{ type: "text", text: JSON.stringify(structuredContent, null, 2) }],
        structuredContent,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [{ type: "text", text: `Failed to fetch todos: ${message}` }],
      };
    }
  }
);

const addTodoInputSchema = z.object({
  title: z.string().describe("The title of the todo item"),
  description: z.string().describe("The description of the todo item"),
  deadline: z.string().optional().describe("Optional deadline for the todo (ISO 8601 format)"),
});

server.registerTool(
  "add_todo",
  {
    title: "Add todo",
    description: "Create a new todo item.",
    inputSchema: addTodoInputSchema,
  },
  async (args) => {
    try {
      const { title, description, deadline } = args as z.infer<typeof addTodoInputSchema>;

      const newTodo = await addTodo({ title, description, deadline });
      const structuredContent = { todo: newTodo };

      return {
        content: [{ type: "text", text: JSON.stringify(structuredContent, null, 2) }],
        structuredContent,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [{ type: "text", text: `Failed to add todo: ${message}` }],
      };
    }
  }
);

server.registerPrompt(
  "create_todo",
  {
    title: "Create todo",
    description: "Guide user through creating a new todo item by gathering information and then creating it.",
        argsSchema: {
      title: z.string().describe("The title of the todo item"),
      description: z
        .string()
        .optional()
        .describe("The description of the todo item"),
      deadline: z
        .string()
        .optional()
        .describe(
          "The deadline of the todo item in ISO date format (e.g. '2025-07-31T23:59:59Z')"
        ),
    }
  },
   async (args) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Use tool to create a new TODO item with title "${args.title}"${
            args.description ? `, description "${args.description}"` : ""
          }${
            args.deadline
              ? `, and deadline "${new Date(args.deadline).toISOString()}"`
              : ""
          }.`,
        },
      },
    ],
  })
);

server.registerPrompt(
  "analyze_todos",
  {
    title: "Analyze todos",
    description:
      "Analyze existing todos and provide insights and recommendations.",
    argsSchema: {
      focus: z
        .string()
        .optional()
        .describe(
          "Optional focus area (e.g., 'deadlines', 'status', 'priority')"
        ),
    },
  },
  async (args) => {
    try {
      const todos = await fetchTodos();

      const focus = (args as { focus?: string }).focus || "overall";
      const focusText =
        focus !== "overall"
          ? ` Focus on the ${focus} aspect of the todos.`
          : "";

      const todosJson = JSON.stringify(todos, null, 2);

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I have ${todos.length} todos to analyze. Please review them and provide insights and recommendations.${focusText}\n\nHere are the todos:\n\n${todosJson}`,
            },
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Failed to fetch todos for analysis: ${message}`,
            },
          },
        ],
      };
    }
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-simple-todo-app server running on stdio");
}

main().catch((error: unknown) => {
  console.error("Fatal error starting MCP server:", error);
  process.exit(1);
});