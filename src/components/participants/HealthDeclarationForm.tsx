
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
import { Copy, CheckCircle } from 'lucide-react';

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
  const [formLink, setFormLink] = useState('');
  const [copied, setCopied] = useState(false);
  const baseUrl = window.location.origin;

  useEffect(() => {
    if (healthDeclaration) {
      const link = `${baseUrl}/health-form?id=${healthDeclaration.id}`;
      setFormLink(link);
    }
  }, [healthDeclaration, baseUrl]);

  const handleCreateLink = async (e: React.FormEvent) => {
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
      if (healthDeclaration) {
        // If we have an existing health declaration, update the phone number if needed
        if (healthDeclaration.phone !== phone) {
          await updateHealthDeclaration(healthDeclaration.id, { phone });
        }
        // Update formStatus to 'sent' to indicate link was generated
        await updateHealthDeclaration(healthDeclaration.id, { formStatus: 'sent', sentAt: new Date().toISOString() });
        // Set form link
        const link = `${baseUrl}/health-form?id=${healthDeclaration.id}`;
        setFormLink(link);
      } else {
        // Create a new health declaration
        const newDeclaration = await addHealthDeclaration({
          registrationId: registrationId,
          phone: phone,
          formStatus: 'sent',
          sentAt: new Date().toISOString()
        });
        
        if (newDeclaration) {
          // Set form link
          const link = `${baseUrl}/health-form?id=${newDeclaration.id}`;
          setFormLink(link);
        } else {
          throw new Error("Failed to create health declaration");
        }
      }
      
      // Show success message
      toast({
        title: "קישור להצהרת בריאות נוצר",
        description: "כעת ניתן להעתיק את הקישור ולשלוח אותו ללקוח",
      });
      
    } catch (error) {
      console.error('Error generating health declaration link:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת הצהרת הבריאות",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formLink);
    setCopied(true);
    
    toast({
      title: "הקישור הועתק",
      description: "הקישור הועתק ללוח, כעת תוכל לשלוח אותו ללקוח",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>יצירת קישור להצהרת בריאות</DialogTitle>
        </DialogHeader>
        {formLink ? (
          <div className="grid gap-4 py-4">
            <div className="text-sm">
              קישור להצהרת בריאות עבור: <span className="font-bold">{participantName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="border p-2 rounded-md flex-1 bg-muted text-xs truncate">
                {formLink}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              העתק את הקישור ושלח אותו ללקוח. הלקוח ימלא את הצהרת הבריאות, יחתום עליה ויוכל להדפיס אותה.
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateLink}>
            <div className="grid gap-4 py-4">
              <div className="text-sm">
                יצירת קישור להצהרת בריאות עבור: <span className="font-bold">{participantName}</span>
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
                מספר הטלפון ישמש לזיהוי הלקוח. 
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'מייצר קישור...' : 'צור קישור'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HealthDeclarationForm;
