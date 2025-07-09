import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutPage() {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem('jwt');
    navigate('/login', { replace: true });
  }, [navigate]);
  return null;
}

export default LogoutPage; 