
import { useState } from 'react';
import { Participant, Registration, HealthDeclaration } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { generateHealthDeclarationPDF, downloadPDF } from '@/utils/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';

export const useParticipantHealth = (
  getHealthDeclarationForRegistration: (registrationId: string) => HealthDeclaration | undefined,
  sendHealthDeclarationSMS: (healthDeclarationId: string, phone: string) => Promise<void>,
  addHealthDeclaration: (declaration: Omit<HealthDeclaration, 'id'>) => void,
  updateHealthDeclaration: (declaration: HealthDeclaration) => void,
  updateParticipant: (participant: Participant) => void,
  participants: Participant[],
  registrations: Registration[]
) => {
  const [isHealthFormOpen, setIsHealthFormOpen] = useState(false);
  const [currentHealthDeclaration, setCurrentHealthDeclaration] = useState<{
    registrationId: string;
    participantName: string;
    phone: string;
    declaration?: HealthDeclaration;
  } | null>(null);

  // Generate a health declaration link
  const generateHealthDeclarationLink = async (registrationId: string) => {
    const registration = registrations.find(reg => reg.id === registrationId);
    if (!registration) {
      toast({
        title: "שגיאה",
        description: "לא נמצא רישום למשתתף זה",
        variant: "destructive",
      });
      return;
    }

    const participant = participants.find(p => p.id === registration.participantId);
    if (!participant) {
      toast({
        title: "שגיאה",
        description: "לא נמצאו פרטי משתתף",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if a declaration already exists or create a new one
      let healthDeclaration = getHealthDeclarationForRegistration(registrationId);
      
      if (!healthDeclaration) {
        // Create a new health declaration
        const newDeclaration = {
          registrationId: registrationId,
          phone: participant.phone || '',
          formStatus: 'pending' as const,
          sentAt: new Date().toISOString()
        };
        
        const result = await addHealthDeclaration(newDeclaration);
        if (result) {
          healthDeclaration = result;
        } else {
          throw new Error("Failed to create health declaration");
        }
      }

      // Generate a link based on host and declaration ID
      const origin = window.location.origin;
      const formLink = `${origin}/health-form?id=${healthDeclaration.id}`;
      
      // Update the health declaration status
      await updateHealthDeclaration({
        ...healthDeclaration,
        formStatus: 'sent',
        sentAt: new Date().toISOString()
      });

      // Copy link to clipboard
      navigator.clipboard.writeText(formLink).then(() => {
        toast({
          title: "לינק הועתק בהצלחה",
          description: (
            <div className="space-y-2">
              <p>הלינק להצהרת הבריאות עבור {participant.firstName} {participant.lastName} הועתק ללוח</p>
              <p>לינק: <a href={formLink} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">{formLink}</a></p>
            </div>
          ),
        });
      });
    } catch (error) {
      console.error('Error generating health declaration link:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת לינק להצהרת בריאות",
        variant: "destructive",
      });
    }
  };

  // Handler for opening health form
  const handleOpenHealthForm = (registrationId: string) => {
    generateHealthDeclarationLink(registrationId);
  };

  // Handle updating health approval
  const handleUpdateHealthApproval = (registrationId: string, isApproved: boolean) => {
    // Find the corresponding registration and participant
    const registration = registrations.find(reg => reg.participantId && reg.id === registrationId);
    if (registration) {
      const participant = participants.find(p => p.id === registration.participantId);
      if (participant) {
        const updatedParticipant: Participant = {
          ...participant,
          healthApproval: isApproved
        };
        
        updateParticipant(updatedParticipant);
        
        toast({
          title: "אישור בריאות עודכן",
          description: `אישור בריאות ${isApproved ? 'התקבל' : 'בוטל'} עבור ${participant.firstName} ${participant.lastName}`,
        });
      }
    }
  };
  
  // Handle printing health declaration
  const handlePrintHealthDeclaration = (registrationId: string) => {
    // Find the corresponding registration and participant
    const registration = registrations.find(reg => reg.id === registrationId);
    if (!registration) {
      toast({
        title: "שגיאה",
        description: "לא נמצא רישום למשתתף זה",
        variant: "destructive",
      });
      return;
    }

    const participant = participants.find(p => p.id === registration.participantId);
    if (!participant) {
      toast({
        title: "שגיאה",
        description: "לא נמצאו פרטי משתתף",
        variant: "destructive",
      });
      return;
    }

    // Get health declaration or create a new one for printing
    let healthDeclaration = getHealthDeclarationForRegistration(registrationId);
    
    if (!healthDeclaration) {
      // If there's no health declaration yet, we'll create a temporary one for printing
      healthDeclaration = {
        id: 'temp-print',
        registrationId: registrationId,
        phone: participant.phone,
        formStatus: 'pending',
        sentAt: new Date().toISOString()
      };
    }
    
    try {
      // Generate PDF
      const pdfDoc = generateHealthDeclarationPDF(healthDeclaration, participant);
      
      // Download PDF
      downloadPDF(pdfDoc, `הצהרת_בריאות_${participant.firstName}_${participant.lastName}.pdf`);
      
      toast({
        title: "הצהרת בריאות נוצרה בהצלחה",
        description: `הצהרת בריאות עבור ${participant.firstName} ${participant.lastName} נוצרה בהצלחה`,
      });
    } catch (error) {
      console.error('Error generating health declaration:', error);
      toast({
        title: "שגיאה ביצירת הצהרת בריאות",
        description: "אירעה שגיאה ביצירת הצהרת הבריאות",
        variant: "destructive",
      });
    }
  };

  return {
    isHealthFormOpen,
    setIsHealthFormOpen,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    handleOpenHealthForm,
    handleUpdateHealthApproval,
    handlePrintHealthDeclaration
  };
};
