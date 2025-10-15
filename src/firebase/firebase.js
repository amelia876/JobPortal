// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYjjzQZunjUJ4IOJ-s_GLKQYxOw5V8psI",
  authDomain: "jobportal-84fc0.firebaseapp.com",
  projectId: "jobportal-84fc0",
  storageBucket: "jobportal-84fc0.firebasestorage.app",
  messagingSenderId: "391211718873",
  appId: "1:391211718873:web:ed69f3abdfaa91b2ca86c8",
  measurementId: "G-QTCL4FK0BT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export { analytics };
