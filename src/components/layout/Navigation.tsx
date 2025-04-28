
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, FileText } from 'lucide-react';

const Navigation: React.FC = () => {
  const linkClass = "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors";
  const activeLinkClass = "bg-muted";
  
  return (
    <nav className="flex justify-center p-4 border-b">
      <ul className="flex space-x-4 space-x-reverse">
        <li>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `${linkClass} ${isActive ? activeLinkClass : ''}`
            }
            end
          >
            עונות
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/report" 
            className={({ isActive }) => 
              `${linkClass} ${isActive ? activeLinkClass : ''}`
            }
          >
            <FileText size={18} />
            <span>דו"ח רישומים</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/daily-activity" 
            className={({ isActive }) => 
              `${linkClass} ${isActive ? activeLinkClass : ''}`
            }
          >
            <Calendar size={18} />
            <span>דו"ח פעילות יומי</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
