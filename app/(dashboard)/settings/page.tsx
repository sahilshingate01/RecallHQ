"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const handleResetFace = () => {
    if (confirm("Are you sure you want to reset your Face ID? you will need to register again.")) {
      localStorage.removeItem("recallhq_face_registered");
      localStorage.removeItem("recallhq_face_descriptor");
      window.location.reload();
    }
  };

  return (
    <div className="h-full flex flex-col p-8 bg-white/5 w-full">
      <h1 className="text-3xl font-black text-[#1e2a3a] mb-8">Settings ⚙️</h1>
      
      <div className="max-w-2xl space-y-6">
        <section className="p-6 rounded-3xl bg-white/40 sku-raised">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
             Security & Access
          </h2>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/20 sku-inset">
            <div>
              <p className="font-bold">Face ID Authentication</p>
              <p className="text-sm text-gray-500">Currently active on this device</p>
            </div>
            <button 
              onClick={handleResetFace}
              className="px-4 py-2 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-colors"
            >
              Reset Face ID
            </button>
          </div>
        </section>

        <section className="p-6 rounded-3xl bg-white/40 sku-raised">
          <h2 className="text-xl font-bold mb-4">About RecallHQ</h2>
          <div className="space-y-4 text-sm font-medium text-gray-600">
            <p>Version: 1.0.0 (Beta)</p>
            <p>Type: Personal Task Manager</p>
            <p>© 2026 RecallHQ Team</p>
          </div>
        </section>
      </div>
    </div>
  );
}
