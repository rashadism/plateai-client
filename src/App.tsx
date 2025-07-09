import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import RequireAuth from './RequireAuth';
import LoginPage from './LoginPage.tsx';
import LogoutPage from './LogoutPage.tsx';
import DashboardPage from './DashboardPage.tsx';
import RegisterPage from './RegisterPage.tsx';

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const jwt = localStorage.getItem('jwt');
  if (jwt) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
