
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
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
  defaultPasswordChanged: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  changePassword: async () => false,
  defaultPasswordChanged: false,
  user: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [defaultPasswordChanged, setDefaultPasswordChanged] = useState(false);
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
      
      // Check if default password has been changed
      checkIfPasswordChanged();
    }
  }, []);

  // Function to check if the default password has been changed
  const checkIfPasswordChanged = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_credentials')
        .select('password')
        .single();
      
      if (error) {
        console.error('Error checking if password was changed:', error);
        return;
      }
      
      // Check if password is still the default '2014'
      setDefaultPasswordChanged(data.password !== '2014');
    } catch (error) {
      console.error('Error checking if password was changed:', error);
    }
  };

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
        
        // Check if default password has been changed
        setDefaultPasswordChanged(password !== '2014');
        
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
      
      setDefaultPasswordChanged(true);
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
    <AuthContext.Provider value={{ isAuthenticated, login, logout, changePassword, defaultPasswordChanged, user }}>
      {children}
    </AuthContext.Provider>
  );
};
