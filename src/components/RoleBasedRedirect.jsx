import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const RoleBasedRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const role = docSnap.data().role;
          if (role === "admin") navigate("/admin");
          else if (role === "employer") navigate("/employer");
          else if (role === "job_seeker") navigate("/jobseeker");
        } else {
          navigate("/signup");
        }
      } else {
        navigate("/login");
      }
    };

    checkUserRole();
  }, [navigate]);

  return null;
};

export default RoleBasedRedirect;
