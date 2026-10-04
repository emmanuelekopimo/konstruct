import { expect, test } from "@playwright/test";
import { signInDemo } from "./helpers";

test("landing page shows the five sample plans", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /priced material list/ })).toBeVisible();
  await expect(page.locator("#samples .tile")).toHaveCount(5);
});

test("protected pages send visitors to sign in", async ({ page }) => {
  await page.goto("/plans");
  await expect(page).toHaveURL(/\/signin$/);
});

test("wrong password shows an inline error", async ({ page }) => {
  await page.goto("/signin");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator(".form-error")).toHaveText("Email or password is incorrect.");
});

test("sign up validates fields inline, then creates an account", async ({ page }) => {
  await page.goto("/signup");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("#name-error")).toHaveText(/Enter your full name/);
  await expect(page.locator("#email-error")).toHaveText(/Enter your email/);
  await expect(page.locator("#password-error")).toHaveText(/at least 8/);
  await expect(page.locator("#city-error")).toHaveText(/Choose a city/);

  await page.getByLabel("Full name").fill("Amaka Eze");
  await page.getByLabel("Email").fill(`amaka${Date.now()}@example.ng`);
  await page.getByLabel("Password").fill("strongpass1");
  await page.getByLabel("Your city").selectOption("Enugu");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/plans");
  await expect(page.getByText("No plans yet")).toBeVisible();
});

test("demo login works and sign out returns to sign in", async ({ page }) => {
  await signInDemo(page);
  await expect(page.getByRole("heading", { name: "My plans" })).toBeVisible();
  await page.getByTestId("account-link").click();
  await expect(page.getByRole("heading", { name: "Chidinma Okafor" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/signin$/);
});
