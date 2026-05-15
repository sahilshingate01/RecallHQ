import * as faceapi from "face-api.js";

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

export const loadFaceApiModels = async () => {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      modelsLoaded = true;
    } catch (err) {
      loadingPromise = null;
      console.error("Failed to load face-api models:", err);
      throw err;
    }
  })();

  return loadingPromise;
};

export const isFaceApiLoaded = () => modelsLoaded;
