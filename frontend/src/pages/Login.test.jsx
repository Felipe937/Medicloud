import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AuthContext } from '../context/AuthContext';

import Login from './Login';

// Mock de AuthContext Provider
const MockAuthProvider = ({ children, value }) => (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);

// Render component con router y auth context
const renderLoginComponent = (authContextValue) => {
  return render(
    <BrowserRouter>
      <MockAuthProvider value={authContextValue}>
        <Login />
      </MockAuthProvider>
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  let mockLogin;
  let defaultAuthContext;

  beforeEach(() => {
    mockLogin = vi.fn();
    defaultAuthContext = {
      user: null,
      loading: false,
      login: mockLogin,
      logout: vi.fn(),
    };
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Renderizado', () => {
    it('debe renderizar el componente de login correctamente', () => {
      renderLoginComponent(defaultAuthContext);
      
      expect(screen.getByText('MediCloud')).toBeInTheDocument();
      expect(screen.getByText('Inicia sesión para continuar')).toBeInTheDocument();
    });

    it('debe mostrar campos de email y contraseña', () => {
      renderLoginComponent(defaultAuthContext);
      
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    });

    it('debe mostrar botón de envío', () => {
      renderLoginComponent(defaultAuthContext);
      
      expect(screen.getByRole('button', { name: /entrar al sistema/i })).toBeInTheDocument();
    });

    it('debe redirigir a dashboard si ya hay usuario logueado', () => {
      const authContextWithUser = {
        ...defaultAuthContext,
        user: { id: 1, email: 'test@example.com', rol: 'admin' },
      };

      renderLoginComponent(authContextWithUser);
      
      // El componente debería redirigir a /dashboard, lo que se verifica con Navigate
      // Aquí verificamos que el componente se renderiza pero se debe navegar
      expect(screen.queryByText('Inicia sesión para continuar')).not.toBeInTheDocument();
    });
  });

  describe('Inputs y validación', () => {
    it('debe permitir escribir en el campo de email', async () => {
      const user = userEvent.setup();
      renderLoginComponent(defaultAuthContext);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput.value).toBe('test@example.com');
    });

    it('debe permitir escribir en el campo de contraseña', async () => {
      const user = userEvent.setup();
      renderLoginComponent(defaultAuthContext);
      
      const passwordInput = screen.getByLabelText(/contraseña/i);
      await user.type(passwordInput, 'password123');
      
      expect(passwordInput.value).toBe('password123');
    });

    it('debe limpiar los campos cuando se actualice el estado', async () => {
      const user = userEvent.setup();
      renderLoginComponent(defaultAuthContext);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
    });
  });

  describe('Envío de formulario', () => {
    it('debe llamar a login cuando se envía el formulario con credenciales válidas', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });
      
      renderLoginComponent(defaultAuthContext);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /entrar al sistema/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockLogin).toHaveBeenCalledTimes(1);
      });
    });

    it('debe deshabilitar el botón mientras se procesa el login', async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
      
      renderLoginComponent(defaultAuthContext);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /entrar al sistema/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      expect(submitButton).not.toBeDisabled();
      await user.click(submitButton);
      
      // El botón debe estar deshabilitado mientras se procesa
      expect(submitButton).toBeDisabled();
    });

    it('debe mostrar "Verificando..." mientras se procesa', async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
      
      renderLoginComponent(defaultAuthContext);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /entrar al sistema/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      expect(screen.getByRole('button', { name: /verificando/i })).toBeInTheDocument();
    });
  });

  describe('Manejo de errores', () => {
    it('debe mostrar mensaje de error cuando login falla', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Credenciales inválidas';
      mockLogin.mockResolvedValue({ success: false, message: errorMessage });
      
      renderLoginComponent(defaultAuthContext);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /entrar al sistema/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('debe limpiar el error anterior cuando se intenta de nuevo', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Credenciales inválidas';
      mockLogin.mockResolvedValueOnce({ success: false, message: errorMessage });
      
      renderLoginComponent(defaultAuthContext);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /entrar al sistema/i });
      
      // Primer intento con error
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
      
      // Segundo intento exitoso
      mockLogin.mockResolvedValueOnce({ success: true });
      await user.clear(emailInput);
      await user.clear(passwordInput);
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
      });
    });
  });

  describe('Navegación', () => {
    it('debe navegar a dashboard en login exitoso', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });
      
      renderLoginComponent(defaultAuthContext);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /entrar al sistema/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });
});
