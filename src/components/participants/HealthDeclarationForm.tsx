
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
  const [isLinkCreated, setIsLinkCreated] = useState(Boolean(healthDeclaration?.id));
  const baseUrl = window.location.origin;
  const healthFormUrl = `${baseUrl}/health-form?id=${healthDeclaration?.id || ''}`;

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
          setIsLinkCreated(true);
        } else {
          throw new Error("Failed to create health declaration");
        }
      }
      
      // Show success message with copy link option
      navigator.clipboard.writeText(`${baseUrl}/health-form?id=${declarationId}`);
      toast({
        title: "לינק להצהרת בריאות הועתק",
        description: `הלינק להצהרת בריאות עבור ${participantName} הועתק ללוח. אנא שלח אותו למשתתף.`,
      });
      
      // Don't close the dialog so user can copy the link again if needed
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(healthFormUrl);
    toast({
      title: "הלינק הועתק",
      description: "הלינק להצהרת הבריאות הועתק ללוח",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הצהרת בריאות</DialogTitle>
        </DialogHeader>
        {isLinkCreated && healthDeclaration?.id ? (
          <div className="grid gap-4 py-4">
            <div className="text-sm">
              הצהרת בריאות עבור: <span className="font-bold">{participantName}</span>
            </div>
            <div className="text-sm">
              העתק את הלינק ושלח למשתתף בוואטסאפ/מייל:
            </div>
            <div className="flex gap-2">
              <Input
                value={healthFormUrl}
                readOnly
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 text-right"
              />
              <Button onClick={handleCopyLink}>העתק</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              כאשר המשתתף ימלא את הטופס, אישור הבריאות יעודכן אוטומטית במערכת.
            </div>
          </div>
        ) : (
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
                לאחר יצירת ההצהרה תוכל להעתיק את הלינק ולשלוח למשתתף בוואטסאפ או מייל.
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'מכין...' : 'צור הצהרה'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HealthDeclarationForm;
