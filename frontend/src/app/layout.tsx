import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScreenerAI",
  description: "Intelligent internship application screening",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}