
import React from 'react';
import { Button } from '@/components/ui/button';
import { Registration, HealthDeclaration } from '@/types';
import { Trash2Icon, FileDownIcon, CreditCardIcon, FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generateRegistrationPdf } from '@/utils/generateRegistrationPdf';
import { generateHealthDeclarationPdf } from '@/utils/generateHealthDeclarationPdf';
import { toast } from "@/components/ui/use-toast";

interface TableRowActionsProps {
  registration: Registration;
  hasPayments: boolean;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (registrationId: string) => void;
  onOpenHealthForm?: (registrationId: string) => void;
  healthDeclaration?: HealthDeclaration;
}

const TableRowActions: React.FC<TableRowActionsProps> = ({
  registration,
  hasPayments,
  onAddPayment,
  onDeleteRegistration,
  onOpenHealthForm,
  healthDeclaration,
}) => {
  const [isGeneratingRegPdf, setIsGeneratingRegPdf] = React.useState(false);
  const [isGeneratingHealthPdf, setIsGeneratingHealthPdf] = React.useState(false);

  // Check if health declaration is signed
  const isHealthFormSigned = Boolean(healthDeclaration && 
    (healthDeclaration.formStatus === 'signed' || healthDeclaration.form_status === 'signed'));

  console.log("Table row actions:", {
    registrationId: registration.id,
    participantId: registration.participantId,
    hasDeclaration: Boolean(healthDeclaration),
    formStatus: healthDeclaration?.formStatus || healthDeclaration?.form_status,
    isHealthFormSigned,
    healthDeclarationId: healthDeclaration?.id
  });

  // Handle download registration PDF
  const handleGenerateRegPdf = async () => {
    setIsGeneratingRegPdf(true);
    try {
      await generateRegistrationPdf(registration.id);
    } finally {
      setIsGeneratingRegPdf(false);
    }
  };

  // Handle download health declaration PDF
  const handleGenerateHealthPdf = async () => {
    if (!healthDeclaration) {
      console.error("Cannot generate health PDF: Health declaration is missing");
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "הצהרת בריאות לא נמצאה",
      });
      return;
    }
    
    // Check if health declaration is directly for this registration or for its participant
    if (healthDeclaration.participant_id !== registration.id && 
        healthDeclaration.participant_id !== registration.participantId) {
      console.warn(`Health declaration participant_id mismatch: ${healthDeclaration.participant_id} vs registration.id ${registration.id} or participantId ${registration.participantId}`);
    }
    
    setIsGeneratingHealthPdf(true);
    try {
      console.log("Generating health PDF using direct health declaration ID:", healthDeclaration.id);
      // Instead of using registration.id, use the declaration's ID directly
      // This avoids the need to lookup the declaration again in the PDF generation process
      const url = `/printable-health-declaration?id=${healthDeclaration.id}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error generating health PDF:", error);
      toast({
        variant: "destructive",
        title: "שגיאה ביצירת PDF",
        description: error instanceof Error ? error.message : "אירעה שגיאה בהפקת הצהרת הבריאות",
      });
    } finally {
      setIsGeneratingHealthPdf(false);
    }
  };
  
  return (
    <div className="flex gap-2 justify-end">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAddPayment(registration)}
          >
            <CreditCardIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>הוסף תשלום</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGenerateRegPdf}
            disabled={isGeneratingRegPdf}
          >
            {isGeneratingRegPdf ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <FileDownIcon className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>הורד אישור רישום</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={isHealthFormSigned ? handleGenerateHealthPdf : () => onOpenHealthForm && onOpenHealthForm(registration.id)}
            disabled={isHealthFormSigned && isGeneratingHealthPdf}
          >
            {isHealthFormSigned && isGeneratingHealthPdf ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isHealthFormSigned ? 'הורד הצהרת בריאות' : 'הצהרת בריאות'}
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteRegistration(registration.id)}
            disabled={hasPayments}
            className={hasPayments ? "opacity-50 cursor-not-allowed" : ""}
          >
            <Trash2Icon className="h-4 w-4 text-red-500" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {hasPayments
            ? "לא ניתן למחוק רישום עם תשלומים"
            : "מחק רישום"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default TableRowActions;
