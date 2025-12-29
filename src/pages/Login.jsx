import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, signInWithGoogle, signInWithGithub } from "../firebase/firebase";
import "./Login.css";

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    keepLoggedIn: false,
  });

  // Password reset states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      console.log("Login attempt with:", formData.email);

      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const firebaseUser = userCredential.user;
      console.log("Firebase auth successful:", firebaseUser.uid);

      // 🔐 CHECK EMAIL VERIFICATION
      if (!firebaseUser.emailVerified) {
        setError("❌ Please verify your email before logging in. Check your inbox for the verification link.");
        await auth.signOut(); // Force logout
        setLoading(false);
        return;
      }

      // 2. Fetch user data from Firestore including role
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("User profile not found in database");
      }

      const userData = userDoc.data();
      console.log("User data from Firestore:", userData);

      // 3. Create user object with role from Firestore
      const user = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: userData.role || "jobseeker",
        name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileCompleted: userData.profileCompleted || false,
        isFirstTimeUser: userData.isFirstTimeUser || false,
        emailVerified: firebaseUser.emailVerified,
        token: await firebaseUser.getIdToken(),
      };

      setUser(user);

      // 4. Redirect based on user status
      console.log("User status:", {
        profileCompleted: user.profileCompleted,
        isFirstTimeUser: user.isFirstTimeUser,
        role: user.role
      });

      // ✅ NEW LOGIC: Redirect first-time users to complete profile
      if (user.isFirstTimeUser && !user.profileCompleted) {
        console.log("First-time user detected, redirecting to complete-profile");
        navigate("/complete-profile");
        return;
      }

      // Old logic for returning users
      if (!user.profileCompleted) {
        navigate("/complete-profile");
        return;
      }

      // Redirect based on role
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "employer":
          navigate("/employer");
          break;
        case "jobseeker":
          navigate("/jobseeker");
          break;
        default:
          navigate("/jobseeker");
      }
    } catch (err) {
      console.error("Login error:", err);

      // Handle specific Firebase errors
      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email address format.");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled.");
          break;
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your connection.");
          break;
        default:
          setError(err.message || "Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowResetModal(true);
    setResetStatus("");
    setResetEmail(formData.email || "");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setResetStatus("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setResetStatus("Please enter a valid email address");
      return;
    }

    setResetLoading(true);
    setResetStatus("");

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      
      setResetStatus("success");
      setResetEmail("");
      
      setTimeout(() => {
        setShowResetModal(false);
        setResetStatus("");
      }, 3000);
      
    } catch (err) {
      console.error("Password reset error:", err);
      
      switch (err.code) {
        case "auth/invalid-email":
          setResetStatus("Invalid email address");
          break;
        case "auth/user-not-found":
          setResetStatus("No account found with this email");
          break;
        case "auth/too-many-requests":
          setResetStatus("Too many attempts. Please try again later");
          break;
        case "auth/network-request-failed":
          setResetStatus("Network error. Please check your connection");
          break;
        default:
          setResetStatus("Failed to send reset email. Please try again");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmail("");
    setResetStatus("");
  };

















 const handleSocialLogin = async (platform) => {
  setLoading(true);
  setError("");
  
  try {
    let user;
    
    if (platform === "Google") {
      const result = await signInWithGoogle();
      user = result.user || result; // Try both patterns
    } else if (platform === "GitHub") {
      const result = await signInWithGithub();
      user = result.user || result;
    } else {
      throw new Error("Unsupported social platform");
    }
    
    // Check if user exists
    if (!user || !user.uid) {
      console.error("Social login failed - no user/uid:", user);
      throw new Error(`${platform} login failed - no user returned`);
    }
    
    console.log(`${platform} login successful:`, user.uid);
    
    // Fetch user data from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // EXISTING USER: Continue with normal flow
      const userData = userDoc.data();
      
      const appUser = {
        uid: user.uid,
        email: user.email,
        role: userData.role || "jobseeker",
        name: user.displayName || `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        profileCompleted: userData.profileCompleted || false,
        isFirstTimeUser: userData.isFirstTimeUser || false,
        emailVerified: user.emailVerified || true,
        token: await user.getIdToken?.(),
        isSocialLogin: true,
      };
      
      setUser(appUser);
      
      // ✅ Apply first-time user logic
      if (appUser.isFirstTimeUser && !appUser.profileCompleted) {
        console.log("First-time social user detected, redirecting to complete-profile");
        navigate("/complete-profile");
        return;
      }
      
      if (!appUser.profileCompleted) {
        navigate("/complete-profile");
        return;
      }
      
      // Redirect based on role
      switch (appUser.role) {
        case "admin":
          navigate("/admin");
          break;
        case "employer":
          navigate("/employer");
          break;
        case "jobseeker":
          navigate("/jobseeker");
          break;
        default:
          navigate("/jobseeker");
      }
    } else {
      // NEW SOCIAL USER: Redirect to role selection
      console.log("New social user, redirecting to role selection");
      
      // Create SIMPLE serializable object
      const newUserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        provider: platform.toLowerCase(),
        emailVerified: user.emailVerified || true
      };
      
      // Save to sessionStorage
      sessionStorage.setItem('tempSocialUser', JSON.stringify(newUserData));
      navigate("/select-role");
      return;
    }
    
  } catch (err) {
    console.error(`${platform} login error:`, err);
    
    if (err.code === "auth/popup-closed-by-user") {
      setError(`${platform} login was cancelled.`);
    } else if (err.code === "auth/account-exists-with-different-credential") {
      setError("An account already exists with the same email but different sign-in method.");
    } else if (err.code === "auth/popup-blocked") {
      setError("Popup blocked! Please allow popups for this site.");
    } else {
      setError(`${platform} login failed: ${err.message || "Please try again."}`);
    }
  } finally {
    setLoading(false);
  }
};



  
  const renderResetModal = () => {
    if (!showResetModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Reset Your Password</h3>
            <button className="modal-close-btn" onClick={closeResetModal}>
              ×
            </button>
          </div>
          
          <div className="modal-body">
            {resetStatus === "success" ? (
              <div className="reset-success">
                <i className="fas fa-check-circle success-icon"></i>
                <h4>Check Your Email!</h4>
                <p>
                  We've sent password reset instructions to your email address.
                  Please check your inbox (and spam folder) for the reset link.
                </p>
                <p className="reset-note">
                  The link will expire in 1 hour.
                </p>
                <button 
                  className="modal-action-btn"
                  onClick={closeResetModal}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="reset-instructions">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <form onSubmit={handleResetPassword}>
                  <div className="form-group">
                    <label htmlFor="resetEmail" className="form-label">
                      Email Address<span className="required-star">*</span>
                    </label>
                    <input
                      type="email"
                      id="resetEmail"
                      className="form-input"
                      placeholder="your.email@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      disabled={resetLoading}
                      required
                      autoFocus
                    />
                  </div>
                  
                  {resetStatus && resetStatus !== "success" && (
                    <div className="reset-error-message">
                      <i className="fas fa-exclamation-circle"></i> {resetStatus}
                    </div>
                  )}
                  
                  <div className="modal-buttons">
                    <button
                      type="button"
                      className="modal-cancel-btn"
                      onClick={closeResetModal}
                      disabled={resetLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="modal-action-btn"
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <header className="page-header">
        <div className="header-content">
          <Link to="/" className="brand-logo">
            Joblytics
          </Link>
          <nav className="nav-links">
            <Link to="/" className="nav-item">
              Home
            </Link>
            <Link to="/jobs" className="nav-item">
              Jobs
            </Link>
            <Link to="/about" className="nav-item">
              About
            </Link>
            <Link to="/contact" className="nav-item">
              Contact
            </Link>
          </nav>
          <div className="nav-actions">
            <button className="action-btn action-login">Login</button>
            <button
              className="action-btn action-signup"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <div className="login-container">
        <div className="login-form-container">
          <div className="login-form-wrapper">
            <h1 className="login-title">Login to your account</h1>
            <p className="login-subtitle">
              Welcome back, please enter your details
            </p>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="emailInput" className="form-label">
                  Email address<span className="required-star">*</span>
                </label>
                <input
                  type="email"
                  id="emailInput"
                  name="email"
                  className="form-input"
                  placeholder="nam@website.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="passwordInput" className="form-label">
                  Password<span className="required-star">*</span>
                </label>
                <input
                  type="password"
                  id="passwordInput"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-options-row">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="keepLoggedIn"
                    name="keepLoggedIn"
                    className="checkbox-input"
                    checked={formData.keepLoggedIn}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="keepLoggedIn" className="checkbox-label">
                    Keep me logged in
                  </label>
                </div>
                <span
                  className="forgot-password-link"
                  onClick={handleForgotPassword}
                  style={{ cursor: "pointer" }}
                >
                  Forgot password?
                </span>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </button>

              <div className="divider">
                <span className="divider-text">OR</span>
              </div>

              <div className="social-login-buttons">
                <button
                  type="button"
                  className="social-login-btn google-btn"
                  onClick={() => handleSocialLogin("Google")}
                  disabled={loading}
                >
                  <i className="fab fa-google social-icon"></i>
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  className="social-login-btn github-btn"
                  onClick={() => handleSocialLogin("GitHub")}
                  disabled={loading}
                >
                  <i className="fab fa-github social-icon"></i>
                  <span>Continue with GitHub</span>
                </button>
              </div>

              <div className="signup-prompt">
                Not registered yet?{" "}
                <Link to="/signup" className="signup-link">
                  Create an account!
                </Link>
              </div>

              <div className="copyright">
                © Squarcull design system All Rights Reserved.
              </div>
            </form>
          </div>
        </div>

        <div className="image-sidebar">
          <div className="image-overlay">
            <div className="testimonial-overlay">
              <div className="quote-mark">"</div>
              <p className="testimonial-text">
                Data Analytics transformed our raw data into actionable
                insights. It's a game-changer!
              </p>
              <div className="testimonial-author">
                <div className="author-name">Michael Smith</div>
                <div className="author-title">Data analyst</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {renderResetModal()}
    </>
  );
};

export default Login;
