import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase/firebase';

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const user = auth.currentUser;
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if email verified
  if (!user.emailVerified) {
    return <Navigate to="/verify-pending" state={{ email: user.email }} replace />;
  }
  
  // Check if profile completed
  // You'd check Firestore here
  
  return children;
};

export default RequireAuth;