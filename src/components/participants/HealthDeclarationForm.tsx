
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
  const { addHealthDeclaration, updateHealthDeclaration } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const baseUrl = window.location.origin;

  const handleSendHealthDeclaration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    if (!phone || phone.trim() === '') {
      toast({
        title: "שגיאה",
        description: "יש להזין מספר טלפון",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      let declarationId = healthDeclaration?.id;
      
      if (healthDeclaration) {
        // If we have an existing health declaration, update the phone number if needed
        if (healthDeclaration.phone !== phone) {
          await updateHealthDeclaration(healthDeclaration.id, { phone });
        }
      } else {
        // Create a new health declaration
        const newDeclaration = await addHealthDeclaration({
          registrationId: registrationId,
          phone: phone,
          formStatus: 'pending',
          sentAt: new Date().toISOString()
        });
        
        if (newDeclaration) {
          declarationId = newDeclaration.id;
        } else {
          throw new Error("Failed to create health declaration");
        }
      }
      
      // Show success message with copy link option
      const healthFormUrl = `${baseUrl}/health-form?id=${declarationId}`;
      
      navigator.clipboard.writeText(healthFormUrl);
      toast({
        title: "לינק להצהרת בריאות הועתק",
        description: `הלינק להצהרת בריאות עבור ${participantName} הועתק ללוח. אנא שלח אותו למשתתף.`,
      });
      
      // Close the form and refresh if needed
      onOpenChange(false);
      if (afterSubmit) afterSubmit();
      
    } catch (error) {
      console.error('Error creating health declaration:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת הצהרת הבריאות",
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
          <DialogTitle>יצירת הצהרת בריאות</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSendHealthDeclaration}>
          <div className="grid gap-4 py-4">
            <div className="text-sm">
              יצירת הצהרת בריאות עבור: <span className="font-bold">{participantName}</span>
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
              לאחר יצירת ההצהרה תוכל להעתיק את הלינק ולשלוח למשתתף בוואטסאפ.
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'מכין...' : healthDeclaration?.formStatus === 'sent' ? 'צור מחדש' : 'צור הצהרה'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HealthDeclarationForm;
