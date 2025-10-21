

// Signup page allowing users to register with email/password or via Google/GitHub.

// Signup.jsx
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, signInWithGoogle, signInWithGithub } from "../firebase/firebase";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    phoneNumber: "",
    gender: "",
    role: "job_seeker"
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // List of countries for dropdown
  const countries = [
    "United States", "Canada", "United Kingdom", "Australia", "Germany", 
    "France", "Japan", "India", "Brazil", "Mexico", "South Africa", "Other"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (password.length === 0) return { text: "", className: "" };
    if (password.length < 6) return { text: "Weak", className: "strength-weak" };
    if (password.length < 8) return { text: "Medium", className: "strength-medium" };
    return { text: "Strong", className: "strength-strong" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // --- Email/Password Signup ---
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.country || !formData.phoneNumber || !formData.gender) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: user.email,
        role: formData.role,
        country: formData.country,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        createdAt: new Date(),
        profileCompleted: true
      });

      // Redirect based on role
      if (formData.role === "job_seeker") navigate("/jobseeker");
      else if (formData.role === "employer") navigate("/employer");
      else if (formData.role === "admin") navigate("/admin");
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Social Signup (Google / GitHub) ---
  const handleSocialSignup = async (provider) => {
    try {
      setIsLoading(true);
      let user;
      if (provider === "google") user = await signInWithGoogle();
      else if (provider === "github") user = await signInWithGithub();

      // Store user email (role and other details will be selected later)
      await setDoc(
        doc(db, "users", user.uid),
        { 
          email: user.email,
          createdAt: new Date(),
          profileCompleted: false // Social signups need to complete profile
        },
        { merge: true }
      );

      // Redirect to SelectRole page so user can pick role and complete profile
      navigate("/selectrole");
    } catch (err) {
      console.error("Social signup error:", err.message);
      setError("Signup failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">JobLytics</div>

        <ul className="nav-links">
          <li><a href="/Home">Home</a></li>
          <li><a href="/Login">Jobs</a></li>
          <li><a href="/AboutUs">About</a></li>
          <li><a href="/Contact">Contact</a></li>
        </ul>

        <div className="nav-actions">
          <a href="/login" className="login-btn">Login</a>
          <a href="/signup" className="signup-btn">Sign Up</a>
        </div>
      </nav>

      {/* SIGNUP CONTENT */}
      <div className="signup-container">
        {/* Left Side - Branding */}
        <div className="signup-left">
          <h1>Join Our Community</h1>
          <p>Start your journey with us and discover amazing opportunities tailored just for you.</p>
          
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Connect with top employers</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Personalized job recommendations</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Fast and secure registration</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>24/7 customer support</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="signup-right">
          <div className="signup-form-container">
            <h2>Create Account</h2>
            <p className="signup-subtitle">Join thousands of professionals today</p>

            <form onSubmit={handleSignup}>
              {/* Name Fields */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-input"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-input"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Create a password (min. 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {formData.password && (
                  <div className={`password-strength ${passwordStrength.className}`}>
                    Password strength: {passwordStrength.text}
                  </div>
                )}
              </div>

              {/* Country */}
              <div className="form-group">
                <label className="form-label">Country *</label>
                <select
                  name="country"
                  className="form-select"
                  value={formData.country}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="form-input"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Gender */}
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Role */}
              <div className="form-group">
                <label className="form-label">I am signing up as *</label>
                <select
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="job_seeker">Job Seeker</option>
                  <option value="employer">Employer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Social Signup */}
            <div className="divider">
              <span className="divider-text">Or continue with</span>
            </div>

            <div className="social-buttons">
              <button
                type="button"
                className="social-button google"
                onClick={() => handleSocialSignup("google")}
                disabled={isLoading}
              >
                <span className="social-icon">G</span>
                Google
              </button>
              <button
                type="button"
                className="social-button github"
                onClick={() => handleSocialSignup("github")}
                disabled={isLoading}
              >
                <span className="social-icon">G</span>
                GitHub
              </button>
            </div>

            {/* Login Link */}
            <div className="login-link">
              Already have an account?{" "}
              <a href="/login">Sign in here</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
//  Signup page allowing users to register with email/password or via Google/GitHub.
{/*}
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, signInWithGoogle, signInWithGithub } from "../firebase/firebase";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("job_seeker");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // --- Email/Password Signup ---
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
      });

      if (role === "job_seeker") navigate("/jobseeker");
      else if (role === "employer") navigate("/employer");
      else if (role === "admin") navigate("/admin");
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  // --- Social Signup (Google / GitHub) ---
  const handleSocialSignup = async (provider) => {
    try {
      let user;
      if (provider === "google") user = await signInWithGoogle();
      else if (provider === "github") user = await signInWithGithub();

      // Store user email (role will be selected later)
      await setDoc(
        doc(db, "users", user.uid),
        { email: user.email },
        { merge: true }
      );

      // Redirect to SelectRole page so user can pick role
      navigate("/selectrole");
    } catch (err) {
      console.error("Social signup error:", err.message);
      alert("Signup failed: " + err.message);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Sign Up</h1>

      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginTop: "10px" }}
        />
        <br />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ marginTop: "10px" }}
        >
          <option value="job_seeker">Job Seeker</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
        </select>
        <br />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          type="submit"
          style={{ marginTop: "20px", padding: "10px 20px" }}
        >
          Sign Up
        </button>
      </form>

      <hr style={{ margin: "30px 0" }} />
      <h3>Or sign up with</h3>

      <button
        onClick={() => handleSocialSignup("google")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4285F4",
          color: "white",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        Google
      </button>
      <br />
      <button
        onClick={() => handleSocialSignup("github")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#333",
          color: "white",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
        }}
      >
        GitHub
      </button>
    </div>
  );
};

export default Signup;
*/}


