import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AuthProvider, AuthContext } from './AuthContext';
import api from '../services/api';

vi.mock('../services/api');

const TestConsumer = () => (
  <AuthContext.Consumer>
    {(value) => (
      <div>
        <div data-testid="loading">{String(value.loading)}</div>
        <div data-testid="user">{value.user ? JSON.stringify(value.user) : 'null'}</div>
        <button data-testid="login-btn" onClick={() => value.login('test@test.com', 'pass')}>
          Login
        </button>
        <button data-testid="logout-btn" onClick={() => value.logout()}>
          Logout
        </button>
      </div>
    )}
  </AuthContext.Consumer>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Estado inicial', () => {
    it('debe mostrar hijos cuando loading completa', async () => {
      render(
        <AuthProvider>
          <div data-testid="child">Child Content</div>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('child')).toBeInTheDocument();
      });
    });
  });

  describe('Restaurar sesion', () => {
    it('debe restaurar usuario desde localStorage al montar', async () => {
      const storedUser = { id: 1, email: 'test@test.com', rol: 'admin' };
      localStorage.setItem('medicloud_token', 'token123');
      localStorage.setItem('medicloud_user', JSON.stringify(storedUser));

      api.post.mockResolvedValue({ data: { data: { token: 'abc', user: { id: 1, email: 'test@test.com', rol: 'admin' } } } });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        const userText = screen.getByTestId('user').textContent;
        expect(userText).toContain('test@test.com');
        expect(userText).toContain('admin');
      });
    });

    it('debe mantener usuario null si no hay token en localStorage', async () => {
      localStorage.clear();

      api.post.mockResolvedValue({ data: { data: { token: 'abc', user: { id: 1 } } } });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('null');
      });
    });
  });

  describe('Login', () => {
    it('debe llamar a la API de login con credenciales correctas', async () => {
      api.post.mockResolvedValue({
        data: { data: { token: 'token123', user: { id: 1, email: 'test@test.com', rol: 'admin' } } },
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@test.com',
        password: 'pass',
      });
    });

    it('debe almacenar token y usuario en localStorage al hacer login', async () => {
      api.post.mockResolvedValue({
        data: { data: { token: 'token123', user: { id: 1, email: 'test@test.com', rol: 'admin' } } },
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('medicloud_token', 'token123');
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'medicloud_user',
          JSON.stringify({ id: 1, email: 'test@test.com', rol: 'admin' })
        );
      });
    });

    it('debe retornar success true en login exitoso', async () => {
      api.post.mockResolvedValue({
        data: { data: { token: 'token123', user: { id: 1 } } },
      });

      let loginResult;
      const CaptureLogin = () => (
        <AuthContext.Consumer>
          {(value) => (
            <button
              data-testid="login-btn"
              onClick={async () => {
                loginResult = await value.login('test@test.com', 'pass');
              }}
            >
              Login
            </button>
          )}
        </AuthContext.Consumer>
      );

      render(
        <AuthProvider>
          <CaptureLogin />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-btn')).toBeInTheDocument();
      });

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(loginResult).toEqual({ success: true });
      });
    });

    it('debe retornar mensaje de error cuando login falla', async () => {
      api.post.mockRejectedValue({
        response: { data: { message: 'Credenciales invalidas' } },
      });

      let loginResult;
      const CaptureLogin = () => (
        <AuthContext.Consumer>
          {(value) => (
            <button
              data-testid="login-btn"
              onClick={async () => {
                loginResult = await value.login('test@test.com', 'wrong');
              }}
            >
              Login
            </button>
          )}
        </AuthContext.Consumer>
      );

      render(
        <AuthProvider>
          <CaptureLogin />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-btn')).toBeInTheDocument();
      });

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(loginResult).toEqual({ success: false, message: 'Credenciales invalidas' });
      });
    });

    it('debe usar mensaje por defecto si no hay mensaje de error', async () => {
      api.post.mockRejectedValue(new Error('Network error'));

      let loginResult;
      const CaptureLogin = () => (
        <AuthContext.Consumer>
          {(value) => (
            <button
              data-testid="login-btn"
              onClick={async () => {
                loginResult = await value.login('test@test.com', 'wrong');
              }}
            >
              Login
            </button>
          )}
        </AuthContext.Consumer>
      );

      render(
        <AuthProvider>
          <CaptureLogin />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-btn')).toBeInTheDocument();
      });

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(loginResult).toEqual({ success: false, message: 'Error al iniciar sesión' });
      });
    });
  });

  describe('Logout', () => {
    it('debe limpiar localStorage al hacer logout', async () => {
      localStorage.setItem('medicloud_token', 'token123');
      localStorage.setItem('medicloud_user', JSON.stringify({ id: 1 }));

      api.post.mockResolvedValue({ data: { data: { token: 'abc', user: { id: 1 } } } });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await act(async () => {
        screen.getByTestId('logout-btn').click();
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith('medicloud_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('medicloud_user');
    });

    it('debe establecer usuario como null al hacer logout', async () => {
      localStorage.setItem('medicloud_token', 'token123');
      localStorage.setItem('medicloud_user', JSON.stringify({ id: 1, email: 'test@test.com' }));

      api.post.mockResolvedValue({ data: { data: { token: 'abc', user: { id: 1 } } } });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await act(async () => {
        screen.getByTestId('logout-btn').click();
      });

      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });
});
