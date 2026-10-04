import { expect, type Page } from "@playwright/test";

/** Signs in with the pre-filled demo account. */
export async function signInDemo(page: Page) {
  await page.goto("/signin");
  await expect(page.getByLabel("Email")).toHaveValue("demo@konstruct.ng");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/plans");
}
