import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getMessaging, Messaging, getToken, onMessage } from "firebase/messaging"

let firebaseApp: FirebaseApp | null = null
let messagingInstance: Messaging | null = null

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") {
    return null
  }

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  const hasConfig = Object.values(config).some((v) => v)

  if (!hasConfig) {
    console.warn("Firebase config not found. Push notifications disabled.")
    return null
  }

  if (!firebaseApp) {
    firebaseApp = initializeApp(config)
  }

  return firebaseApp
}

export function getMessagingInstance(): Messaging | null {
  const app = getFirebaseApp()
  if (!app) {
    return null
  }

  if (!messagingInstance) {
    try {
      messagingInstance = getMessaging(app)
    } catch (error) {
      console.error("Failed to initialize Firebase Messaging:", error)
      return null
    }
  }

  return messagingInstance
}

export function getVapidKey(): string | null {
  return process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || null
}

export { getToken, onMessage }

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
}