import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Services from './components/Services/Services';
import BeforeAfter from './components/BeforeAfter/BeforeAfter';
import Appointment from './components/Appointment/Appointment';
import AdminLogin from './components/Admin/AdminLogin';
import Management from './components/Admin/Management';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'admin':
        return <AdminLogin />;
      case 'management':
        return <Management />;
      default:
        return (
          <>
            <Hero />
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
