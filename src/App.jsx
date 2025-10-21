import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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





function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/selectrole" element={<SelectRole />} />
        <Route path="/postjob" element={<PostJobPage />} />
        <Route path="/employer/jobs" element={<EmployerJobList />} />
        <Route path="/home" element={<Home />} />
        <Route path="AboutUs" element={<AboutUs />} />
        <Route path="/schedule-interview" element={<ScheduleInterviewPage />} />

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
