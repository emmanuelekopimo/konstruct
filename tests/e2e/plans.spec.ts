import path from "node:path";
import { expect, test } from "@playwright/test";
import { signInDemo } from "./helpers";

test.beforeEach(async ({ page }) => signInDemo(page));

test("plan list shows the seeded mix and filters by status", async ({ page }) => {
  const list = page.getByTestId("plan-list");
  await expect(list.locator(".list-row")).toHaveCount(5);
  await page.getByRole("navigation", { name: "Filter plans" }).getByRole("link", { name: /Prices stale/ }).click();
  await expect(list.locator(".list-row")).toHaveCount(1);
  await expect(list).toContainText("Ogunleye starter home");
  await page.getByRole("navigation", { name: "Filter plans" }).getByRole("link", { name: /Needs review/ }).click();
  await expect(list).toContainText("Ogui Road shops");
});

test("plan page shows the breakdown, vendors to call and a PDF", async ({ page }) => {
  await page.getByText("Nwosu family duplex, Lekki").click();
  await expect(page.getByTestId("plan-title")).toHaveText("Nwosu family duplex, Lekki");
  await expect(page.getByTestId("total")).toContainText("₦");
  const call = page.locator("#vendors").getByTestId("vendor-card").first();
  await expect(call.getByRole("link", { name: /^Call / })).toHaveAttribute("href", /^tel:\+234\d{10}$/);

  const cement = page.getByTestId("line").filter({ hasText: "Portland cement" });
  await cement.locator("summary").click();
  await expect(cement.getByText("How it was measured")).toBeVisible();
  await expect(cement.getByTestId("vendor-card").first()).toContainText("Lagos");

  const res = await page.request.get(await page.getByTestId("download-pdf").getAttribute("href") as string);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("application/pdf");
  expect((await res.body()).subarray(0, 5).toString()).toBe("%PDF-");
});

test("stale prices can be refreshed", async ({ page }) => {
  await page.getByText("Ogunleye starter home").click();
  await expect(page.getByTestId("price-banner")).toContainText("out of date");
  const before = await page.getByTestId("total").textContent();
  await page.getByRole("button", { name: "Refresh prices" }).click();
  await expect(page.getByTestId("price-banner")).toHaveCount(0);
  await expect(page.getByText(/Prices valid until 18 Oct 2026/)).toBeVisible();
  expect(await page.getByTestId("total").textContent()).not.toBe(before);
});

test("pricing an item by hand clears the review banner", async ({ page }) => {
  await page.getByText("Ogui Road shops").click();
  await expect(page.getByTestId("review-banner")).toBeVisible();
  const unpriced = page.getByTestId("line").filter({ hasText: "Needs price" });
  const count = await unpriced.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const line = page.getByTestId("line").filter({ hasText: "Needs price" }).first();
    await line.locator("summary").click();
    const price = line.getByLabel("Unit price (Naira)");
    await price.fill("-1");
    await line.getByRole("button", { name: "Save" }).click();
    await expect(line.getByText("Cannot be negative")).toBeVisible();
    await price.fill("420000");
    await line.getByRole("button", { name: "Save" }).click();
    await expect(page.getByTestId("line").filter({ hasText: "Needs price" })).toHaveCount(count - i - 1);
  }
  await expect(page.getByTestId("review-banner")).toHaveCount(0);
});

test("upload shows inline errors, rejects non-plans and reads a plan", async ({ page }) => {
  await page.goto("/plans/new");
  await page.getByRole("button", { name: "Get material breakdown" }).click();
  await expect(page.locator("#file-error")).toHaveText(/Choose a plan file/);

  await page.locator("#file").setInputFiles({ name: "not-a-plan.png", mimeType: "image/png", buffer: Buffer.from("holiday") });
  await page.getByRole("button", { name: "Get material breakdown" }).click();
  await expect(page.locator("#file-error")).toHaveText(/does not look like a building plan/);

  await page.locator("#file").setInputFiles(path.join(process.cwd(), "public/samples/bungalow-3bed-lugbe.pdf"));
  await page.getByLabel("Project name (optional)").fill("Lugbe test upload");
  await page.getByLabel("Site city").selectOption("Abuja");
  await page.getByRole("button", { name: "Get material breakdown" }).click();
  await page.waitForURL(/\/plans\/\d+$/);
  await expect(page.getByTestId("plan-title")).toHaveText("Lugbe test upload");
  await expect(page.getByText("Abuja, FCT")).toBeVisible();
  await expect(page.getByTestId("line").first()).toBeVisible();
});

test("a sample plan opens from the carousel", async ({ page }) => {
  await page.getByRole("button", { name: "Try Row of Six Lock-up Shops" }).click();
  await page.waitForURL(/\/plans\/\d+$/);
  await expect(page.getByTestId("plan-title")).toHaveText("Row of Six Lock-up Shops, Enugu");
  await expect(page.getByTestId("review-banner")).toBeVisible();
});

test("vendor directory filters by city and material", async ({ page }) => {
  await page.getByRole("link", { name: "Vendors" }).first().click();
  await page.getByRole("navigation", { name: "City" }).getByRole("link", { name: "Kano" }).click();
  await page.waitForURL(/city=Kano/);
  await page.getByRole("navigation", { name: "Category" }).getByRole("link", { name: "Roofing" }).click();
  await page.waitForURL(/category=Roofing/);
  const cards = page.getByTestId("vendor-card");
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("Dakata Timber and Roofing");
});

test("another user's plan is not reachable", async ({ page }) => {
  // Plan 6 belongs to the second seeded user.
  const res = await page.goto("/plans/6");
  expect(res?.status()).toBe(404);
  const pdf = await page.request.get("/plans/6/pdf");
  expect(pdf.status()).toBe(404);
});
