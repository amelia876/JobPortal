import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, signInWithGoogle, signInWithGithub } from "../firebase/firebase";
import "./Signup.css";

const Signup = ({ setUser }) => {
  // FIXED: Changed role from "job_seeker" to "jobseeker"
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    phoneNumber: "",
    gender: "",
    role: "jobseeker" // FIXED: Changed from "job_seeker" to "jobseeker"
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    noName: true
  });
  const navigate = useNavigate();
  const location = useLocation();

  const { preselectedJob, searchLocation } = location.state || {};

  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", 
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", 
    "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", 
    "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", 
    "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", 
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", 
    "Colombia", "Comoros", "Congo", "Costa Rica", "Côte d'Ivoire", "Croatia", 
    "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", 
    "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", 
    "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", 
    "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", 
    "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", 
    "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", 
    "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", 
    "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", 
    "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", 
    "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", 
    "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", 
    "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", 
    "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", 
    "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", 
    "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", 
    "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", 
    "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", 
    "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", 
    "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", 
    "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", 
    "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", 
    "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", 
    "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", 
    "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", 
    "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "password") {
      checkPasswordRequirements(value);
    }
  };

  const checkPasswordRequirements = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      noName: !containsName(password)
    };
    setPasswordRequirements(requirements);
  };

  const containsName = (password) => {
    const lowerPassword = password.toLowerCase();
    const firstName = formData.firstName.toLowerCase();
    const lastName = formData.lastName.toLowerCase();
    const emailName = formData.email.split('@')[0]?.toLowerCase();
    
    return (firstName && lowerPassword.includes(firstName)) ||
           (lastName && lowerPassword.includes(lastName)) ||
           (emailName && lowerPassword.includes(emailName));
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { text: "", className: "", score: 0 };
    
    const requirements = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      !containsName(password)
    ];
    
    const score = requirements.filter(Boolean).length;

    if (score <= 2) return { text: "Weak", className: "strength-weak", score };
    if (score <= 4) return { text: "Medium", className: "strength-medium", score };
    return { text: "Strong", className: "strength-strong", score };
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password ||
        !formData.confirmPassword || !formData.country || !formData.phoneNumber || !formData.gender) {
      return "Please fill in all required fields";
    }

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters long";
    }

    if (!passwordRequirements.uppercase) {
      return "Password must include at least one uppercase letter";
    }

    if (!passwordRequirements.lowercase) {
      return "Password must include at least one lowercase letter";
    }

    if (!passwordRequirements.number) {
      return "Password must include at least one number";
    }

    if (!passwordRequirements.specialChar) {
      return "Password must include at least one special character (!@#$%^&*)";
    }

    if (!passwordRequirements.noName) {
      return "Password cannot contain your name or email username";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address";
    }

    return null;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword;
  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setVerificationSent(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      console.log("Starting signup process...");
      
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;
      console.log("Firebase Auth user created:", user.uid);

      await sendEmailVerification(user);
      console.log("Firebase verification email sent");
      
      setVerificationSent(true);

      const userData = {
        uid: user.uid,
        email: user.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        country: formData.country,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        emailVerified: false,
        profileCompleted: false,
        isFirstTimeUser: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (preselectedJob || searchLocation) {
        userData.searchData = {
          jobInterest: preselectedJob || "",
          location: searchLocation || ""
        };
        userData.jobInterest = preselectedJob || "";
        userData.locationPreference = searchLocation || "";
      }

      console.log("User data to save:", userData);

      await setDoc(doc(db, "users", user.uid), userData);
      console.log("User data saved to Firestore");

      await auth.signOut();
      console.log("User logged out - must verify email to login");

      setUser(null);

    } catch (err) {
      console.error("Signup error:", err);
      
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please use a different email.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please use a stronger password.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error. Please check your connection.");
      } else if (err.code === 'permission-denied') {
        setError("Database permission denied. Please contact support.");
      } else {
        setError(`Signup failed: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider) => {
  setIsLoading(true);
  setError("");

  try {
    console.log(`Starting ${provider} signup...`);
    
    let user;
    if (provider === "google") {
      const result = await signInWithGoogle();
      user = result.user || result;
    } else if (provider === "github") {
      const result = await signInWithGithub();
      user = result.user || result;
    }

    // Check if user exists
    if (!user || !user.uid) {
      console.error("Social signup failed - no user/uid:", user);
      throw new Error(`${provider} signup failed - no user returned`);
    }

    console.log("Social signup user:", user.uid);

    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      // EXISTING USER: Continue with normal flow
      const userData = userSnap.data();
      await setDoc(userDocRef, {
        ...userData,
        lastLogin: new Date(),
        updatedAt: new Date(),
        emailVerified: user.emailVerified || true
      }, { merge: true });
      
      if (!userData.profileCompleted) {
        navigate("/complete-profile");
        return;
      }
      
      setUser(userData);
      
      if (!user.emailVerified) {
        navigate("/complete-profile", { state: { email: user.email } });
      } else {
        switch (userData.role) {
          case "admin":
            navigate("/admin");
            break;
          case "employer":
            navigate("/employer");
            break;
          default:
            navigate("/jobseeker");
        }
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
        provider: provider.toLowerCase(),
        emailVerified: user.emailVerified || true
      };
      
      // Save to sessionStorage
      sessionStorage.setItem('tempSocialUser', JSON.stringify(newUserData));
      navigate("/select-role");
      return;
    }

  } catch (err) {
    console.error("Social signup error:", err);
    
    if (err.code === 'auth/account-exists-with-different-credential') {
      const email = err.customData?.email;
      
      if (email) {
        setError(`
          An account already exists with this email (${email}) using a different sign-in method. 
          Please try signing in with your email and password, or use the original sign-in method.
        `);
      } else {
        setError(`
          An account already exists with a different sign-in method. 
          Please try signing in with your email and password instead.
        `);
      }
    } else if (err.code === 'auth/popup-closed-by-user') {
      console.log("Sign-in popup closed by user");
    } else if (err.code === 'auth/popup-blocked') {
      setError("Popup was blocked by your browser. Please allow popups for this site.");
    } else if (err.code === 'auth/unauthorized-domain') {
      setError("This domain is not authorized for social sign-in. Please contact support.");
    } else if (err.code === 'auth/cancelled-popup-request') {
      console.log("Popup request cancelled");
    } else {
      setError(`Social signup failed: ${err.message || "Please check your Firebase configuration"}`);
    }
  } finally {
    setIsLoading(false);
  }
};

  const handleResendVerification = async () => {
    try {
      setError("Please check your spam folder. To resend verification, please try logging in and use the 'Resend Verification' option on the login page.");
    } catch (err) {
      setError("Failed to resend verification email: " + err.message);
    }
  };

  return (
    <div className="signup-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">JobLytics</div>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/jobs">Jobs</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
        <div className="nav-actions">
          <a href="/login" className="login-btn">Login</a>
          <a href="/signup" className="signup-btn">Sign Up</a>
        </div>
      </nav>

      {/* Signup Content */}
      <div className="signup-container">
        {/* Left Side - Professional Image */}
        <div className="signup-left">
          <div className="signup-image-container">
            <div className="image-overlay">
              <div className="overlay-content">
                <h1>Find Your Dream Career</h1>
                <p>Join thousands of professionals who have accelerated their careers with JobLytics</p>
                <div className="stats-container">
                  <div className="stat-item">
                    <div className="stat-number">12,800+</div>
                    <div className="stat-label">Active Jobs</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">2,400+</div>
                    <div className="stat-label">Top Companies</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">45,000+</div>
                    <div className="stat-label">Successful Hires</div>
                  </div>
                </div>
                <div className="testimonial-card">
                  <div className="testimonial-text">"JobLytics helped me find my dream job in just 2 weeks!"</div>
                  <div className="testimonial-author">- Sarah, Product Manager</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="signup-right">
          <div className="signup-form-container">
            <div className="form-header">
              <h2>Create Your Account</h2>
              <p className="signup-subtitle">
                {preselectedJob 
                  ? `Ready to apply for ${preselectedJob} positions?`
                  : "Join our community of professionals"
                }
              </p>
            </div>

            {verificationSent ? (
              <div className="verification-sent">
                <div className="verification-icon">✅</div>
                <h3>Verify Your Email</h3>
                <p>We've sent a verification link to <strong>{formData.email}</strong></p>
                <p>Please check your inbox and click the link to verify your email address.</p>
                <div className="verification-actions">
                  <button 
                    type="button"
                    onClick={handleResendVerification}
                    className="resend-button"
                  >
                    Resend Verification Email
                  </button>
                  <button 
                    type="button"
                    onClick={() => navigate('/login')}
                    className="login-redirect-button"
                  >
                    Go to Login
                  </button>
                </div>
                <p className="verification-note">
                  Once verified, you can log in and access all JobLytics features.
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSignup} className="signup-form">
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name *"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name *"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group password-input-group">
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password *"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    
                    {formData.password && (
                      <div className="password-requirements">
                        <div className="requirement-item">
                          <span className={`requirement-icon ${passwordRequirements.length ? 'met' : 'unmet'}`}>
                            {passwordRequirements.length ? '✅' : '❌'}
                          </span>
                          <span className={`requirement-text ${passwordRequirements.length ? 'met' : 'unmet'}`}>
                            At least 8 characters
                          </span>
                        </div>
                        <div className="requirement-item">
                          <span className={`requirement-icon ${passwordRequirements.uppercase ? 'met' : 'unmet'}`}>
                            {passwordRequirements.uppercase ? '✅' : '❌'}
                          </span>
                          <span className={`requirement-text ${passwordRequirements.uppercase ? 'met' : 'unmet'}`}>
                            One uppercase letter (A-Z)
                          </span>
                        </div>
                        <div className="requirement-item">
                          <span className={`requirement-icon ${passwordRequirements.lowercase ? 'met' : 'unmet'}`}>
                            {passwordRequirements.lowercase ? '✅' : '❌'}
                          </span>
                          <span className={`requirement-text ${passwordRequirements.lowercase ? 'met' : 'unmet'}`}>
                            One lowercase letter (a-z)
                          </span>
                        </div>
                        <div className="requirement-item">
                          <span className={`requirement-icon ${passwordRequirements.number ? 'met' : 'unmet'}`}>
                            {passwordRequirements.number ? '✅' : '❌'}
                          </span>
                          <span className={`requirement-text ${passwordRequirements.number ? 'met' : 'unmet'}`}>
                            One number (0-9)
                          </span>
                        </div>
                        <div className="requirement-item">
                          <span className={`requirement-icon ${passwordRequirements.specialChar ? 'met' : 'unmet'}`}>
                            {passwordRequirements.specialChar ? '✅' : '❌'}
                          </span>
                          <span className={`requirement-text ${passwordRequirements.specialChar ? 'met' : 'unmet'}`}>
                            One special character (!@#$%^&*)
                          </span>
                        </div>
                        <div className="requirement-item">
                          <span className={`requirement-icon ${passwordRequirements.noName ? 'met' : 'unmet'}`}>
                            {passwordRequirements.noName ? '✅' : '❌'}
                          </span>
                          <span className={`requirement-text ${passwordRequirements.noName ? 'met' : 'unmet'}`}>
                            Does not contain your name or email
                          </span>
                        </div>
                      </div>
                    )}

                    {formData.password && (
                      <div className="password-strength-container">
                        <div className="password-strength-bar">
                          <div 
                            className={`password-strength-fill ${passwordStrength.className}`}
                            style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                          ></div>
                        </div>
                        <div className={`password-strength-text ${passwordStrength.className}`}>
                          Password Strength: {passwordStrength.text}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-group password-input-group">
                    <div className="password-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password *"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`form-input ${
                          formData.confirmPassword && !passwordsMatch 
                            ? 'input-error' 
                            : formData.confirmPassword && passwordsMatch 
                            ? 'input-success' 
                            : ''
                        }`}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <div className={`password-match ${
                        passwordsMatch ? 'match-success' : 'match-error'
                      }`}>
                        {passwordsMatch 
                          ? '✓ Passwords match' 
                          : '✗ Passwords do not match'
                        }
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="form-select"
                        required
                      >
                        <option value="">Select Country *</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <input
                        type="tel"
                        name="phoneNumber"
                        placeholder="Phone Number *"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="form-select"
                        required
                      >
                        <option value="">Select Gender *</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="form-group">
                      {/* FIXED: Changed role values from "job_seeker" to "jobseeker" */}
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="form-select"
                        required
                      >
                        <option value="jobseeker">Job Seeker</option>
                        <option value="employer">Employer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  {error && <div className="error-message">{error}</div>}

                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isLoading || !allRequirementsMet}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                <div className="divider">
                  <span className="divider-text">Or continue with</span>
                </div>

                <div className="social-buttons">
                  <button 
                    type="button"
                    onClick={() => handleSocialSignup("google")} 
                    disabled={isLoading}
                    className="social-button google"
                  >
                    <span className="social-icon">G</span>
                    Google
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSocialSignup("github")} 
                    disabled={isLoading}
                    className="social-button github"
                  >
                    <span className="social-icon">G</span>
                    GitHub
                  </button>
                </div>

                <p className="login-link">
                  Already have an account? <a href="/login">Log in</a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;