import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { MyTickets } from './pages/MyTickets';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { NewTicket } from './pages/NewTicket';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center bg-background">Carregando...</div>;
  if (!session) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

function RoleRoute({ children, allowed, fallback }: { children: React.ReactNode, allowed: string[], fallback: string }) {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (!profile || !allowed.includes(profile.role)) return <Navigate to={fallback} replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={
              <RoleRoute allowed={['admin', 'tecnico']} fallback="/chamados">
                <Dashboard />
              </RoleRoute>
            } />
            <Route path="chamados" element={<MyTickets />} />
            <Route path="relatorios" element={
              <RoleRoute allowed={['admin', 'tecnico']} fallback="/chamados">
                <Reports />
              </RoleRoute>
            } />
            <Route path="configuracoes" element={<Settings />} />
            <Route path="novo-chamado" element={<NewTicket />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
