"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import FaceLogin from "@/components/FaceLogin";
import FaceRegister from "@/components/FaceRegister";
import AddTaskModal from "@/components/AddTaskModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const registered = localStorage.getItem("recallhq_face_registered") === "true";
    setIsRegistered(registered);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#dde3ed",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "4px solid #f15a2b",
            borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!isRegistered) {
    return <FaceRegister onComplete={() => setIsRegistered(true)} />;
  }

  if (!isAuthenticated) {
    return <FaceLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#dde3ed",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "40px 44px",
          gap: 36,
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <TopBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddTask={() => setIsAddModalOpen(true)}
          notificationCount={0}
        />
        <main
          style={{
            flex: 1,
            overflow: "auto",
          }}
        >
          {children}
        </main>
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
