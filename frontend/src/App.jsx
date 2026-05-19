import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// View placeholders (We will create these next)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import Medicos from './pages/Medicos';
import Citas from './pages/Citas';
import Historias from './pages/Historias';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route element={<ProtectedRoute allowedRoles={['admin', 'medico', 'recepcion']} />}>
              <Route path="pacientes" element={<Pacientes />} />
              <Route path="citas" element={<Citas />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['admin', 'recepcion']} />}>
              <Route path="medicos" element={<Medicos />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['admin', 'medico']} />}>
              <Route path="historias" element={<Historias />} />
            </Route>
          </Route>
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
