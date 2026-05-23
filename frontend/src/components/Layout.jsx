import React from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from './Navbar';

const Layout = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <Navbar />
      <main style={{ width: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
