// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

// const PrivateRoute = ({ children }) => {
//   const { currentUser } = useAuth();
  
//   return currentUser ? children : <Navigate to="/login" />;
// };

// export default PrivateRoute;

// src/components/PrivateRoute.jsx
const PrivateRoute = ({ children }) => {
  // 임시로 항상 통과하도록
  return children;
};

export default PrivateRoute;