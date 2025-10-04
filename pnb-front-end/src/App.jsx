import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Services from './components/Services/Services';
import ServicesTwo from './components/Services/ServicesTwo';
import BeforeAfter from './components/BeforeAfter/BeforeAfter';
import Appointment from './components/Appointment/Appointment';
import Management from './components/Admin/Management';
import CustomerDashboard from './components/Customer/CustomerDashboard';
import ProfileSettings from './components/Customer/ProfileSettings';
import Register from './components/Auth/Register';
import UnifiedLogin from './components/Auth/UnifiedLogin';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'admin':
      case 'login':
        return <UnifiedLogin onSwitchToRegister={() => setCurrentView('register')} onClose={() => setCurrentView('home')} />;
      case 'management':
        return <Management />;
      case 'customer-dashboard':
        return <CustomerDashboard />;
      case 'profile-settings':
        return <ProfileSettings />;
      case 'register':
        return <Register onSwitchToLogin={() => setCurrentView('login')} onClose={() => setCurrentView('home')} />;
      default:
        return (
          <>
            <Hero />
            <ServicesTwo />
            <Services />
            <BeforeAfter />
            <Appointment />
          </>
        );
    }
  };

  return (
    <AuthProvider>
      <div className="App">
        <Header currentView={currentView} setCurrentView={setCurrentView} />
        <main>
          {renderCurrentView()}
        </main>
      </div>
    </AuthProvider>
  );
}

export default App
