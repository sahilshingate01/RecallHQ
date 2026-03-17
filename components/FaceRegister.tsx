"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Camera } from "lucide-react";

interface FaceRegisterProps {
  onComplete: () => void;
}

export default function FaceRegister({ onComplete }: FaceRegisterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

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
        setError(`Failed to initialize Face ID systems: ${err.message}`);
      } else {
        setError("Failed to initialize Face ID systems.");
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
      setError("Please allow camera access to set up Face ID.");
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
    return () => stopVideo();
  }, []);

  useEffect(() => {
    if (modelsLoaded && !isRegistered) {
      startVideo();
    }
  }, [modelsLoaded, isRegistered, startVideo]);

  const handleCapture = async () => {
    if (!videoRef.current || !modelsLoaded) return;
    
    setIsCapturing(true);
    setError(null);

    try {
      const faceapi = await import("face-api.js");
      const detections = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        setError("Face not detected. Look directly at the camera.");
        setIsCapturing(false);
        return;
      }

      const descriptorArray = Array.from(detections.descriptor);
      localStorage.setItem('recallhq_face_descriptor', JSON.stringify(descriptorArray));
      localStorage.setItem('recallhq_face_registered', 'true');
      
      setIsRegistered(true);
      stopVideo();
      
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration error. Please try again.");
    } finally {
      setIsCapturing(false);
    }
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
    <div 
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#dde3ed",
        padding: 24,
      }}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: 480,
          padding: 48,
          borderRadius: 40,
          background: "#e8ecf4",
          boxShadow: "20px 20px 60px rgba(163,177,198,0.7), -20px -20px 60px rgba(255,255,255,0.95)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <h2 style={{ fontFamily: "Nunito", fontWeight: 900, fontSize: 32, color: "#1e2a3a", margin: 0 }}>
            Set Up Face ID 🎭
          </h2>
          <p style={{ fontFamily: "DM Sans", color: "#9aa5b4", fontSize: 16, marginTop: 10 }}>
            FaceID recognizes you whenever you open RecallHQ
          </p>
        </div>

        <div style={{ position: "relative", width: 260, height: 260, marginBottom: 48 }}>
           {/* Outer Neumorphic Card */}
           <div 
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "#e8ecf4",
              boxShadow: "inset 6px 6px 15px rgba(163,177,198,0.6), inset -6px -6px 15px rgba(255,255,255,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              overflow: "hidden",
              position: "relative"
            }}
          >
            {!isRegistered ? (
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
                    borderRadius: "50%",
                  }}
                />
                <AnimatePresence>
                  {isCapturing && (
                    <motion.div
                      initial={{ top: "-100%" }}
                      animate={{ top: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        height: 3,
                        background: "#f15a2b",
                        boxShadow: "0 0 15px #f15a2b",
                        zIndex: 20
                      }}
                    />
                  )}
                </AnimatePresence>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ color: "#00b894", zIndex: 30 }}
              >
                <CheckCircle2 size={120} strokeWidth={1.5} />
              </motion.div>
            )}
            
            {error && (
              <div 
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(30, 42, 58, 0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 24,
                  textAlign: "center",
                  zIndex: 40,
                  borderRadius: "50%",
                }}
              >
                <p style={{ color: "white", fontSize: 13, fontWeight: 700, fontFamily: "DM Sans" }}>{error}</p>
              </div>
            )}
          </div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: "2px dashed #f15a2b",
              opacity: 0.25,
              pointerEvents: "none"
            }}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleCapture}
          disabled={isCapturing || isRegistered}
          style={{
            width: "100%",
            padding: "18px",
            borderRadius: 50,
            border: "none",
            cursor: (isCapturing || isRegistered) ? "default" : "pointer",
            fontWeight: 900,
            fontFamily: "Nunito",
            fontSize: 17,
            color: "white",
            background: isRegistered 
              ? "linear-gradient(135deg, #00b894, #55efc4)" 
              : "linear-gradient(135deg, #f15a2b, #ee5a24)",
            boxShadow: isRegistered
              ? "5px 5px 15px rgba(0, 184, 148, 0.35)"
              : "6px 6px 18px rgba(241, 90, 43, 0.4), -4px -4px 10px rgba(255,255,255,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            transition: "all 0.3s ease",
          }}
        >
          {isRegistered ? (
            <>
              <CheckCircle2 size={20} strokeWidth={2.5} />
              Setup Complete
            </>
          ) : isCapturing ? (
            "Capturing Identity..."
          ) : (
            <>
              <Camera size={20} strokeWidth={2.5} />
              Set Up Face ID
            </>
          )}
        </motion.button>

        {error && (
          <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 10, color: "#f15a2b", fontSize: 13, fontWeight: 700, fontFamily: "DM Sans" }}>
            <AlertCircle size={16} strokeWidth={2.5} />
            <span>Try adjusting your lighting</span>
          </div>
        )}
      </div>
    </div>
  );
}
