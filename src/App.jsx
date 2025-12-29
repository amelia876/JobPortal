import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import Contact from "./pages/Contact";
import SelectRole from "./pages/SelectRole";
import PostJobPage from "./pages/PostJobPage";
import EmployerJobList from "./pages/EmployerJobList";
import AboutUs from "./pages/AboutUs";
import ScheduleInterviewPage from "./pages/ScheduleInterviewPage";
import ProfilePageSeeker from "./pages/ProfilePageSeeker";
import Jobs from "./pages/Jobs";
import Apply from "./pages/Apply";
import InternetSpeedTest from "./pages/InternetSpeedTest";
import PaymentGateway from "./pages/PaymentGateway";
import ITINSupport from "./pages/ITINSupport";
import TaxGuidance from "./pages/TaxGuidance";
import Community from "./pages/Community";
import Applications from "./pages/Applications";
import CompleteProfile from "./pages/CompleteProfile";
import SavedJobs from "./pages/SavedJobs";




function App() {
  // Initialize user from localStorage; undefined = loading state
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : undefined;
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
      return undefined;
    }
  });

  // Sync user state with localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        console.log("User saved to localStorage:", user.uid);
      } else if (user === null) {
        localStorage.removeItem("user");
        console.log("User removed from localStorage");
      }
    } catch (error) {
      console.error("Error syncing user to localStorage:", error);
    }
  }, [user]);

  // PrivateRoute handles loading state before redirecting
  const PrivateRoute = ({ children }) => {
    if (user === undefined) {
      // User not loaded yet
      return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
    }
    return user ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home user={user} setUser={setUser} />} />
        <Route path="/home" element={<Home user={user} setUser={setUser} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/select-role" element={<SelectRole setUser={setUser} />} />
        <Route path="/internet-speed-test" element={<InternetSpeedTest />} />
        
        

        {/* Protected routes */}
        <Route path="/postjob" element={<PrivateRoute><PostJobPage user={user} /></PrivateRoute>} />
        <Route path="/employer/jobs" element={<PrivateRoute><EmployerJobList user={user} /></PrivateRoute>} />
        <Route path="/schedule-interview" element={<PrivateRoute><ScheduleInterviewPage user={user} /></PrivateRoute>} />
        <Route path="/jobseeker/profile" element={<PrivateRoute><ProfilePageSeeker user={user} setUser={setUser} /></PrivateRoute>} />
        <Route path="/job-search" element={<PrivateRoute><Jobs user={user} /></PrivateRoute>} />
        <Route path="/apply" element={<PrivateRoute><Apply user={user} /></PrivateRoute>} />
        <Route path="/complete-profile" element={<PrivateRoute><CompleteProfile /></PrivateRoute>} />
        
        {/* NEW PAGES - Make sure these accept user prop */}
        <Route path="/payment-gateway" element={<PrivateRoute><PaymentGateway user={user} /></PrivateRoute>} />
        <Route path="/itin-support" element={<PrivateRoute><ITINSupport user={user} /></PrivateRoute>} />
        <Route path="/tax-guidance" element={<PrivateRoute><TaxGuidance user={user} /></PrivateRoute>} />
        <Route path="/community" element={<PrivateRoute><Community user={user} /></PrivateRoute>} />
        <Route path="/job-seeker/applications" element={<PrivateRoute><Applications user={user} /></PrivateRoute>} />
        <Route path="/job-seeker/saved-jobs" element={<PrivateRoute><SavedJobs user={user} /></PrivateRoute>} />
        
       

        

        {/* Role-based dashboards */}
        <Route path="/admin" element={<PrivateRoute><AdminDashboard user={user} setUser={setUser} /></PrivateRoute>} />
        <Route path="/employer" element={<PrivateRoute><EmployerDashboard user={user} setUser={setUser} /></PrivateRoute>} />
        <Route path="/jobseeker" element={<PrivateRoute><JobSeekerDashboard user={user} setUser={setUser} /></PrivateRoute>} />

        {/* Auto redirect after login */}
        <Route path="/redirect" element={<RoleBasedRedirect user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;