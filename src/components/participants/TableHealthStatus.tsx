
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertCircle, Printer } from 'lucide-react';
import { Participant, Registration, HealthDeclaration } from '@/types';
import { toast } from "@/components/ui/use-toast";

interface TableHealthStatusProps {
  registration: Registration;
  participant?: Participant;
  healthDeclaration?: HealthDeclaration;
  onUpdateHealthApproval: (isApproved: boolean) => void;
  onOpenHealthForm?: () => void;
}

const TableHealthStatus: React.FC<TableHealthStatusProps> = ({
  registration,
  participant,
  healthDeclaration,
  onUpdateHealthApproval,
  onOpenHealthForm
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);

  if (!participant) return null;

  // Check if the form is signed (completed)
  const isFormSigned = Boolean(
    healthDeclaration && 
    (healthDeclaration.formStatus === 'signed' || healthDeclaration.form_status === 'signed')
  );
  
  console.log("Health declaration status:", {
    registrationId: registration.id,
    participantId: registration.participantId,
    hasDeclaration: Boolean(healthDeclaration),
    formStatus: healthDeclaration?.formStatus || healthDeclaration?.form_status,
    isFormSigned,
    healthDeclarationId: healthDeclaration?.id
  });
  
  // Open the printable health declaration page in a new tab
  const handleOpenPrintablePage = () => {
    if (!healthDeclaration) {
      console.error("Cannot open printable page: Health declaration is missing");
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "הצהרת הבריאות לא נמצאה",
      });
      return;
    }
    
    const url = `/printable-health-declaration?id=${healthDeclaration.id}`;
    console.log("Opening printable health declaration:", url, "Health declaration:", healthDeclaration);
    window.open(url, '_blank');
  };

  return (
    <div className="flex items-center gap-2">
      {participant.healthApproval ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </TooltipTrigger>
          <TooltipContent>
            אישור בריאות התקבל
          </TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </TooltipTrigger>
          <TooltipContent>
            אישור בריאות חסר
          </TooltipContent>
        </Tooltip>
      )}
      
      {/* Show action button based on health declaration status */}
      {isFormSigned ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-500 hover:text-blue-600 flex items-center border-blue-200 hover:border-blue-400"
              onClick={handleOpenPrintablePage}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
              ) : (
                <Printer className="h-4 w-4 mr-1" />
              )}
              הדפס
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            הדפס הצהרת בריאות
          </TooltipContent>
        </Tooltip>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenHealthForm}
          className="text-amber-500 hover:text-amber-600 border-amber-200 hover:border-amber-400"
        >
          מלא הצהרה
        </Button>
      )}
    </div>
  );
};

export default TableHealthStatus;
