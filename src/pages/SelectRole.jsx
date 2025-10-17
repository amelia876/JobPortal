import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

const SelectRole = () => {
  const [role, setRole] = useState("job_seeker");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the currently logged-in user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("User not signed in. Please sign in again.");
      navigate("/signup");
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handleRoleSelect = async () => {
    if (!user) return;

    if (!name || !country || !phone) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      // Save role, name, country, phone, and email to Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
          role: role,
          fullName: name,
          country: country,
          phone: phone,
        },
        { merge: true }
      );

      console.log("✅ User info saved:", { role, name, country, phone });

      // Navigate to the correct dashboard
      if (role === "job_seeker") navigate("/jobseeker");
      else if (role === "employer") navigate("/employer");
      else navigate("/admin");
    } catch (error) {
      console.error("❌ Error saving user info:", error);
      alert("Error saving user info. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Wait until user is loaded

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Welcome, {user.email} 👋</h2>
      <p>Please complete your profile and select your role to continue:</p>

      <div style={{ margin: "10px 0" }}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "10px", fontSize: "16px", width: "250px" }}
        />
      </div>

      <div style={{ margin: "10px 0" }}>
        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={{ padding: "10px", fontSize: "16px", width: "250px" }}
        />
      </div>

      <div style={{ margin: "10px 0" }}>
        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: "10px", fontSize: "16px", width: "250px" }}
        />
      </div>

      <div style={{ margin: "10px 0" }}>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ padding: "10px", fontSize: "16px", width: "270px" }}
        >
          <option value="job_seeker">Job Seeker</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button
        onClick={handleRoleSelect}
        disabled={loading}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
        }}
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
};

export default SelectRole;
