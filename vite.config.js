import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {
  cancelNotebookLmAuth,
  disconnectNotebookLmAuth,
  errorToStatus,
  finishNotebookLmAuth,
  getNotebookLmAuthStatus,
  importNotebookLmQuiz,
  startNotebookLmAuth
} from "./server/notebooklmImporter.js";

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let rawBody = "";
    request.on("data", (chunk) => {
      rawBody += chunk;
    });
    request.on("error", reject);
    request.on("end", () => {
      try {
        resolve(JSON.parse(rawBody || "{}"));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function notebookLmImportMiddleware() {
  return {
    name: "notebooklm-import-api",
    configureServer(server) {
      server.middlewares.use("/api/import-notebooklm", async (request, response) => {
        if (request.method !== "POST") {
          sendJson(response, 405, { error: "Method not allowed." });
          return;
        }

        try {
          const body = await readJsonBody(request);
          const questionBank = await importNotebookLmQuiz(body.url);
          sendJson(response, 200, { questionBank });
        } catch (error) {
          sendJson(response, errorToStatus(error), {
            error: error.message || "Import failed.",
            code: error.code || "import_failed"
          });
        }
      });

      server.middlewares.use("/api/notebooklm-auth/status", async (_request, response) => {
        sendJson(response, 200, getNotebookLmAuthStatus());
      });

      server.middlewares.use("/api/notebooklm-auth/start", async (request, response) => {
        if (request.method !== "POST") {
          sendJson(response, 405, { error: "Method not allowed." });
          return;
        }
        try {
          sendJson(response, 200, await startNotebookLmAuth());
        } catch (error) {
          sendJson(response, 500, { error: error.message || "Could not open NotebookLM sign-in window." });
        }
      });

      server.middlewares.use("/api/notebooklm-auth/finish", async (request, response) => {
        if (request.method !== "POST") {
          sendJson(response, 405, { error: "Method not allowed." });
          return;
        }
        try {
          sendJson(response, 200, await finishNotebookLmAuth());
        } catch (error) {
          sendJson(response, 500, { error: error.message || "Could not save NotebookLM session." });
        }
      });

      server.middlewares.use("/api/notebooklm-auth/cancel", async (request, response) => {
        if (request.method !== "POST") {
          sendJson(response, 405, { error: "Method not allowed." });
          return;
        }
        sendJson(response, 200, await cancelNotebookLmAuth());
      });

      server.middlewares.use("/api/notebooklm-auth/disconnect", async (request, response) => {
        if (request.method !== "POST") {
          sendJson(response, 405, { error: "Method not allowed." });
          return;
        }
        sendJson(response, 200, await disconnectNotebookLmAuth());
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), notebookLmImportMiddleware()],
  base: "/studybuddy/"
});
