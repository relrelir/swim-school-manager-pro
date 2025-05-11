
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { HealthDeclaration } from '@/types';
import { useData } from '@/context/DataContext';
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
  const { addHealthDeclaration } = useData();
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

  const handleCreateHealthDeclaration = async () => {
    setIsLoading(true);
    
    try {
      let declarationId = healthDeclaration?.id;
      
      if (!healthDeclaration) {
        // Create a new health declaration with all required fields in the correct format
        console.log('Creating new health declaration with registrationId:', registrationId);
        
        const now = new Date().toISOString();
        const newDeclaration = await addHealthDeclaration({
          // CRITICAL: participant_id must be set to registrationId
          participant_id: registrationId,
          registrationId: registrationId,
          form_status: 'pending',
          formStatus: 'pending',
          created_at: now,
          updated_at: now, // Add the required updated_at field
          token: '',
          sentAt: now
        });
        
        if (newDeclaration) {
          declarationId = newDeclaration.id;
          setIsLinkCreated(true);
          
          console.log('Successfully created health declaration:', newDeclaration);
        } else {
          throw new Error("Failed to create health declaration");
        }
      }
      
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

  const isFormSigned = Boolean(
    healthDeclaration && 
    (healthDeclaration.formStatus === 'signed' || healthDeclaration.form_status === 'signed')
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הצהרת בריאות</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-4">
            {isFormSigned 
              ? `הצהרת הבריאות עבור ${participantName} כבר חתומה` 
              : `יצירת טופס הצהרת בריאות עבור ${participantName}`
            }
          </p>
          
          {isFormSigned ? (
            <p className="text-sm text-green-600 font-medium">
              הצהרת הבריאות מולאה ונחתמה בהצלחה. תוכל להדפיס אותה דרך הטבלה.
            </p>
          ) : (
            <p className="text-sm mb-4">
              לחץ על הכפתור להלן כדי ליצור קישור ייחודי להצהרת בריאות. הקישור יועתק ללוח.
            </p>
          )}
        </div>

        <DialogFooter>
          {!isFormSigned && (
            <HealthFormLink 
              registrationId={registrationId}
              isDisabled={false}
              className="w-full"
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HealthDeclarationForm;
