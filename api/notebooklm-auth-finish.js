import { finishNotebookLmAuth } from "../server/notebooklmImporter.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    response.status(200).json(await finishNotebookLmAuth());
  } catch (error) {
    response.status(500).json({ error: error.message || "Could not save NotebookLM session." });
  }
}
