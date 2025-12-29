import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import "./SelectRole.css"; // You'll need to create this CSS

const SelectRole = ({ setUser }) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [socialUserData, setSocialUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get social user data from sessionStorage
    const tempSocialUser = sessionStorage.getItem('tempSocialUser');
    if (tempSocialUser) {
      try {
        const parsedData = JSON.parse(tempSocialUser);
        setSocialUserData(parsedData);
        console.log("Social user data loaded:", parsedData);
      } catch (error) {
        console.error("Error parsing social user data:", error);
        navigate("/login"); // Go back to login if error
      }
    } else {
      // No social user data found, go back to login
      navigate("/login");
    }
  }, [navigate]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    if (!socialUserData) {
      setError("No user data found. Please try logging in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Creating user profile for social login with role:", selectedRole);
      
      // Create user data for Firestore
      const userData = {
        uid: socialUserData.uid,
        email: socialUserData.email,
        firstName: socialUserData.displayName?.split(' ')[0] || "",
        lastName: socialUserData.displayName?.split(' ').slice(1).join(' ') || "",
        role: selectedRole,
        emailVerified: true, // Social providers verify email
        profileCompleted: false, // Needs to complete profile
        isFirstTimeUser: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        signInMethods: [socialUserData.provider],
        photoURL: socialUserData.photoURL || ""
      };

      // Save to Firestore
      await setDoc(doc(db, "users", socialUserData.uid), userData);
      console.log("User data saved to Firestore with role:", selectedRole);

      // Clean up sessionStorage
      sessionStorage.removeItem('tempSocialUser');

      // Set user in app state
      const user = {
        uid: socialUserData.uid,
        email: socialUserData.email,
        role: selectedRole,
        name: socialUserData.displayName || "",
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileCompleted: false,
        isFirstTimeUser: true,
        emailVerified: true,
        isSocialLogin: true,
      };

      setUser(user);
      
      // Redirect to complete profile
      navigate("/complete-profile");

    } catch (err) {
      console.error("Error saving role:", err);
      setError(`Failed to save role: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!socialUserData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="select-role-page">
      <div className="select-role-container">
        <div className="select-role-header">
          <h1>Choose Your Account Type</h1>
          <p className="welcome-message">
            Welcome, {socialUserData.displayName || socialUserData.email}! 
            Please select how you'd like to use Joblytics.
          </p>
        </div>

        <div className="role-options">
          <div 
            className={`role-card ${selectedRole === "jobseeker" ? "selected" : ""}`}
            onClick={() => handleRoleSelect("jobseeker")}
          >
            <div className="role-icon">👤</div>
            <h3>Job Seeker</h3>
            <p className="role-description">
              Looking for your next career opportunity? Browse jobs, apply 
              with one click, and get matched with top companies.
            </p>
            <ul className="role-features">
              <li>✓ Browse thousands of jobs</li>
              <li>✓ One-click applications</li>
              <li>✓ Get job recommendations</li>
              <li>✓ Track your applications</li>
            </ul>
            <div className="role-tag">Recommended for individuals</div>
          </div>

          <div 
            className={`role-card ${selectedRole === "employer" ? "selected" : ""}`}
            onClick={() => handleRoleSelect("employer")}
          >
            <div className="role-icon">🏢</div>
            <h3>Employer</h3>
            <p className="role-description">
              Hiring talent for your company? Post jobs, manage applicants, 
              and find the perfect candidates.
            </p>
            <ul className="role-features">
              <li>✓ Post unlimited job listings</li>
              <li>✓ Manage applicant pipeline</li>
              <li>✓ Access candidate database</li>
              <li>✓ Advanced hiring tools</li>
            </ul>
            <div className="role-tag">For companies & recruiters</div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="role-actions">
          <button 
            className="btn-back"
            onClick={() => {
              sessionStorage.removeItem('tempSocialUser');
              navigate("/login");
            }}
            disabled={loading}
          >
            Back to Login
          </button>
          
          <button 
            className="btn-continue"
            onClick={handleSubmit}
            disabled={!selectedRole || loading}
          >
            {loading ? "Processing..." : "Continue to Complete Profile"}
          </button>
        </div>

        <div className="role-note">
          <p>💡 <strong>Note:</strong> You can always update your role later in account settings, 
          but some features may require re-verification.</p>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;