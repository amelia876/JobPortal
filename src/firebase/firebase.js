// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYjjzQZunjUJ4IOJ-s_GLKQYxOw5V8psI",
  authDomain: "jobportal-84fc0.firebaseapp.com",
  projectId: "jobportal-84fc0",
  storageBucket: "jobportal-84fc0.appspot.com",
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

// Social auth providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
//export const facebookProvider = new FacebookAuthProvider();

// Social login functions
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signInWithGithub = async () => {
  const result = await signInWithPopup(auth, githubProvider);
  return result.user;
};

//export const signInWithFacebook = async () => {
//  const result = await signInWithPopup(auth, facebookProvider);
//  return result.user;
//};
