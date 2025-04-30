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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [phone, setPhone] = useState(defaultPhone);
  const { addHealthDeclaration, sendHealthDeclarationSMS, updateHealthDeclaration } = useData();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (healthDeclaration) {
        // If we have an existing health declaration, send SMS
        await sendHealthDeclarationSMS(healthDeclaration.id, phone);
      } else {
        // Otherwise create a new one
        const newDeclaration = await addHealthDeclaration({
          registrationId: registrationId,
          phone: phone,
          formStatus: 'pending',
          sentAt: new Date().toISOString()
        });
        
        if (newDeclaration) {
          // Send SMS for the new declaration
          await sendHealthDeclarationSMS(newDeclaration.id, phone);
        }
      }
      
      // Close the form and refresh if needed
      onOpenChange(false);
      if (afterSubmit) afterSubmit();
      
    } catch (error) {
      console.error('Error sending health declaration SMS:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשליחת הצהרת הבריאות",
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
          <DialogTitle>שליחת הצהרת בריאות</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSendSMS}>
          <div className="grid gap-4 py-4">
            <div className="text-sm">
              שליחת הצהרת בריאות עבור: <span className="font-bold">{participantName}</span>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-left col-span-1">
                טלפון
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="הזן מספר טלפון"
                className="col-span-3 text-right"
                required
              />
            </div>
            
            <div className="text-xs text-muted-foreground">
              הודעת SMS תישלח למספר זה עם קישור להצהרת הבריאות.
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'שולח...' : healthDeclaration?.formStatus === 'sent' ? 'שלח שוב' : 'שלח'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HealthDeclarationForm;
