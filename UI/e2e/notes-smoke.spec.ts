import { expect, test } from "@playwright/test";

test("create and view a note", async ({ page }) => {
  await page.goto("/workspace");

  const returnToWorkspace = page.getByRole("button", { name: "返回工作区" });
  if (await returnToWorkspace.isVisible().catch(() => false)) {
    await returnToWorkspace.click();
  }

  const newNoteButton = page.getByRole("button", { name: "新建笔记" }).first();
  await newNoteButton.click();

  const titleInput = page.getByPlaceholder("笔记标题...");
  if (!(await titleInput.isVisible().catch(() => false))) {
    await page.getByText("无标题笔记").first().click();
  }
  await expect(titleInput).toBeVisible();

  await titleInput.fill("E2E 新建笔记");

  const editor = page.getByPlaceholder("开始用 Markdown 写作...");
  await editor.fill("# hello from e2e");

  await expect(page.getByText("E2E 新建笔记").first()).toBeVisible();
});
