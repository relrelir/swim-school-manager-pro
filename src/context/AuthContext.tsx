
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Simple User interface for the application
interface User {
  id: string;
  displayName: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<boolean>;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  changePassword: async () => false,
  user: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  // Check if there's a saved auth state
  useEffect(() => {
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

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', { username, password });
      
      const { data, error } = await supabase
        .from('admin_credentials')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "שגיאת התחברות",
          description: "אירעה שגיאה בהתחברות, אנא נסה שנית",
          variant: "destructive",
        });
        return false;
      }
      
      console.log('Login data received:', data);
      
      if (data && data.password === password) {
        setIsAuthenticated(true);
        localStorage.setItem('swimSchoolAuth', 'true');
        // Set user data when logging in
        setUser({
          id: data.id,
          displayName: 'מנהל'
        });
        
        return true;
      } else {
        console.error('Password mismatch or no data');
        toast({
          title: "שגיאת התחברות",
          description: "שם משתמש או סיסמה שגויים",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "שגיאת התחברות",
        description: "אירעה שגיאה בהתחברות, אנא נסה שנית",
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

  const changePassword = async (newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('admin_credentials')
        .update({ 
          password: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('username', 'ענבר במדבר 2014');
      
      if (error) {
        console.error('Error updating password:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בעדכון הסיסמה",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "סיסמה עודכנה",
        description: "הסיסמה החדשה נשמרה בהצלחה",
      });
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון הסיסמה",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, changePassword, user }}>
      {children}
    </AuthContext.Provider>
  );
};
