import type { Metadata, Viewport } from "next";
import "@fontsource/google-sans/400.css";
import "@fontsource/google-sans/500.css";
import "@fontsource/google-sans/700.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Konstruct", template: "%s | Konstruct" },
  description: "Upload a building plan and get a priced material list with vendors to call near your site.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#01875f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG">
      <body>{children}</body>
    </html>
  );
}
