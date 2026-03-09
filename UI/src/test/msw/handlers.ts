import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/notes", () => {
    return HttpResponse.json({ notes: [] });
  }),
  http.post("/api/notes", async () => {
    return HttpResponse.json({ note: null }, { status: 201 });
  }),
  http.patch("/api/notes/:id", async () => {
    return HttpResponse.json({ note: null });
  }),
  http.delete("/api/notes/:id", async () => {
    return HttpResponse.json({ success: true });
  }),
  http.post("/api/notes/:id/restore", async () => {
    return HttpResponse.json({ note: null });
  }),
  http.delete("/api/notes", async () => {
    return HttpResponse.json({ success: true });
  }),
];
