import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import Contact from "./pages/Contact";
import About from "./pages/About";
import SelectRole from "./pages/SelectRole";
import PostJobPage from "./pages/PostJobPage";





function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/selectrole" element={<SelectRole />} />
        <Route path="/postjob" element={<PostJobPage />} />

        {/* Role-based dashboards */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/employer" element={<EmployerDashboard />} />
        <Route path="/jobseeker" element={<JobSeekerDashboard />} />

        {/* Auto redirect after login */}
        <Route path="/redirect" element={<RoleBasedRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;
