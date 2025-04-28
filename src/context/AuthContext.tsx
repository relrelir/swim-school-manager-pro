
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  changePassword: (newPassword: string) => void;
  defaultPasswordChanged: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
  changePassword: () => {},
  defaultPasswordChanged: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('1234');
  const [defaultPasswordChanged, setDefaultPasswordChanged] = useState(false);
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
    }
  }, []);

  const login = (enteredPassword: string): boolean => {
    if (enteredPassword === password) {
      setIsAuthenticated(true);
      localStorage.setItem('swimSchoolAuth', 'true');
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
    <AuthContext.Provider value={{ isAuthenticated, login, logout, changePassword, defaultPasswordChanged }}>
      {children}
    </AuthContext.Provider>
  );
};
