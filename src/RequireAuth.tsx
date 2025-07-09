import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

function RequireAuth({ children }: { children: ReactNode }) {
  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default RequireAuth; 