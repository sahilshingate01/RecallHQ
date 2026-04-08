"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, 
  Trash2, 
  RotateCcw, 
  Copy, 
  Check,
  Edit3,
  Clock
} from "lucide-react";

const STORAGE_KEY = "recallhq_notepad_content";

export default function NotepadPage() {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Load content on mount
  useEffect(() => {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  // Save content to localStorage
  const saveContent = useCallback((value: string) => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, value);
    setLastSaved(new Date());
    
    // Simulate a brief "saving" state for visual feedback
    setTimeout(() => {
      setIsSaving(false);
    }, 600);
  }, []);

  // Debounce saving
  useEffect(() => {
    if (content === "") return;
    
    const timeoutId = setTimeout(() => {
      saveContent(content);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [content, saveContent]);

  const handleClear = () => {
    if (confirm("Are you sure you want to clear your notepad? This cannot be undone.")) {
      setContent("");
      localStorage.removeItem(STORAGE_KEY);
      setLastSaved(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div style={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column", 
      gap: 24,
      position: "relative"
    }}>
      {/* --- Header --- */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        flexShrink: 0 
      }}>
        <div>
          <h1 style={{ 
            fontFamily: "Nunito, sans-serif", 
            fontWeight: 900, 
            fontSize: 28, 
            color: "#1e2a3a", 
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 12
          }}>
            Digital Notepad <Edit3 size={24} color="#f15a2b" />
          </h1>
          <p style={{ 
            fontFamily: "DM Sans", 
            fontSize: 14, 
            color: "#9aa5b4", 
            margin: "4px 0 0",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}>
            {isSaving ? (
              <span style={{ color: "#f15a2b", fontWeight: 600 }}>Saving changes...</span>
            ) : lastSaved ? (
              <>
                <Clock size={12} />
                Last saved: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </>
            ) : (
              "Your thoughts are automatically saved as you type"
            )}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Copy Button */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            style={{
              padding: "10px 18px",
              borderRadius: 50,
              border: "none",
              cursor: "pointer",
              background: "#e8ecf4",
              color: copySuccess ? "#00b894" : "#636e72",
              fontFamily: "DM Sans",
              fontWeight: 700,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "5px 5px 12px rgba(163,177,198,0.5), -5px -5px 12px rgba(255,255,255,0.85)",
            }}
          >
            {copySuccess ? <Check size={16} /> : <Copy size={16} />}
            {copySuccess ? "Copied!" : "Copy"}
          </motion.button>

          {/* Reset Button */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClear}
            style={{
              padding: "10px 18px",
              borderRadius: 50,
              border: "none",
              cursor: "pointer",
              background: "#e8ecf4",
              color: "#f15a2b",
              fontFamily: "DM Sans",
              fontWeight: 700,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "5px 5px 12px rgba(163,177,198,0.5), -5px -5px 12px rgba(255,255,255,0.85)",
            }}
          >
            <Trash2 size={16} />
            Clear
          </motion.button>
        </div>
      </div>

      {/* --- Notepad Content --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          flex: 1,
          display: "flex",
          position: "relative",
          borderRadius: 32,
          overflow: "hidden",
          background: "#e8ecf4",
          boxShadow: "inset 6px 6px 12px rgba(163,177,198,0.5), inset -6px -6px 12px rgba(255,255,255,0.8)",
          padding: 24
        }}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your thoughts here..."
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 18,
            lineHeight: 1.6,
            color: "#1e2a3a",
            resize: "none",
            padding: "20px",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(163,177,198,0.5) transparent"
          }}
        />
        
        {/* Subtle Watermark/Decoration */}
        <div style={{
          position: "absolute",
          top: 24,
          right: 32,
          opacity: 0.03,
          pointerEvents: "none",
          userSelect: "none"
        }}>
          <Edit3 size={300} />
        </div>
      </motion.div>

      {/* Persistence indicator bottom right */}
      <div style={{
        position: "absolute",
        bottom: 12,
        right: 4,
        fontFamily: "DM Sans",
        fontSize: 11,
        color: "#9aa5b4",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.1em"
      }}>
        RecallHQ Secure Local Storage
      </div>

      <style jsx>{`
        textarea::placeholder {
          color: #9aa5b4;
          opacity: 0.5;
        }
        
        textarea::-webkit-scrollbar {
          width: 6px;
        }
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea::-webkit-scrollbar-thumb {
          background: rgba(163, 177, 198, 0.4);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
