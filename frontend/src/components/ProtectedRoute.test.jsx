import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AuthContext } from '../context/AuthContext';

import ProtectedRoute from './ProtectedRoute';

// Componente dummy para las rutas protegidas
const DummyComponent = () => <div>Contenido Protegido</div>;
const LoginPage = () => <div>Página de Login</div>;
const DashboardPage = () => <div>Dashboard</div>;

// Render component con router y auth context
const renderWithRouter = (authContextValue, initialRoute = '/') => {
  window.history.pushState({}, 'Test page', initialRoute);
  
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authContextValue}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route element={<ProtectedRoute allowedRoles={['admin', 'medico', 'paciente']} />}>
            <Route path="/protected" element={<DummyComponent />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin-only" element={<div>Admin Only</div>} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('ProtectedRoute Component', () => {
  let defaultAuthContext;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Renderizado', () => {
    it('debe mostrar indicador de carga cuando loading es true', () => {
      defaultAuthContext = {
        user: null,
        loading: true,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderWithRouter(defaultAuthContext, '/protected');
      
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('debe renderizar el contenido protegido cuando usuario está autenticado', () => {
      defaultAuthContext = {
        user: { id: 1, email: 'test@example.com', rol: 'medico' },
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderWithRouter(defaultAuthContext, '/protected');
      
      // Debe renderizar Outlet que contiene DummyComponent
      expect(screen.getByText('Contenido Protegido')).toBeInTheDocument();
    });
  });

  describe('Autenticación', () => {
    it('debe redirigir a login cuando no hay usuario autenticado', () => {
      defaultAuthContext = {
        user: null,
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderWithRouter(defaultAuthContext, '/protected');
      
      // Cuando redirige a login, debería mostrarse la página de login
      expect(screen.getByText('Página de Login')).toBeInTheDocument();
    });

    it('debe redirigir a login cuando usuario es null', () => {
      defaultAuthContext = {
        user: null,
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderWithRouter(defaultAuthContext, '/protected');
      
      expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument();
      expect(screen.getByText('Página de Login')).toBeInTheDocument();
    });

    it('debe permitir acceso sin allowedRoles para cualquier usuario autenticado', () => {
      const renderNoRoles = (authContextValue, initialRoute = '/') => {
        window.history.pushState({}, 'Test page', initialRoute);
        return render(
          <BrowserRouter>
            <AuthContext.Provider value={authContextValue}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/any-user" element={<div>Acceso Libre</div>} />
                </Route>
              </Routes>
            </AuthContext.Provider>
          </BrowserRouter>
        );
      };

      defaultAuthContext = {
        user: { id: 1, email: 'test@example.com', rol: 'recepcion' },
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderNoRoles(defaultAuthContext, '/any-user');
      
      expect(screen.getByText('Acceso Libre')).toBeInTheDocument();
    });

    it('debe redirigir a login si no hay usuario incluso sin allowedRoles', () => {
      const renderNoRoles = (authContextValue, initialRoute = '/') => {
        window.history.pushState({}, 'Test page', initialRoute);
        return render(
          <BrowserRouter>
            <AuthContext.Provider value={authContextValue}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/any-user" element={<div>Acceso Libre</div>} />
                </Route>
              </Routes>
            </AuthContext.Provider>
          </BrowserRouter>
        );
      };

      defaultAuthContext = {
        user: null,
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderNoRoles(defaultAuthContext, '/any-user');
      
      expect(screen.getByText('Página de Login')).toBeInTheDocument();
    });
  });

  describe('Control de acceso por rol', () => {
    it('debe permitir acceso a usuario con rol autorizado', () => {
      defaultAuthContext = {
        user: { id: 1, email: 'test@example.com', rol: 'admin' },
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderWithRouter(defaultAuthContext, '/admin-only');
      
      expect(screen.getByText('Admin Only')).toBeInTheDocument();
    });

    it('debe redirigir a dashboard si usuario tiene rol no autorizado', () => {
      defaultAuthContext = {
        user: { id: 1, email: 'test@example.com', rol: 'paciente' },
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderWithRouter(defaultAuthContext, '/admin-only');
      
      // Debe redirigir a /dashboard
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
    });

    it('debe permitir múltiples roles autorizados', () => {
      defaultAuthContext = {
        user: { id: 1, email: 'test@example.com', rol: 'medico' },
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderWithRouter(defaultAuthContext, '/protected');
      
      expect(screen.getByText('Contenido Protegido')).toBeInTheDocument();
    });

    it('debe redirigir si allowedRoles no incluye el rol del usuario', () => {
      defaultAuthContext = {
        user: { id: 1, email: 'test@example.com', rol: 'guest' },
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderWithRouter(defaultAuthContext, '/admin-only');
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
    });

    it('debe bloquear acceso con allowedRoles vacio aunque usuario este autenticado', () => {
      const renderEmptyRoles = (authContextValue, initialRoute = '/') => {
        window.history.pushState({}, 'Test page', initialRoute);
        return render(
          <BrowserRouter>
            <AuthContext.Provider value={authContextValue}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route element={<ProtectedRoute allowedRoles={[]} />}>
                  <Route path="/empty-roles" element={<div>No deberia verse</div>} />
                </Route>
              </Routes>
            </AuthContext.Provider>
          </BrowserRouter>
        );
      };

      defaultAuthContext = {
        user: { id: 1, email: 'test@example.com', rol: 'admin' },
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderEmptyRoles(defaultAuthContext, '/empty-roles');
      
      // Admin no esta en la lista vacia, debe redirigir a dashboard
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('No deberia verse')).not.toBeInTheDocument();
    });
  });

  describe('Estados de carga', () => {
    it('debe mostrar "Cargando..." mientras se verifica la autenticación', () => {
      defaultAuthContext = {
        user: null,
        loading: true,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderWithRouter(defaultAuthContext, '/protected');
      
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('debe transicionar de cargando a no autenticado', () => {
      defaultAuthContext = {
        user: null,
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderWithRouter(defaultAuthContext, '/protected');
      
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      expect(screen.getByText('Página de Login')).toBeInTheDocument();
    });
  });

  describe('Navegación', () => {
    it('debe permitir navegar a ruta protegida con usuario autenticado', () => {
      defaultAuthContext = {
        user: { id: 1, email: 'test@example.com', rol: 'medico' },
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderWithRouter(defaultAuthContext, '/protected');
      
      expect(screen.getByText('Contenido Protegido')).toBeInTheDocument();
    });

    it('debe usar replace cuando redirige a login', () => {
      defaultAuthContext = {
        user: null,
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderWithRouter(defaultAuthContext, '/protected');
      
      // La redirección con replace no deja el /protected en el historial
      expect(screen.getByText('Página de Login')).toBeInTheDocument();
    });

    it('debe redirigir a dashboard con replace cuando rol no está autorizado', () => {
      defaultAuthContext = {
        user: { id: 1, email: 'test@example.com', rol: 'paciente' },
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      };

      renderWithRouter(defaultAuthContext, '/admin-only');
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});
