
import React from 'react';
import { Button } from '@/components/ui/button';
import { Registration, HealthDeclaration } from '@/types';
import { Trash2Icon, FileDownIcon, CreditCardIcon, FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generateRegistrationPdf } from '@/utils/generateRegistrationPdf';
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

  // Check if health declaration is signed
  const isHealthFormSigned = Boolean(healthDeclaration && 
    (healthDeclaration.formStatus === 'signed' || healthDeclaration.form_status === 'signed'));

  console.log("TableRowActions health info:", {
    registrationId: registration.id,
    participantId: registration.participantId,
    hasDeclaration: Boolean(healthDeclaration),
    healthDeclarationObj: healthDeclaration,
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

  // Handle health form action
  const handleHealthAction = () => {
    if (!isHealthFormSigned) {
      // Open health form if not signed
      if (onOpenHealthForm) {
        onOpenHealthForm(registration.id);
      }
    } else if (healthDeclaration) {
      // If signed, open the printable page
      const url = `/printable-health-declaration?id=${healthDeclaration.id}`;
      console.log("Opening printable health declaration from TableRowActions:", url);
      window.open(url, '_blank');
    } else {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "הצהרת בריאות לא נמצאה",
      });
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
            variant={isHealthFormSigned ? "ghost" : "outline"} 
            size={isHealthFormSigned ? "icon" : "sm"}
            onClick={handleHealthAction}
            className={isHealthFormSigned ? "" : "text-amber-500 border-amber-200"}
          >
            <FileText className="h-4 w-4" />
            {!isHealthFormSigned && <span className="mr-1">הצהרת בריאות</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isHealthFormSigned ? 'הדפס הצהרת בריאות' : 'מלא הצהרת בריאות'}
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
