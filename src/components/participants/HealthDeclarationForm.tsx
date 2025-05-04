
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { HealthDeclaration } from '@/types';
import { useData } from '@/context/DataContext';

interface HealthDeclarationFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  participantName: string;
  defaultPhone: string;
  healthDeclaration?: HealthDeclaration;
  afterSubmit?: () => void;
}

const HealthDeclarationForm: React.FC<HealthDeclarationFormProps> = ({
  isOpen,
  onOpenChange,
  registrationId,
  participantName,
  defaultPhone,
  healthDeclaration,
  afterSubmit
}) => {
  const { addHealthDeclaration, sendHealthDeclarationSMS, updateHealthDeclaration } = useData();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateLink = async () => {
    // This function now just generates the link, no SMS sending
    setIsLoading(true);
    
    try {
      if (healthDeclaration) {
        // We already have a health declaration, just update its status
        await updateHealthDeclaration(healthDeclaration.id, { 
          formStatus: 'sent',
          sentAt: new Date().toISOString()
        });
        
        // Generate link
        const origin = window.location.origin;
        const formLink = `${origin}/health-form?id=${healthDeclaration.id}`;
        
        // Copy link to clipboard
        await navigator.clipboard.writeText(formLink);
        toast({
          title: "לינק הועתק בהצלחה",
          description: `הלינק להצהרת בריאות עבור ${participantName} הועתק ללוח: ${formLink}`
        });
      } else {
        // Create a new health declaration
        const newDeclaration = {
          registrationId: registrationId,
          phone: defaultPhone,
          formStatus: 'pending' as const,
          sentAt: new Date().toISOString()
        };
        
        const createdDeclaration = await addHealthDeclaration(newDeclaration);
        if (!createdDeclaration) {
          throw new Error("Failed to create health declaration");
        }
        
        // Generate link
        const origin = window.location.origin;
        const formLink = `${origin}/health-form?id=${createdDeclaration.id}`;
        
        // Copy link to clipboard
        await navigator.clipboard.writeText(formLink);
        toast({
          title: "לינק הועתק בהצלחה",
          description: `הלינק להצהרת בריאות עבור ${participantName} הועתק ללוח: ${formLink}`
        });
      }
      
      // Close the form and refresh if needed
      onOpenChange(false);
      if (afterSubmit) afterSubmit();
      
    } catch (error) {
      console.error('Error generating health declaration link:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת לינק להצהרת בריאות",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>יצירת לינק להצהרת בריאות</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-sm">
            יצירת לינק להצהרת בריאות עבור: <span className="font-bold">{participantName}</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            לחץ על הכפתור לייצר לינק להצהרת בריאות. הלינק יועתק אוטומטית ללוח שלך.
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleGenerateLink} disabled={isLoading}>
            {isLoading ? 'מייצר לינק...' : healthDeclaration?.formStatus === 'sent' ? 'יצירת לינק מחדש' : 'צור לינק'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HealthDeclarationForm;
