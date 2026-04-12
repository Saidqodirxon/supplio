import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdmin from './pages/SuperAdmin';
import Login from './pages/Login';
import { NotFound } from './pages/Error';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useEffect } from 'react';
import Layout from './components/Layout';

function ProtectedRoute({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) {
  const { token, user, getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();

  if (!token) return <Navigate to="/login" replace />;
  if (!user || !allowedRoles.includes(effectiveRole || "")) return <Navigate to="/not-found" replace />;

  return <>{children}</>;
}

export default function App() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdmin />} />
      </Route>
      <Route path="/not-found" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
