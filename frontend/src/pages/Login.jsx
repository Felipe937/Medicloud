import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import { Activity } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <Activity color="var(--primary)" size={40} />
          </div>
          <h1 style={styles.title}>MediCloud</h1>
          <p style={styles.subtitle}>Inicia sesión para continuar</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <FormInput
            label="Correo Electrónico"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="usuario@medicloud.com"
          />
          
          <FormInput
            label="Contraseña"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Entrar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-color)',
    padding: '1rem',
  },
  card: {
    backgroundColor: 'var(--surface)',
    padding: '2.5rem',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    width: '100%',
    maxWidth: '400px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    backgroundColor: 'var(--primary-light)',
    borderRadius: '50%',
    marginBottom: '1rem',
  },
  title: {
    color: 'var(--text-main)',
    fontSize: '1.75rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  submitBtn: {
    marginTop: '1.5rem',
    padding: '0.75rem',
    fontSize: '1rem',
  },
  errorAlert: {
    backgroundColor: 'var(--danger)',
    color: 'white',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    textAlign: 'center',
  }
};

export default Login;
