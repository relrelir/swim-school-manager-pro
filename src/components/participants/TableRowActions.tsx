
import React from 'react';
import { Button } from '@/components/ui/button';
import { Registration, HealthDeclaration } from '@/types';
import { Trash2Icon, FileDownIcon, CreditCardIcon, FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generateRegistrationPdf } from '@/utils/generateRegistrationPdf';
import { generateHealthDeclarationPdf } from '@/utils/generateHealthDeclarationPdf';

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
  const isHealthFormSigned = healthDeclaration && 
    (healthDeclaration.formStatus === 'signed' || healthDeclaration.form_status === 'signed');

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
    setIsGeneratingHealthPdf(true);
    try {
      await generateHealthDeclarationPdf(registration.id);
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
      
      {isHealthFormSigned ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGenerateHealthPdf}
              disabled={isGeneratingHealthPdf}
            >
              {isGeneratingHealthPdf ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>הורד הצהרת בריאות</TooltipContent>
        </Tooltip>
      ) : onOpenHealthForm && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenHealthForm(registration.id)}
            >
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>הצהרת בריאות</TooltipContent>
        </Tooltip>
      )}
      
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
