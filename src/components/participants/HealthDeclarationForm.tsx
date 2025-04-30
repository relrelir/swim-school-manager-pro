
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { HealthDeclaration } from '@/types';
import { useData } from '@/context/DataContext';
import CreateHealthForm from './health-declaration/CreateHealthForm';
import HealthFormLink from './health-declaration/HealthFormLink';

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הצהרת בריאות</DialogTitle>
        </DialogHeader>
        {isLinkCreated && healthDeclaration?.id ? (
          <HealthFormLink 
            healthFormUrl={healthFormUrl}
            participantName={participantName}
            formStatus={healthDeclaration.formStatus || healthDeclaration.form_status}
          />
        ) : (
          <CreateHealthForm
            phone={phone}
            participantName={participantName}
            isLoading={isLoading}
            onPhoneChange={handlePhoneChange}
            onSubmit={handleSendHealthDeclaration}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HealthDeclarationForm;
