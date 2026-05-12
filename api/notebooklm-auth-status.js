import { getNotebookLmAuthStatus } from "../server/notebooklmImporter.js";

export default async function handler(_request, response) {
  response.status(200).json(getNotebookLmAuthStatus());
}
