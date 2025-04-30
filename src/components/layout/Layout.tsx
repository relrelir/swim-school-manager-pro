
import React from 'react';
import Header from './Header';
import Navigation from './Navigation';
import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/pages/LoginPage';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <Navigation />
      <main className="flex-1 container mx-auto p-4 md:p-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default Layout;
