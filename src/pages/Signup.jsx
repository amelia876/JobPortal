// Signup.jsx
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
