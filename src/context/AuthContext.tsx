
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

// Simple User interface for the application
interface User {
  id: string;
  displayName: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  changePassword: (newPassword: string) => void;
  defaultPasswordChanged: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
  changePassword: () => {},
  defaultPasswordChanged: false,
  user: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('1234');
  const [defaultPasswordChanged, setDefaultPasswordChanged] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  // Check if there's a saved password in localStorage
  useEffect(() => {
    const savedPassword = localStorage.getItem('swimSchoolPassword');
    if (savedPassword) {
      setPassword(savedPassword);
      setDefaultPasswordChanged(true);
    }
    
    // Check if there's a saved auth state
    const savedAuth = localStorage.getItem('swimSchoolAuth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      // Create a default user when authenticated
      setUser({
        id: '1',
        displayName: 'מנהל'
      });
    }
  }, []);

  const login = (enteredPassword: string): boolean => {
    if (enteredPassword === password) {
      setIsAuthenticated(true);
      localStorage.setItem('swimSchoolAuth', 'true');
      // Set user data when logging in
      setUser({
        id: '1',
        displayName: 'מנהל'
      });
      return true;
    } else {
      toast({
        title: "שגיאת התחברות",
        description: "סיסמה שגויה, נסה שנית",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('swimSchoolAuth');
  };

  const changePassword = (newPassword: string) => {
    setPassword(newPassword);
    localStorage.setItem('swimSchoolPassword', newPassword);
    setDefaultPasswordChanged(true);
    toast({
      title: "סיסמה עודכנה",
      description: "הסיסמה החדשה נשמרה בהצלחה",
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, changePassword, defaultPasswordChanged, user }}>
      {children}
    </AuthContext.Provider>
  );
};
