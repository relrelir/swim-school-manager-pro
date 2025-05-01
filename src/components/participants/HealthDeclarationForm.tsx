
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
  healthDeclaration,
  afterSubmit
}) => {
  const { addHealthDeclaration, updateHealthDeclaration } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkCreated, setIsLinkCreated] = useState(Boolean(healthDeclaration?.id));
  const baseUrl = window.location.origin;
  const healthFormUrl = `${baseUrl}/health-form?id=${healthDeclaration?.id || ''}`;

  // Reset link created state when dialog opens with new data
  useEffect(() => {
    if (isOpen) {
      setIsLinkCreated(Boolean(healthDeclaration?.id));
    }
  }, [isOpen, healthDeclaration]);

  const handleCreateHealthDeclaration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      let declarationId = healthDeclaration?.id;
      
      if (!healthDeclaration) {
        // Create a new health declaration with all required fields in the correct format
        console.log('Creating new health declaration with registrationId:', registrationId);
        
        const newDeclaration = await addHealthDeclaration({
          // CRITICAL: participant_id must be set to registrationId
          participant_id: registrationId,
          registrationId: registrationId,
          form_status: 'pending',
          formStatus: 'pending',
          created_at: new Date().toISOString(),
          token: '',
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
            registrationId={registrationId}
            isDisabled={healthDeclaration.formStatus === 'signed' || healthDeclaration.form_status === 'signed'}
            declarationId={healthDeclaration.id}
          />
        ) : (
          <CreateHealthForm
            participantName={participantName}
            isLoading={isLoading}
            onSubmit={handleCreateHealthDeclaration}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HealthDeclarationForm;
