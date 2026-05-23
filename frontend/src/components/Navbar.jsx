import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  Users
} from 'lucide-react';
import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Pacientes', path: '/pacientes', icon: Users },
  { name: 'Medicos', path: '/medicos', icon: Stethoscope },
  { name: 'Citas', path: '/citas', icon: CalendarDays }
];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header style={styles.navbar}>
      <div style={styles.brand}>
        <span style={styles.brandMark}>M</span>
        <div>
          <strong style={styles.brandName}>MediCloud</strong>
          <span style={styles.userRole}>{user?.rol || 'usuario'}</span>
        </div>
      </div>

      <nav style={styles.navLinks} aria-label="Navegacion principal">
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {})
            })}
          >
            <Icon size={18} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      <button type="button" onClick={handleLogout} style={styles.logoutButton}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </header>
  );
};

const styles = {
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    minHeight: '76px',
    background: 'rgba(255, 255, 255, 0.94)',
    borderBottom: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
    backdropFilter: 'blur(14px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
    padding: '0.875rem 2rem'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    minWidth: '190px'
  },
  brandMark: {
    width: '42px',
    height: '42px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--primary)',
    color: '#ffffff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '1.125rem',
    boxShadow: 'var(--shadow-md)'
  },
  brandName: {
    display: 'block',
    color: 'var(--text-main)',
    fontSize: '1rem',
    lineHeight: 1.1
  },
  userRole: {
    display: 'block',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    lineHeight: 1.4,
    textTransform: 'capitalize'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 1 360px',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  navLink: {
    minHeight: '40px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 0.875rem',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 600,
    transition: 'var(--transition)'
  },
  navLinkActive: {
    background: 'var(--primary-light)',
    color: 'var(--primary-dark)'
  },
  logoutButton: {
    minHeight: '40px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 0.875rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #fecaca',
    background: '#fff5f5',
    color: 'var(--danger)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: 700,
    transition: 'var(--transition)'
  }
};

export default Navbar;
