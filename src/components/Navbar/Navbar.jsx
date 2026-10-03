import React, { useState, useEffect } from 'react';
import {
  Home,
  Bookmark,
  Bell,
  User,
  LogOut,
  Lock,
  Camera,
  Layers,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../api';
import ChangePasswordModal from '../Modals/ChangePasswordModal';
import UploadPhotoModal from '../Modals/UploadPhotoModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const navigate = useNavigate();

  // Fetch unread notification count
  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await notificationsApi.getUnreadCount();
        if (isMounted) {
          const count = res.data?.unreadCount ?? res.data?.count ?? 0;
          setUnreadCount(count);
        }
      } catch (err) {
        // quiet error
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 45000); // refresh every 45s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    setShowUserDropdown(false);
    logout();
  };

  return (
    <>
      <header className="main-navbar">
        <div className="navbar-container">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo">
            <div className="brand-icon-wrapper">
              <Layers size={22} className="brand-icon" />
            </div>
            <span className="brand-text">Pulse</span>
            <span className="brand-pill">Hub</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="nav-links-desktop">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Home size={19} />
              <span>Feed</span>
            </NavLink>

            <NavLink to="/bookmarks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Bookmark size={19} />
              <span>Bookmarks</span>
            </NavLink>

            <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <div className="nav-icon-badge-wrapper">
                <Bell size={19} />
                {unreadCount > 0 && <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </div>
              <span>Alerts</span>
            </NavLink>

            <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <User size={19} />
              <span>Profile</span>
            </NavLink>
          </nav>

          {/* User Profile Dropdown Button */}
          <div className="navbar-user-section">
            <div className="user-dropdown-container">
              <button
                type="button"
                className="user-profile-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                aria-label="User menu"
              >
                <img
                  src={user?.photo || 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'}
                  alt={user?.name}
                  className="avatar avatar-sm avatar-ring"
                />
                <span className="user-display-first-name">{user?.name?.split(' ')[0]}</span>
              </button>

              {showUserDropdown && (
                <div className="user-dropdown-menu animate-fade-in" onClick={() => setShowUserDropdown(false)}>
                  <div className="dropdown-user-header">
                    <strong>{user?.name}</strong>
                    <span className="text-muted text-xs">@{user?.username}</span>
                  </div>

                  <div className="dropdown-divider" />

                  <Link to="/profile" className="dropdown-item">
                    <User size={16} /> My Profile
                  </Link>

                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => setShowPhotoModal(true)}
                  >
                    <Camera size={16} /> Change Avatar
                  </button>

                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <Lock size={16} /> Change Password
                  </button>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="btn-icon mobile-menu-toggle"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {showMobileMenu && (
          <div className="mobile-drawer animate-slide-down">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <Home size={19} />
              <span>Feed</span>
            </NavLink>

            <NavLink
              to="/bookmarks"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <Bookmark size={19} />
              <span>Bookmarks</span>
            </NavLink>

            <NavLink
              to="/notifications"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <div className="nav-icon-badge-wrapper">
                <Bell size={19} />
                {unreadCount > 0 && <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </div>
              <span>Notifications</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <User size={19} />
              <span>Profile</span>
            </NavLink>

            <button
              type="button"
              className="mobile-nav-link text-danger"
              onClick={handleLogout}
            >
              <LogOut size={19} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-bar">
        <NavLink to="/" end className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/bookmarks" className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}>
          <Bookmark size={20} />
          <span>Saved</span>
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}>
          <div className="nav-icon-badge-wrapper">
            <Bell size={20} />
            {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
          </div>
          <span>Alerts</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}>
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* Global Modals for Navbar triggers */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <UploadPhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </>
  );
};

export default Navbar;
