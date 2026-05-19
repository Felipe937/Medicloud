import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, UserRound, Calendar, FileText, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['admin', 'medico', 'recepcion'] },
    { name: 'Pacientes', path: '/pacientes', icon: <Users size={20} />, roles: ['admin', 'medico', 'recepcion'] },
    { name: 'Médicos', path: '/medicos', icon: <UserRound size={20} />, roles: ['admin', 'recepcion'] },
    { name: 'Citas', path: '/citas', icon: <Calendar size={20} />, roles: ['admin', 'medico', 'recepcion'] },
    { name: 'Historias Clínicas', path: '/historias', icon: <FileText size={20} />, roles: ['admin', 'medico'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.rol));

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <h2 style={{ color: 'var(--primary)' }}>MediCloud</h2>
      </div>
      
      <div style={styles.userInfo}>
        <p style={styles.userName}>{user?.nombre}</p>
        <span style={styles.userRole}>{user?.rol}</span>
      </div>

      <nav style={styles.nav}>
        {filteredNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div style={styles.footer}>
        <button onClick={logout} style={{...styles.navItem, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)'}}>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--surface)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
  },
  logo: {
    padding: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  userInfo: {
    padding: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  userName: {
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  userRole: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  nav: {
    flex: 1,
    padding: '1rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1.5rem',
    textDecoration: 'none',
    color: 'var(--text-muted)',
    fontWeight: '500',
    transition: 'var(--transition)',
  },
  navItemActive: {
    color: 'var(--primary)',
    backgroundColor: 'var(--primary-light)',
    borderRight: '3px solid var(--primary)',
  },
  footer: {
    padding: '1rem',
    borderTop: '1px solid var(--border-color)',
  }
};

export default Sidebar;
