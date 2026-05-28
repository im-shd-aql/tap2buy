import * as admin from "firebase-admin";
import { env } from "./env";

let firebaseApp: admin.app.App | null = null;

export function initializeFirebase(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  // For development/mock mode
  if (env.otpMode === "mock") {
    console.log("[Firebase] Running in mock mode - skipping initialization");
    return null as any;
  }

  try {
    // Initialize with service account credentials
    if (env.firebaseServiceAccount) {
      const serviceAccount = JSON.parse(env.firebaseServiceAccount);

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log("[Firebase] Initialized with service account");
    } else {
      throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable not set");
    }

    return firebaseApp;
  } catch (error) {
    console.error("[Firebase] Initialization failed:", error);
    throw error;
  }
}

export function getFirebaseAuth(): admin.auth.Auth {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin.auth(firebaseApp!);
}
