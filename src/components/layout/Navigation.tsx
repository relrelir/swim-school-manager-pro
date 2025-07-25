
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, FileText, Home } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/context/AuthContext';

const Navigation: React.FC = () => {
  const { isAdmin } = useAuth();
  
  // Define all navigation items
  const allNavItems = [
    { path: '/', icon: <Home className="h-5 w-5" />, label: 'עונות' },
    { path: '/report', icon: <FileText className="h-5 w-5" />, label: 'דו"ח רישומים', adminOnly: true },
    { path: '/daily-activity', icon: <Calendar className="h-5 w-5" />, label: 'פעילות יומית' },
  ];
  
  // Filter items based on user role
  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin());
  
  return (
    <nav className="flex flex-col p-1 border-b bg-white shadow-navbar">
      <div className="container mx-auto">
        <ul className="flex flex-wrap items-center justify-center md:justify-start gap-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => 
                  cn(
                    "flex items-center gap-2 px-4 py-3 rounded-md font-medium transition-colors",
                    "hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20",
                    isActive 
                      ? "text-primary bg-primary/10 font-semibold"
                      : "text-foreground/80"
                  )
                }
                end={item.path === '/'}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
