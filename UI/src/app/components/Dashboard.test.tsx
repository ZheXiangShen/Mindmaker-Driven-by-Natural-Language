import React from "react";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { StoreProvider } from "@/app/store";
import { Dashboard } from "@/app/components/Dashboard";
import { server } from "@/test/msw/server";
import { noteA } from "@/test/fixtures/notes";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("Dashboard", () => {
  it("shows loading state while notes are fetching", () => {
    server.use(
      http.get("/api/notes", async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ notes: [] });
      }),
    );

    render(
      <StoreProvider>
        <Dashboard />
      </StoreProvider>,
    );

    expect(screen.getByText("正在加载笔记...")).toBeInTheDocument();
  });

  it("shows empty state when no notes", async () => {
    server.use(http.get("/api/notes", () => HttpResponse.json({ notes: [] })));

    render(
      <StoreProvider>
        <Dashboard />
      </StoreProvider>,
    );

    expect(await screen.findByText("还没有笔记")).toBeInTheDocument();
  });

  it("renders recent notes when data exists", async () => {
    server.use(http.get("/api/notes", () => HttpResponse.json({ notes: [noteA] })));

    render(
      <StoreProvider>
        <Dashboard />
      </StoreProvider>,
    );

    expect(await screen.findByText("第一篇笔记")).toBeInTheDocument();
  });
});
