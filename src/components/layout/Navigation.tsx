
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="w-64 bg-white border-l p-4 shadow-sm">
      <div className="space-y-2">
        <Link to="/">
          <Button
            variant={isActive('/') ? 'default' : 'ghost'}
            className="w-full justify-start"
          >
            עונות
          </Button>
        </Link>
        <Link to="/report">
          <Button
            variant={isActive('/report') ? 'default' : 'ghost'}
            className="w-full justify-start"
          >
            דו"ח מאוחד
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
