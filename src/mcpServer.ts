import express from "express";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { readTasksFile } from "./tasky-utils/taskFile";
import { addTask, updateTask, changeTaskState, addCompletionDetails } from "./mcpHooks";
import { listTasks } from "./mcpHooks";

const PORT = 6123;

export async function startMcpServer(rootPath: string) {
  console.log('rootPath from mcp', rootPath);
  
  const TaskSchema: z.ZodType<any> = z.lazy(() =>
    z.object({
    name: z.string().min(1, "Le nom est obligatoire"),
    description: z.string().optional(),
    state: z.enum(["à faire", "en cours", "terminée"]),
    subtasks: z.array(TaskSchema).default([]),
    completionDetails: z.string().optional(),
  })
);

const app = express();
app.use((req, res, next) => {
  if (req.path === '/mcp') next();
  else express.json()(req, res, next);
});

// MCP Server instance
const server = new McpServer({
  name: "Tasky MCP Server",
  version: "1.0.0"
});

// MCP Resource: list tasks
// server.resource(
//   "task-list",
//   new ResourceTemplate("tasky://tasks", { list: undefined }),
//   async (uri) => {
//     const tasks = await readTasksFile(rootPath);
//     return {
//       content: [{
//         type: "text",
//         text: JSON.stringify(tasks, null, 2)
//       }]
//     };
//   }
// );

// MCP Tool: list tasks with filters
server.tool(
  "listTasks",
  {},
  async () => {
    const tasks = await readTasksFile(rootPath);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(tasks, null, 2)
      }]
    };
  }
);

// MCP Tool: addTask
server.tool(
  "addTask",
  { name: z.string().min(1, "Le nom est obligatoire"), description: z.string().optional(), state: z.enum(["à faire", "en cours", "terminée"]), subtasks: z.array(TaskSchema).optional(), completionDetails: z.string().optional(), parentId: z.string().optional() },
  async (params) => {
    await addTask(params, rootPath);
    return { content: [{ type: "text", text: "Tâche ajoutée." }] };
  }
);

// MCP Tool: updateTask
server.tool(
  "updateTask",
  { id: z.string(), name: z.string().optional(), state: z.enum(["à faire", "en cours", "terminée"]).optional(), description: z.string().optional(), parentId: z.string().optional() },
  async (params) => {
    await updateTask(params, rootPath, params.parentId);
    return { content: [{ type: "text", text: "Tâche modifiée." }] };
  }
);

// MCP Tool: changeTaskState
server.tool(
  "changeTaskState",
  { id: z.string(), state: z.enum(["à faire", "en cours", "terminée"]) },
  async (params) => {
    await changeTaskState(params.id, params.state, rootPath);
    return { content: [{ type: "text", text: "État de la tâche modifié." }] };
  }
);

// MCP Tool: addCompletionDetails
server.tool(
  "addCompletionDetails",
  { id: z.string(), completionDetails: z.string() },
  async (params) => {
    await addCompletionDetails(rootPath, params.id, params.completionDetails);
    return { content: [{ type: "text", text: "Raison de complétion ajoutée." }] };
  }
);

let transport: SSEServerTransport;

// SSE endpoint for establishing the stream
app.get('/mcp', async (req, res) => {
  console.log('Received GET request to /sse (establishing SSE stream)');
  
  try {
    // Create a new SSE transport for the client
    // The endpoint for POST messages is '/messages'
    transport = new SSEServerTransport('/tasks', res);
    
    // Connect the transport to the MCP server
    await server.connect(transport);
    
    console.log(`Established SSE stream with session ID: ${transport.sessionId}`);
  } catch (error) {
    console.error('Error establishing SSE stream:', error);
    if (!res.headersSent) {
      res.status(500).send('Error establishing SSE stream');
    }
  }
});

// Messages endpoint for receiving client JSON-RPC requests
app.post('/tasks', async (req, res) => {
  console.log('Received POST request to /tasks');
  
  try {
    // Handle the POST message with the transport
    await transport.handlePostMessage(req, res, req.body);
  } catch (error) {
    console.error('Error handling request:', error);
    if (!res.headersSent) {
      res.status(500).send('Error handling request');
    }
  }
});

app.delete("/mcp", (req, res) => {
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed." },
    id: null
  }));
});

app.listen(PORT, () => {
  console.log(`Tasky MCP Server SSE listening on port ${PORT}`);
});
}
