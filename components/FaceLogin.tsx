"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, RefreshCw, Key, ShieldCheck } from "lucide-react";
import { settingsService } from "@/lib/settingsService";

interface FaceLoginProps {
  onSuccess: () => void;
}

export default function FaceLogin({ onSuccess }: FaceLoginProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  // Use refs for values needed in callbacks to avoid stale closures
  const startTimeRef = useRef(Date.now());
  const isMountedRef = useRef(true);
  const detectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDetectingRef = useRef(false);
  const isSuccessRef = useRef(false);
  const errorRef = useRef<string | null>(null);
  const showPinInputRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { errorRef.current = error; }, [error]);
  useEffect(() => { showPinInputRef.current = showPinInput; }, [showPinInput]);

  const clearDetectionTimer = () => {
    if (detectionTimerRef.current) {
      clearTimeout(detectionTimerRef.current);
      detectionTimerRef.current = null;
    }
  };

  const loadModels = async () => {
    try {
      const { loadFaceApiModels } = await import("@/lib/faceApiUtils");
      await loadFaceApiModels();
      if (!isMountedRef.current) return;
      setModelsLoaded(true);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load face-api models:", err);
      if (!isMountedRef.current) return;
      setError("Face recognition system failed to load.");
      setLoading(false);
    }
  };

  const startVideo = useCallback(async () => {
    if (!videoRef.current) return;
    // Stop any existing stream first
    if (videoRef.current.srcObject) {
      const existing = videoRef.current.srcObject as MediaStream;
      existing.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      if (!isMountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied:", err);
      if (isMountedRef.current) {
        setError("Please allow camera access to unlock.");
      }
    }
  }, []);

  const stopVideo = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  // Core detection logic — no recursive setTimeout; called by the scheduler below
  const runDetectionOnce = useCallback(async (): Promise<boolean> => {
    if (!videoRef.current || !isMountedRef.current) return false;

    const video = videoRef.current;
    // Wait for the video to be ready (readyState >= 2 = HAVE_CURRENT_DATA)
    if (video.readyState < 2 || video.paused || video.videoWidth === 0) {
      return false; // not ready yet, will retry
    }

    try {
      const faceapi = await import("face-api.js");
      const detection = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) return false;

      let storedDescriptorRaw = localStorage.getItem("recallhq_face_descriptor");

      // If not found locally, try fetching from cloud
      if (!storedDescriptorRaw) {
        const settings = await settingsService.getSettings();
        if (settings && settings.face_descriptor) {
          storedDescriptorRaw = JSON.stringify(settings.face_descriptor);
          localStorage.setItem("recallhq_face_descriptor", storedDescriptorRaw);
          localStorage.setItem("recallhq_face_registered", "true");
        }
      }

      if (!storedDescriptorRaw) {
        if (isMountedRef.current) {
          setError("Face ID not registered on this device or cloud.");
        }
        return true; // stop detection — permanent error
      }

      const savedDescriptor = new Float32Array(JSON.parse(storedDescriptorRaw));
      const liveDescriptor = detection.descriptor;
      const distance = faceapi.euclideanDistance(liveDescriptor, savedDescriptor);

      if (distance < 0.6) {
        return true; // matched!
      }

      return false; // no match yet
    } catch (err) {
      console.error("Detection error:", err);
      return false;
    }
  }, []);

  const handleSuccess = useCallback(() => {
    if (isSuccessRef.current) return;
    isSuccessRef.current = true;
    isDetectingRef.current = false;
    clearDetectionTimer();
    setIsSuccess(true);
    stopVideo();
    setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => onSuccess(), 800);
    }, 1500);
  }, [stopVideo, onSuccess]);

  // Detection scheduler — a clean loop using timeouts managed by refs
  const scheduleDetection = useCallback(() => {
    clearDetectionTimer();
    if (!isMountedRef.current || isSuccessRef.current || errorRef.current || showPinInputRef.current) return;
    if (!isDetectingRef.current) return;

    const INTERVAL = 600;
    const TIMEOUT = 16000;

    const tick = async () => {
      if (!isMountedRef.current || isSuccessRef.current || errorRef.current || showPinInputRef.current) return;
      if (!isDetectingRef.current) return;

      const matched = await runDetectionOnce();

      if (!isMountedRef.current) return;

      if (matched) {
        handleSuccess();
        return;
      }

      // Check timeout
      if (Date.now() - startTimeRef.current > TIMEOUT) {
        if (isMountedRef.current && !isSuccessRef.current && !errorRef.current) {
          setError("Having trouble recognizing you. Please try again or use PIN.");
        }
        isDetectingRef.current = false;
        return;
      }

      // Schedule next tick
      if (!isSuccessRef.current && !errorRef.current && !showPinInputRef.current) {
        detectionTimerRef.current = setTimeout(tick, INTERVAL);
      }
    };

    // Initial delay to let video stabilize
    detectionTimerRef.current = setTimeout(tick, 800);
  }, [runDetectionOnce, handleSuccess]);

  const startDetection = useCallback(() => {
    startTimeRef.current = Date.now();
    isDetectingRef.current = true;
    scheduleDetection();
  }, [scheduleDetection]);

  const stopDetection = () => {
    isDetectingRef.current = false;
    clearDetectionTimer();
  };

  // Mount / unmount
  useEffect(() => {
    isMountedRef.current = true;
    loadModels();
    return () => {
      isMountedRef.current = false;
      stopDetection();
      stopVideo();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start video + detection once models are ready
  useEffect(() => {
    if (modelsLoaded && !isSuccess && !showPinInput) {
      startVideo().then(() => {
        if (isMountedRef.current && !isSuccess && !showPinInput) {
          startDetection();
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelsLoaded]);

  const handleRetry = useCallback(() => {
    stopDetection();
    setError(null);
    errorRef.current = null;
    startVideo().then(() => {
      if (isMountedRef.current) {
        startDetection();
      }
    });
  }, [startVideo, startDetection]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = await settingsService.verifyPin(pin);
    if (valid) {
      handleSuccess();
    } else {
      setPinError(true);
      setPin("");
      setTimeout(() => setPinError(false), 500);
    }
  };

  const handleSwitchToPin = useCallback(() => {
    stopDetection();
    stopVideo();
    showPinInputRef.current = true;
    setShowPinInput(true);
    setPin("");
  }, [stopVideo]);

  const handleSwitchToFace = useCallback(() => {
    setShowPinInput(false);
    showPinInputRef.current = false;
    setPin("");
    startVideo().then(() => {
      if (isMountedRef.current) {
        startDetection();
      }
    });
  }, [startVideo, startDetection]);

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#dde3ed",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "4px solid #f15a2b",
            borderTopColor: "transparent",
          }}
        />
        <p style={{ marginTop: 20, color: "#9aa5b4", fontWeight: 700, fontFamily: "Nunito, sans-serif", letterSpacing: "0.05em" }}>
          RecallHQ 🔐
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isClosing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#dde3ed",
            padding: 24,
          }}
        >
          {/* Top Section */}
          <div style={{ position: "absolute", top: 48, textAlign: "center" }}>
            <span style={{ fontFamily: "Nunito", fontWeight: 900, fontSize: 13, color: "rgba(30, 42, 58, 0.4)", letterSpacing: "0.25em", textTransform: "uppercase", display: "block", marginBottom: 12 }}>
              Identify Verified
            </span>
            <h1 style={{ fontFamily: "Nunito", fontWeight: 900, fontSize: 42, color: "#1e2a3a", margin: 0, lineHeight: 1 }}>
              {showPinInput ? "PIN Unlock" : "Face Unlock"}
            </h1>
            <p style={{ fontFamily: "DM Sans", color: "#9aa5b4", fontSize: 16, marginTop: 8 }}>
              {showPinInput ? "Enter your security code" : "Look at the camera to unlock"}
            </p>
          </div>

          {/* Main Area */}
          <div style={{ position: "relative", marginTop: 40 }}>
            <div
              style={{
                width: 340,
                height: 340,
                borderRadius: "50%",
                background: "#e8ecf4",
                boxShadow: "15px 15px 35px rgba(163,177,198,0.7), -15px -15px 35px rgba(255,255,255,0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 18,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  background: "#e0e5ef",
                  boxShadow: "inset 6px 6px 12px rgba(0,0,0,0.1), inset -6px -6px 12px rgba(255,255,255,0.7)",
                }}
              >
                {!isSuccess ? (
                  showPinInput ? (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
                      <form onSubmit={handlePinSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                        <motion.input
                          animate={pinError ? { x: [-10, 10, -10, 10, 0] } : {}}
                          type="password"
                          maxLength={10}
                          value={pin}
                          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                          placeholder="••••••••••"
                          autoFocus
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            fontSize: 48,
                            textAlign: "center",
                            color: "#1e2a3a",
                            fontFamily: "Nunito",
                            letterSpacing: "0.2em",
                            outline: "none",
                          }}
                        />
                        <button type="submit" style={{ display: "none" }}>Unlock</button>
                        <ShieldCheck size={48} color={pinError ? "#f15a2b" : "#9aa5b4"} opacity={0.3} />
                      </form>
                    </div>
                  ) : (
                    <>
                      {/* Video is always in DOM so it can be reused on switch back */}
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transform: "scaleX(-1)",
                        }}
                      />
                      {!error && (
                        <motion.div
                          animate={{ translateY: [-170, 170] }}
                          transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: 3,
                            zIndex: 20,
                            background: "linear-gradient(to right, transparent, rgba(79, 172, 254, 0.8), transparent)",
                            boxShadow: "0 0 15px rgba(79, 172, 254, 0.5)",
                          }}
                        />
                      )}
                    </>
                  )
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(135deg, #00b894, #55efc4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 30,
                    }}
                  >
                    <CheckCircle2 size={120} color="white" strokeWidth={1.5} />
                  </motion.div>
                )}
              </div>
            </div>

            {!isSuccess && !error && !showPinInput && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                style={{
                  position: "absolute",
                  inset: -10,
                  borderRadius: "50%",
                  border: "2px dashed #f15a2b",
                  opacity: 0.4,
                  pointerEvents: "none",
                }}
              />
            )}
          </div>

          {/* Status/Actions */}
          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {isSuccess ? (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ color: "#00b894", fontWeight: 900, fontSize: 22, fontFamily: "Nunito" }}
              >
                Access Granted ✓
              </motion.span>
            ) : showPinInput ? (
              <div style={{ display: "flex", gap: 16 }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSwitchToFace}
                  style={{
                    padding: "16px 36px",
                    background: "#e8ecf4",
                    color: "#9aa5b4",
                    borderRadius: 50,
                    border: "none",
                    fontWeight: 900,
                    fontFamily: "Nunito",
                    fontSize: 16,
                    boxShadow: "5px 5px 15px rgba(163,177,198,0.5), -5px -5px 15px rgba(255,255,255,0.9)",
                    cursor: "pointer",
                  }}
                >
                  Use Face ID
                </motion.button>
              </div>
            ) : error ? (
              <motion.div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 20, background: "rgba(241, 90, 43, 0.08)", color: "#f15a2b", fontWeight: 800 }}>
                  <AlertCircle size={16} strokeWidth={2.5} />
                  {error}
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRetry}
                    style={{ padding: "16px 36px", background: "linear-gradient(135deg, #4facfe, #00c6ff)", color: "white", borderRadius: 50, border: "none", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <RefreshCw size={20} strokeWidth={2.5} /> Retry
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSwitchToPin}
                    style={{ padding: "16px 36px", background: "#e8ecf4", color: "#9aa5b4", borderRadius: 50, border: "none", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Key size={18} strokeWidth={2.5} /> Enter PIN
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ color: "#f15a2b", fontWeight: 900, fontSize: 18, fontFamily: "Nunito" }}>IDENTIFYING...</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSwitchToPin}
                  style={{ background: "transparent", border: "none", color: "#9aa5b4", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                >
                  <Key size={16} /> Use PIN instead
                </motion.button>
              </div>
            )}
          </div>

          <div style={{ position: "absolute", bottom: 48 }}>
            <p style={{ color: "rgba(30, 42, 58, 0.3)", fontWeight: 800, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Nunito" }}>
              RecallHQ Secured 🔐
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
