import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB5hDkbO5jJBIx-qQu8JmWk2NvC_4sYo_8",
  authDomain: "melibee-f5b62.firebaseapp.com",
  projectId: "melibee-f5b62",
  storageBucket: "melibee-f5b62.firebasestorage.app",
  messagingSenderId: "1075258677696",
  appId: "1:1075258677696:web:3589807e6932fa434c1025",
  measurementId: "G-XB4BHLK4XW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
