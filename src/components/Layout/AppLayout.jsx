import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';

const AppLayout = () => {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
