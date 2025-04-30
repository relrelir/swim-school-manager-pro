
import React, { useState, useEffect } from 'react';
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
import { Link, Copy } from 'lucide-react';

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

  // Reset phone and link created state when dialog opens with new data
  useEffect(() => {
    if (isOpen) {
      setPhone(defaultPhone);
      setIsLinkCreated(Boolean(healthDeclaration?.id));
    }
  }, [isOpen, defaultPhone, healthDeclaration]);

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
        if (healthDeclaration.phone !== phone || healthDeclaration.phone_sent_to !== phone) {
          await updateHealthDeclaration(healthDeclaration.id, { 
            phone, 
            phone_sent_to: phone 
          });
        }
      } else {
        // Create a new health declaration with all required fields in the correct format
        console.log('Creating new health declaration with registrationId:', registrationId);
        
        const newDeclaration = await addHealthDeclaration({
          // CRITICAL: participant_id must be set to registrationId
          participant_id: registrationId,
          registrationId: registrationId,
          phone_sent_to: phone,
          phone: phone,
          form_status: 'pending',
          formStatus: 'pending',
          created_at: new Date().toISOString(),
          sentAt: new Date().toISOString()
        });
        
        if (newDeclaration) {
          declarationId = newDeclaration.id;
          setIsLinkCreated(true);
          
          console.log('Successfully created health declaration:', newDeclaration);
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

  // Helper function to get status display text and color
  const getStatusDisplay = (status?: string) => {
    if (!status) return { text: 'ממתין', color: 'text-amber-500' };
    
    // Safe comparison with string literals
    if (status === 'completed') return { text: 'הושלם', color: 'text-green-500' };
    if (status === 'signed') return { text: 'חתום', color: 'text-green-500' };
    if (status === 'sent') return { text: 'נשלח', color: 'text-blue-500' };
    if (status === 'expired') return { text: 'פג תוקף', color: 'text-red-500' };
    return { text: 'ממתין', color: 'text-amber-500' };
  };

  // Get status display properties
  const formStatus = healthDeclaration?.formStatus || healthDeclaration?.form_status;
  const statusDisplay = getStatusDisplay(formStatus);

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
              <Button onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-1" />
                העתק
              </Button>
            </div>
            <div className="flex items-center justify-center mt-2">
              <div className="bg-muted p-3 rounded-md flex items-center gap-2">
                <Link className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  סטטוס הצהרה: 
                  <span className={`font-medium ml-1 ${statusDisplay.color}`}>
                    {statusDisplay.text}
                  </span>
                </span>
              </div>
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
