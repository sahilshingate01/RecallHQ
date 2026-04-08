import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notepad | RecallHQ",
  description: "A secure digital notepad for your quick thoughts and ideas.",
};

export default function NotepadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
