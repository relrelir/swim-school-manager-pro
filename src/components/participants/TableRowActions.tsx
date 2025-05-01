
import React from 'react';
import { Button } from '@/components/ui/button';
import { Registration } from '@/types';
import { Trash2Icon, FileDownIcon, CreditCardIcon, PrinterIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generateRegistrationPdf } from '@/utils/generateRegistrationPdf';
import { generateHealthDeclarationPdf } from '@/utils/generateHealthDeclarationPdf';
import { useHealthDeclarationsContext } from '@/context/data/HealthDeclarationsProvider';

interface TableRowActionsProps {
  registration: Registration;
  hasPayments: boolean;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (registrationId: string) => void;
}

const TableRowActions: React.FC<TableRowActionsProps> = ({
  registration,
  hasPayments,
  onAddPayment,
  onDeleteRegistration,
}) => {
  const [isGeneratingRegPdf, setIsGeneratingRegPdf] = React.useState(false);
  const [isGeneratingHealthPdf, setIsGeneratingHealthPdf] = React.useState(false);
  const { getHealthDeclarationForRegistration } = useHealthDeclarationsContext();

  // Handle download registration PDF
  const handleGenerateRegPdf = async () => {
    setIsGeneratingRegPdf(true);
    try {
      await generateRegistrationPdf(registration.id);
    } finally {
      setIsGeneratingRegPdf(false);
    }
  };
  
  // Handle print health declaration PDF
  const handlePrintHealthDeclaration = async () => {
    if (!registration || !registration.id) {
      console.error("Cannot generate PDF: Invalid registration", registration);
      return;
    }
    
    setIsGeneratingHealthPdf(true);
    try {
      console.log("Looking for health declaration for registration ID:", registration.id);
      const healthDeclaration = getHealthDeclarationForRegistration(registration.id);
      
      if (!healthDeclaration || !healthDeclaration.id) {
        console.error("Health declaration not found for registration:", registration.id);
        return;
      }
      
      console.log("Generating PDF for health declaration ID:", healthDeclaration.id);
      await generateHealthDeclarationPdf(healthDeclaration.id);
    } catch (error) {
      console.error("Error generating health declaration PDF:", error);
    } finally {
      setIsGeneratingHealthPdf(false);
    }
  };
  
  // Check if a health declaration exists for this registration
  const healthDeclaration = getHealthDeclarationForRegistration(registration.id);
  const hasHealthDeclaration = Boolean(healthDeclaration && healthDeclaration.id);
  
  console.log("Registration", registration.id, "has health declaration:", hasHealthDeclaration, healthDeclaration);
  
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
      
      {/* Health Declaration Print Button - Always visible */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrintHealthDeclaration}
            disabled={isGeneratingHealthPdf || !hasHealthDeclaration}
            className={!hasHealthDeclaration ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isGeneratingHealthPdf ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <PrinterIcon className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {hasHealthDeclaration ? "הדפס הצהרת בריאות" : "אין הצהרת בריאות"}
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
