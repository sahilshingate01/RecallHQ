"use client";

import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Bell,
  FileText,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "tasks",     label: "Tasks",     icon: CheckSquare,     path: "/tasks"     },
  { id: "reminders", label: "Reminders", icon: Bell,            path: "/reminders" },
  { id: "notes",     label: "Notes",     icon: FileText,        path: "/notes"     },
];

export default function Sidebar() {
  const router   = useRouter();
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        width: 220,
        flexShrink: 0,
        flexBasis: 220,
        background: "#e8ecf4",
        borderRadius: 0,
        margin: 0,
        height: "100vh",
        paddingTop: 36,
        paddingBottom: 28,
        paddingLeft: 0,
        paddingRight: 0,
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 20px rgba(163,177,198,0.3)",
        zIndex: 10,
        position: "relative",
      }}
    >
      {/* ── Logo ── */}
      <div style={{ paddingLeft: 28, paddingRight: 24, marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
          {/* 4-square orange-red grid icon */}
          <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
            <rect x="1"  y="1"  width="9" height="9" rx="2.5" fill="#f15a2b" />
            <rect x="12" y="1"  width="9" height="9" rx="2.5" fill="#f15a2b" />
            <rect x="1"  y="12" width="9" height="9" rx="2.5" fill="#f15a2b" />
            <rect x="12" y="12" width="9" height="9" rx="2.5" fill="#f15a2b" />
          </svg>
          <span
            style={{
              fontFamily: "Nunito, sans-serif",
              fontWeight: 900,
              fontSize: 24,
              color: "#1e2a3a",
              letterSpacing: "-0.5px",
              lineHeight: 1,
            }}
          >
            RecallHQ
          </span>
        </div>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "2.5px",
            color: "#9aa5b4",
            textTransform: "uppercase",
            display: "block",
            paddingLeft: 36,
          }}
        >
          Personal Manager
        </span>
      </div>

      {/* ── Nav Items ── */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 16, paddingRight: 16, flex: 1 }}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.path === "/dashboard" && pathname === "/");
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => router.push(item.path)}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "13px 16px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                outline: "none",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: isActive ? 700 : 500,
                fontSize: 15,
                color: isActive ? "#f15a2b" : "#636e72",
                background: isActive
                  ? "linear-gradient(135deg, #ecf0f8 0%, #e4e9f2 100%)"
                  : "transparent",
                boxShadow: isActive
                  ? "5px 5px 12px rgba(163,177,198,0.5), -5px -5px 12px rgba(255,255,255,0.85)"
                  : "none",
                transition: "all 0.2s ease",
                width: "100%",
                textAlign: "left",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(236,240,248,0.5)";
                  (e.currentTarget as HTMLElement).style.color = "#4a5568";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#636e72";
                }
              }}
            >
              <Icon
                size={20}
                color={isActive ? "#f15a2b" : "#9aa5b4"}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {item.label}
            </motion.button>
          );
        })}
      </nav>


    </motion.aside>
  );
}
