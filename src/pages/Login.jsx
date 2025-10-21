import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { auth, db, signInWithGoogle, signInWithGithub } from "../firebase/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- Social Login ---
  const handleSocialLogin = async (provider) => {
    try {
      let result;
      if (provider === "google") result = await signInWithGoogle();
      else if (provider === "github") result = await signInWithGithub();

      const user = result.user; // ✅ full result, now this works
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (userData?.role === "employer") navigate("/employer-dashboard");
      else if (userData?.role === "jobseeker") navigate("/jobseeker-dashboard");
      else navigate("/selectrole"); // fallback

    } catch (err) {
      console.error("Social login error:", err);
      alert("Login failed: " + err.message);
    }
  };

  // --- Email/Password Login ---
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (userData?.role === "employer") navigate("/employer-dashboard");
      else if (userData?.role === "jobseeker") navigate("/jobseeker-dashboard");
      else navigate("/selectrole");

    } catch (err) {
      console.error("Email login error:", err);
      alert("Login failed: " + err.message);
    }
  };


  return (
    <div className="login-page">

      <div className="login-container">
        {/* Left Section */}
        <div className="login-left">
          <h2 className="login-title">Login</h2>
          <p className="login-subtitle">
            Welcome! Please log in to your account.
          </p>

          <form className="login-form" onSubmit={handleEmailLogin}>
            <label>Email</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Please enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="login-btn">LOGIN</button>
          </form>

          <div className="login-links">
            <a href="#">Forgot Password?</a>
            <a href="/signup">Create an account</a>
          </div>

          {/* Social Login */}
          <div className="social-login">
            <p>Or login with</p>
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="google-btn"
            >
              Sign in with Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("github")}
              className="github-btn"
            >
              Sign in with GitHub
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="login-right">
          <img
            src="https://img.freepik.com/free-vector/data-analysis-concept-illustration_114360-8042.jpg"
            alt="Login Illustration"
            className="login-image"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
