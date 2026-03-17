"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, RefreshCw, Key } from "lucide-react";

interface FaceLoginProps {
  onSuccess: () => void;
}

export default function FaceLogin({ onSuccess }: FaceLoginProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [isClosing, setIsClosing] = useState(false);

  const loadModels = async () => {
    try {
      const faceapi = await import("face-api.js");
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load face-api models:", err);
      if (err instanceof Error) {
         setError(`Face recognition system failed to load: ${err.message}`);
      } else {
         setError("Face recognition system failed to load.");
      }
      setLoading(false);
    }
  };

  const startVideo = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: "user" } 
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Please allow camera access to unlock.");
    }
  }, []);

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    loadModels();
    setStartTime(Date.now());
    return () => stopVideo();
  }, []);

  useEffect(() => {
    if (modelsLoaded && !isSuccess) {
      startVideo();
    }
  }, [modelsLoaded, isSuccess, startVideo]);

  const detectAndMatch = useCallback(async () => {
    if (!videoRef.current || !modelsLoaded || isSuccess || error) return;

    try {
      const faceapi = await import("face-api.js");
      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const storedDescriptorRaw = localStorage.getItem('recallhq_face_descriptor');
        if (!storedDescriptorRaw) {
          setError("No Face ID found. Please register first.");
          return;
        }

        const savedDescriptor = new Float32Array(JSON.parse(storedDescriptorRaw));
        const liveDescriptor = detection.descriptor;
        
        const distance = faceapi.euclideanDistance(liveDescriptor, savedDescriptor);
        
        if (distance < 0.5) {
          setIsSuccess(true);
          stopVideo();
          setTimeout(() => {
            setIsClosing(true);
            setTimeout(() => onSuccess(), 800);
          }, 1500);
          return;
        }
      }

      if (Date.now() - startTime > 10000) {
        setError("Face not recognized 😕");
      } else {
        setTimeout(detectAndMatch, 800);
      }

    } catch (err) {
      console.error("Detection error:", err);
    }
  }, [modelsLoaded, isSuccess, startTime, onSuccess, error]);

  useEffect(() => {
    if (modelsLoaded && !isSuccess && !error) {
      const timer = setTimeout(detectAndMatch, 1000);
      return () => clearTimeout(timer);
    }
  }, [modelsLoaded, isSuccess, error, detectAndMatch]);

  const handleRetry = () => {
    setError(null);
    setStartTime(Date.now());
    startVideo();
  };

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
              Face Unlock
            </h1>
            <p style={{ fontFamily: "DM Sans", color: "#9aa5b4", fontSize: 16, marginTop: 8 }}>
              Look at the camera to unlock
            </p>
          </div>

          {/* Main Camera Circle Section */}
          <div style={{ position: "relative", marginTop: 40 }}>
            {/* Outer Neumorphic Card */}
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
              {/* Camera Container */}
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
                  <>
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
                    
                    {/* Horizontal Scan Line */}
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

            {/* Scanning Ring */}
            {!isSuccess && !error && (
               <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                style={{
                  position: "absolute",
                  inset: -10,
                  borderRadius: "50%",
                  border: "2px dashed #f15a2b",
                  opacity: 0.4,
                  pointerEvents: "none"
                }}
              />
            )}
          </div>

          {/* Status Indicators */}
          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {isSuccess ? (
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  color: "#00b894",
                  fontWeight: 900,
                  fontSize: 22,
                  fontFamily: "Nunito",
                  display: "flex",
                  alignItems: "center",
                  gap: 12
                }}
              >
                Identification Verified ✓
              </motion.span>
            ) : error ? (
              <motion.div 
                initial={{ x: -10 }}
                animate={{ x: [0, -10, 10, -8, 8, 0] }}
                transition={{ duration: 0.5 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}
              >
                <div 
                  style={{
                    padding: "12px 24px",
                    borderRadius: 20,
                    background: "rgba(241, 90, 43, 0.08)",
                    border: "none",
                    boxShadow: "inset 2px 2px 5px rgba(241, 90, 43, 0.1)",
                    color: "#f15a2b",
                    fontWeight: 800,
                    fontSize: 17,
                    fontFamily: "Nunito"
                  }}
                >
                  {error}
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRetry}
                    style={{
                      padding: "16px 36px",
                      background: "linear-gradient(135deg, #4facfe, #00c6ff)",
                      color: "white",
                      borderRadius: 50,
                      border: "none",
                      fontWeight: 900,
                      fontFamily: "Nunito",
                      fontSize: 16,
                      boxShadow: "5px 5px 15px rgba(79, 172, 254, 0.4), -2px -2px 8px rgba(255,255,255,0.6)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10
                    }}
                  >
                    <RefreshCw size={20} strokeWidth={2.5} />
                    Try Again
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
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
                      display: "flex",
                      alignItems: "center",
                      gap: 10
                    }}
                  >
                    <Key size={18} strokeWidth={2.5} />
                    Enter PIN
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ color: "#f15a2b", fontWeight: 900, fontSize: 18, fontFamily: "Nunito", letterSpacing: "0.05em" }}>
                  IDENTIFYING...
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.div
                      key={i}
                      animate={{ translateY: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay }}
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: "#f15a2b",
                        boxShadow: "0 0 10px rgba(241, 90, 43, 0.4)"
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Branding */}
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
