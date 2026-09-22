# mcp-simple-todo-app

A simple Model Context Protocol (MCP) server that provides a `get_todos` tool to fetch and manage todo items from a remote API. This server can be integrated with Claude or other AI applications that support the MCP protocol.

## Features

- **MCP Server**: Implements the Model Context Protocol for seamless integration with AI assistants
- **Todo Fetching**: Fetches todo items from a configurable API endpoint
- **Type Safe**: Built with TypeScript and Zod for runtime type validation
- **Error Handling**: Robust error handling with meaningful error messages
- **Configurable API**: Supports custom todo API endpoints via environment variables

## Installation

```bash
npm install
```

## Prerequisites

- Node.js 18+ (required for fetch API and native ES modules)
- A running todo API server (default: `http://localhost:3013/api/todos`)

## Building

Build the TypeScript code to JavaScript:

```bash
npm run build
```

This generates the `dist/` directory with compiled JavaScript files.

## Running

### Development Mode

Run with automatic recompilation and execution:

```bash
npm run dev
```

This command runs `tsc && node dist/index.js` to compile and start the server.

### Production Mode

```bash
npm start
```

Or directly run the compiled server:

```bash
node dist/index.js
```

### Watch Mode

For continuous development with automatic recompilation:

```bash
npm run watch
```

## Testing

Test the MCP server using the official MCP inspector:

```bash
npm test
```

This uses the `@modelcontextprotocol/inspector` to allow you to interact with the server and test the available tools.

## Environment Variables

- `TODOS_API_URL`: (Optional) URL of the todos API endpoint
  - Default: `http://localhost:3013/api/todos`
  - Example: `TODOS_API_URL=http://api.example.com/todos npm start`

## Configuration

The server exposes a single tool: `get_todos`

### Available Tools

#### `get_todos`
Fetches all todo items from the configured API endpoint.

**Output Schema:**
```typescript
{
  todos: Array<{
    id: number
    title: string
    description: string
    status: string
    createdAt: string
    updatedAt: string
    deadline?: string
  }>
  total: number
}
```

**Example Response:**
```json
{
  "todos": [
    {
      "id": 1,
      "title": "Complete project",
      "description": "Finish the MCP implementation",
      "status": "in-progress",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "deadline": "2024-01-20T18:00:00Z"
    }
  ],
  "total": 1
}
```

## API Requirements

The todo API should respond with the following format:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Todo title",
      "description": "Todo description",
      "status": "pending|in-progress|completed",
      "createdAt": "ISO8601 timestamp",
      "updatedAt": "ISO8601 timestamp",
      "deadline": "ISO8601 timestamp (optional)"
    }
  ],
  "total": 1
}
```

## Project Structure

```
src/
├── index.ts    # MCP server setup and tool registration
├── todos.ts    # Todo API client and types
tsconfig.json   # TypeScript configuration
package.json    # Project metadata and dependencies
```

## Dependencies

- `@modelcontextprotocol/sdk`: Model Context Protocol SDK
- `zod`: TypeScript-first schema validation
- TypeScript: For type safety and development

## Error Handling

The server handles the following error scenarios:

- **API Connection Errors**: Network timeouts (10 second limit)
- **API Response Errors**: Non-2xx HTTP status codes
- **Invalid Response Format**: Unexpected API response structure
- **All errors are returned with descriptive messages** to help with debugging

## License

ISC

## Repository

https://github.com/PiotrekBudny/mcp-simple-todo-app