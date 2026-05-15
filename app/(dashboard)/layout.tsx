"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AddTaskModal from "@/components/AddTaskModal";
import ReminderNotifier from "@/components/ReminderNotifier";
import PageTransition from "@/components/PageTransition";
import { settingsService } from "@/lib/settingsService";

const FaceLogin = dynamic(() => import("@/components/FaceLogin"), { ssr: false });
const FaceRegister = dynamic(() => import("@/components/FaceRegister"), { ssr: false });
const MikuCompanion = dynamic(() => import("@/components/MikuCompanion/MikuCompanion"), {
  ssr: false,
  loading: () => null,
});

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

  const [isMikuActive, setIsMikuActive] = useState(false);

  useEffect(() => {
    // Start pre-loading face-api models immediately
    import("@/lib/faceApiUtils").then(m => m.loadFaceApiModels());

    const checkRegistration = async () => {
      // Check local storage first
      const localRegistered = localStorage.getItem("recallhq_face_registered") === "true";
      
      if (localRegistered) {
        setIsRegistered(true);
        setLoading(false);
        return;
      }

      // If not local, check database (for "any device" support)
      try {
        const settings = await settingsService.getSettings();
        if (settings && settings.face_descriptor) {
          localStorage.setItem("recallhq_face_registered", "true");
          localStorage.setItem("recallhq_face_descriptor", JSON.stringify(settings.face_descriptor));
          setIsRegistered(true);
        }
      } catch (err) {
        console.error("Error checking registration stats:", err);
      } finally {
        setLoading(false);
      }
    };

    checkRegistration();
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
      onMouseMove={(e) => {
        const x = e.clientX;
        const y = e.clientY;
        const light = document.getElementById("bg-light");
        if (light) {
          light.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
        }
      }}
      style={{
        display: "flex",
        height: "100vh",
        background: "#dde3ed",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        id="bg-light"
        style={{
          position: "fixed",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(79, 172, 254, 0.1) 0%, rgba(79, 172, 254, 0) 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: -1,
          filter: "blur(60px)",
          transition: "transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)",
          willChange: "transform",
        }}
      />
      {/* Sidebar */}
      <Sidebar onToggleMiku={() => setIsMikuActive(!isMikuActive)} isMikuActive={isMikuActive} />

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
          position: "relative",
          zIndex: 1,
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
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <ReminderNotifier />
      {isMikuActive && <MikuCompanion />}
    </div>
  );
}
