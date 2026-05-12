import { errorToStatus, importNotebookLmQuiz } from "../server/notebooklmImporter.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
    const questionBank = await importNotebookLmQuiz(body.url);
    response.status(200).json({ questionBank });
  } catch (error) {
    response.status(errorToStatus(error)).json({
      error: error.message || "Import failed.",
      code: error.code || "import_failed"
    });
  }
}
