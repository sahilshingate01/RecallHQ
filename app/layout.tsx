import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "RecallHQ — Personal Task & Work Manager",
  description:
    "RecallHQ is your all-in-one personal task and work manager dashboard. Track tasks, set reminders, and stay on top of your day.",
  keywords: ["task manager", "productivity", "personal dashboard", "RecallHQ"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
