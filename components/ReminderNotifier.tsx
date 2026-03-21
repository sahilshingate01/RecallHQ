"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { reminderService, Reminder } from "@/lib/reminderService";
import { Bell, Clock, CheckCircle, ExternalLink } from "lucide-react";

export default function ReminderNotifier() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const notifiedIds = useRef<Set<string>>(new Set());

  // Check for due reminders every 10 seconds
  useEffect(() => {
    // Request notification permission on mount
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    const checkReminders = async () => {
      try {
        const data = await reminderService.getReminders();
        const now = new Date();

        data.forEach((reminder) => {
          if (reminder.done) return;

          const remindAt = new Date(reminder.remind_at);
          
          // If the reminder is due (or within the last 1 minute) and not yet notified
          if (remindAt <= now && !notifiedIds.current.has(reminder.id)) {
            // Only notify if it's within the last hour (to avoid spamming old due reminders)
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            if (remindAt >= oneHourAgo) {
              notifyDue(reminder);
            }
            notifiedIds.current.add(reminder.id);
          }
        });

        setReminders(data);
      } catch (err) {
        console.error("Error checking reminders:", err);
      }
    };

    // Initial check
    checkReminders();

    // Interval check every 30 seconds
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, []);

  const notifyDue = (reminder: Reminder) => {
    // 1. Browser Notification
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("Reminder: " + reminder.title, {
        body: reminder.note || "You have a reminder scheduled for now.",
        icon: "/favicon.ico", // Ensure this exists or use a default
      });
    }

    // 2. Beautiful In-App Toast
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-[#f8f9fc] shadow-2xl rounded-3xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-5 border border-white/20`}
        style={{
          background: "rgba(248, 249, 252, 0.95)",
          backdropFilter: "blur(12px)",
          boxShadow: "10px 10px 30px rgba(0,0,0,0.1), -8px -8px 30px rgba(255,255,255,0.8)",
          borderRadius: "28px",
        }}
      >
        <div className="flex-1 w-0 p-1">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div
                style={{
                  background: "linear-gradient(135deg, #f15a2b, #ee5a24)",
                  width: 44,
                  height: 44,
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 8px 16px rgba(241, 90, 43, 0.3)",
                }}
              >
                <Bell size={22} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p 
                style={{ 
                  fontFamily: "Nunito, sans-serif", 
                  fontWeight: 900, 
                  fontSize: "17px", 
                  color: "#1e2a3a",
                  margin: "0 0 2px 0"
                }}
              >
                {reminder.title}
              </p>
              <p 
                style={{ 
                  fontFamily: "DM Sans, sans-serif", 
                  fontSize: "14px", 
                  color: "#636e72",
                  margin: 0,
                  lineHeight: 1.4
                }}
              >
                {reminder.note || "Reminder scheduled for now."}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col border-l border-gray-200 pl-4 ml-4 gap-2 justify-center">
          <button
            onClick={() => {
              window.location.href = "/reminders";
              toast.dismiss(t.id);
            }}
            style={{
              padding: "8px",
              borderRadius: "12px",
              background: "#eef2f8",
              border: "none",
              color: "#4facfe",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "3px 3px 6px rgba(163,177,198,0.4), -2px -2px 6px rgba(255,255,255,0.8)",
            }}
          >
            <ExternalLink size={18} />
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: "8px",
              borderRadius: "12px",
              background: "#eef2f8",
              border: "none",
              color: "#9aa5b4",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "3px 3px 6px rgba(163,177,198,0.4), -2px -2px 6px rgba(255,255,255,0.8)",
            }}
          >
            <span style={{ fontWeight: 800, fontSize: "14px" }}>Close</span>
          </button>
        </div>
      </div>
    ), {
      duration: 10000, // Show for 10 seconds
      position: "top-right",
    });
  };

  return null; // This component doesn't render anything visible directly
}
