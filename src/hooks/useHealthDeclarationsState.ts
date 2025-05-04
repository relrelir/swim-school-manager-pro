
import { useState, useEffect } from 'react';
import { HealthDeclaration } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { 
  fetchHealthDeclarations,
  addHealthDeclaration as apiAddHealthDeclaration,
  updateHealthDeclaration as apiUpdateHealthDeclaration,
  sendHealthDeclarationSMS as apiSendHealthDeclarationSMS
} from '@/services/healthDeclarationService';

export const useHealthDeclarationsState = () => {
  const [healthDeclarations, setHealthDeclarations] = useState<HealthDeclaration[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load health declarations on component mount
  useEffect(() => {
    const loadHealthDeclarations = async () => {
      try {
        const data = await fetchHealthDeclarations();
        setHealthDeclarations(data);
      } catch (error) {
        console.error('Error loading health declarations:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת הצהרות בריאות",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadHealthDeclarations();
  }, []);

  // Add a health declaration
  const addHealthDeclaration = async (declaration: Omit<HealthDeclaration, 'id'>): Promise<HealthDeclaration | undefined> => {
    try {
      const newHealthDeclaration = await apiAddHealthDeclaration(declaration);
      
      if (newHealthDeclaration) {
        setHealthDeclarations(prev => [...prev, newHealthDeclaration]);
        return newHealthDeclaration;
      }
      return undefined;
    } catch (error) {
      console.error('Error adding health declaration:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת הצהרת בריאות חדשה",
        variant: "destructive",
      });
      return undefined;
    }
  };

  // Update a health declaration
  const updateHealthDeclaration = async (id: string, updates: Partial<HealthDeclaration>): Promise<void> => {
    try {
      await apiUpdateHealthDeclaration(id, updates);
      
      setHealthDeclarations(declarations => 
        declarations.map(declaration => 
          declaration.id === id ? { ...declaration, ...updates } : declaration
        )
      );
    } catch (error) {
      console.error('Error updating health declaration:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון הצהרת בריאות",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get health declaration for a specific registration
  const getHealthDeclarationForRegistration = (registrationId: string): HealthDeclaration | undefined => {
    return healthDeclarations.find(declaration => declaration.registrationId === registrationId);
  };

  // Send SMS with health declaration link
  const sendHealthDeclarationSMS = async (healthDeclarationId: string, phone: string): Promise<void> => {
    try {
      const result = await apiSendHealthDeclarationSMS(healthDeclarationId, phone);
      
      // Update local state
      setHealthDeclarations(declarations => 
        declarations.map(declaration => 
          declaration.id === healthDeclarationId 
            ? { 
                ...declaration, 
                phone: phone, 
                formStatus: 'sent', 
                sentAt: new Date().toISOString()
              } 
            : declaration
        )
      );

      // Copy form link to clipboard if available
      if (result.formLink) {
        navigator.clipboard.writeText(result.formLink).catch((clipboardError) => {
          console.error("Failed to copy to clipboard:", clipboardError);
        });
        
        toast({
          title: "לינק נוצר בהצלחה",
          description: "לינק להצהרת בריאות נוצר והועתק בהצלחה",
        });
      } else {
        toast({
          title: "לינק נוצר",
          description: "לינק להצהרת בריאות נוצר בהצלחה",
        });
      }
    } catch (error) {
      console.error('Error generating health declaration link:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת לינק להצהרת בריאות",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    healthDeclarations,
    loading,
    addHealthDeclaration,
    updateHealthDeclaration,
    getHealthDeclarationForRegistration,
    sendHealthDeclarationSMS
  };
};
