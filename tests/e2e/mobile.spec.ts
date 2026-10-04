import { expect, test } from "@playwright/test";
import { signInDemo } from "./helpers";

test("mobile: bottom nav, plan page fits the screen and vendors can be called", async ({ page }) => {
  await signInDemo(page);
  const nav = page.locator("nav.bottomnav");
  await expect(nav).toBeVisible();
  await expect(page.locator("nav.tabs")).toBeHidden();

  await page.getByText("Dr Bello bungalow, Lugbe").click();
  await expect(page.getByTestId("plan-title")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  const call = page.locator("#vendors").getByTestId("vendor-card").first().getByRole("link", { name: /^Call / });
  await expect(call).toHaveAttribute("href", /^tel:/);
  await expect(page.locator("#vendors").getByTestId("vendor-card").first()).toContainText("Abuja");

  await nav.getByRole("link", { name: "Vendors" }).click();
  await expect(page).toHaveURL(/\/vendors/);
  await expect(nav.getByRole("link", { name: "Vendors" })).toHaveAttribute("aria-current", "page");
});
