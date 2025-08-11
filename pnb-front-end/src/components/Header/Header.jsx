import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, MapPin, Clock, Star, Moon, Sun, Shield, LogOut } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import './Header.css';

const Header = ({ currentView, setCurrentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a preference stored or prefers dark mode
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    // If user just logged in and we're on admin page, redirect to management
    if (user && user.role === 'admin' && currentView === 'admin') {
      setTimeout(() => {
        setCurrentView('management');
      }, 500);
    }
  }, [user, currentView, setCurrentView]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dark mode effect
  useEffect(() => {
    // Save preference
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    // Apply to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
    closeMenu();
    
    // Scroll to top for new views
    if (view !== 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      // Wait for view to change then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    setCurrentView('home');
    closeMenu();
  };

  const navItems = [
    { label: 'Home', id: 'hero', action: () => handleNavigation('home') },
    { label: 'Services', id: 'services', action: () => scrollToSection('services') },
    { label: 'Gallery', id: 'gallery', action: () => scrollToSection('gallery') },
    { label: 'Appointment', id: 'appointment', action: () => scrollToSection('appointment') }
  ];

  // Add admin navigation items if user is logged in
  if (user && user.role === 'admin') {
    navItems.push(
      { 
        label: 'Admin Dashboard', 
        id: 'management', 
        action: () => handleNavigation('management'),
        isAdmin: true 
      }
    );
  }

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-content">
            <div className="contact-info">
              <div className="info-item">
                <Phone size={14} />
                <span>(555) 123-4567</span>
              </div>
              <div className="info-item">
                <MapPin size={14} />
                <span>123 Auto Repair St, City</span>
              </div>
              <div className="info-item">
                <Clock size={14} />
                <span>Mon-Fri: 8AM-6PM</span>
              </div>
            </div>
            <div className="rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill="currentColor" />
                ))}
              </div>
              <span>5.0 Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <motion.header 
        className={`header ${isScrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container">
          <div className="header-content">
            {/* Dark Mode Toggle */}
            <motion.button
              className="dark-mode-toggle"
              onClick={toggleDarkMode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatePresence mode="wait">
                {isDarkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Logo */}
            <motion.div 
              className="logo"
              onClick={() => handleNavigation('home')}
              style={{ cursor: 'pointer' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <h1>PNJ Auto Body</h1>
              <span>Professional Collision Repair</span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="desktop-nav">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  className={`nav-item ${item.isAdmin ? 'admin-nav-item' : ''} ${currentView === item.id || (item.id === 'hero' && currentView === 'home') ? 'active' : ''}`}
                  onClick={item.action}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -2, scale: item.isAdmin ? 1.05 : 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.isAdmin && <Shield size={16} style={{ marginRight: '0.5rem' }} />}
                  {item.label}
                </motion.button>
              ))}
              
              {/* Admin Login Button */}
              {!user && (
                <motion.button
                  className="admin-login-btn"
                  onClick={() => handleNavigation('admin')}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: navItems.length * 0.1 }}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Admin Login"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.5rem',
                    background: 'transparent',
                    border: '2px solid #3b82f6',
                    borderRadius: '0.5rem',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    minWidth: '2.5rem',
                    height: '2.5rem',
                    marginLeft: '0.5rem'
                  }}
                >
                  <Shield size={18} />
                </motion.button>
              )}

              {/* Admin Status & Logout */}
              {user && user.role === 'admin' && (
                <motion.div
                  className="admin-status"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="admin-info">
                    <Shield size={16} />
                    <span>Admin</span>
                  </div>
                  <button
                    className="logout-btn"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </motion.div>
              )}
            </nav>

            {/* CTA Button */}
            {!user && (
              <motion.button
                className="cta-button"
                onClick={() => scrollToSection('appointment')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Get Free Estimate
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              className="mobile-menu-btn"
              onClick={toggleMenu}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                className="mobile-menu-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={closeMenu}
              />
              <motion.div
                className="mobile-menu"
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ 
                  duration: 0.3, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
              >
                <div className="mobile-menu-content">
                  <motion.div 
                    className="mobile-menu-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h2>PNJ Auto Body</h2>
                    <p>Professional Collision Repair</p>
                    {user && user.role === 'admin' && (
                      <div className="mobile-admin-badge">
                        <Shield size={16} />
                        <span>Admin Panel</span>
                      </div>
                    )}
                  </motion.div>

                  {/* Dark Mode Toggle in Mobile Menu */}
                  <motion.div
                    className="mobile-dark-mode-section"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <button
                      className="mobile-dark-mode-toggle"
                      onClick={toggleDarkMode}
                    >
                      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                      <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                  </motion.div>

                  <nav className="mobile-nav">
                    {navItems.map((item, index) => (
                      <motion.button
                        key={item.id}
                        className={`mobile-nav-item ${item.isAdmin ? 'admin-mobile-nav-item' : ''} ${currentView === item.id || (item.id === 'hero' && currentView === 'home') ? 'active' : ''}`}
                        onClick={item.action}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: 0.1 + index * 0.05 
                        }}
                        whileHover={{ x: 10, color: item.isAdmin ? '#3b82f6' : '#3b82f6' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {item.isAdmin && <Shield size={16} style={{ marginRight: '0.5rem' }} />}
                        {item.label}
                        {item.isAdmin && <Shield size={16} style={{ marginLeft: 'auto' }} />}
                      </motion.button>
                    ))}
                    
                    {/* Mobile Admin Login */}
                    {!user && (
                      <motion.button
                        className="mobile-nav-item admin-login"
                        onClick={() => handleNavigation('admin')}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: 0.1 + navItems.length * 0.05 
                        }}
                        whileHover={{ x: 10, color: '#3b82f6' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Admin Login
                        <Shield size={16} style={{ marginLeft: 'auto' }} />
                      </motion.button>
                    )}
                  </nav>

                  <motion.div 
                    className="mobile-menu-footer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {!user && (
                      <button 
                        className="mobile-cta-btn"
                        onClick={() => scrollToSection('appointment')}
                      >
                        Get Free Estimate
                      </button>
                    )}
                    
                    {user && user.role === 'admin' && (
                      <button 
                        className="mobile-logout-btn"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    )}
                    
                    <div className="mobile-contact">
                      <div className="contact-item">
                        <Phone size={16} />
                        <span>(555) 123-4567</span>
                      </div>
                      <div className="contact-item">
                        <MapPin size={16} />
                        <span>123 Auto Repair St</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Header;
