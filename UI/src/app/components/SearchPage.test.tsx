import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { StoreProvider } from "@/app/store";
import { SearchPage } from "@/app/components/SearchPage";
import { server } from "@/test/msw/server";
import { noteA } from "@/test/fixtures/notes";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("SearchPage", () => {
  it("shows empty-state when no notes", async () => {
    server.use(http.get("/api/notes", () => HttpResponse.json({ notes: [] })));

    render(
      <StoreProvider>
        <SearchPage />
      </StoreProvider>,
    );

    expect(await screen.findByText("还没有笔记")).toBeInTheDocument();
  });

  it("shows no-result state for unmatched query", async () => {
    server.use(http.get("/api/notes", () => HttpResponse.json({ notes: [noteA] })));

    render(
      <StoreProvider>
        <SearchPage />
      </StoreProvider>,
    );

    await screen.findByText("第一篇笔记");

    const input = screen.getByPlaceholderText("按标题、内容或标签搜索笔记...");
    await userEvent.type(input, "nothing-match");

    expect(await screen.findByText("未找到结果")).toBeInTheDocument();
  });
});
