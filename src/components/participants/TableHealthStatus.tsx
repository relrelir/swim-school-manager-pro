
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertCircle, FileText, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Participant, Registration, HealthDeclaration } from '@/types';
import HealthFormLink from './health-declaration/HealthFormLink';
import { generateHealthDeclarationPdf } from '@/utils/generateHealthDeclarationPdf';

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
  onOpenHealthForm
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);

  if (!participant) return null;

  // Check if the form is signed (completed)
  const isFormSigned = healthDeclaration && 
    (healthDeclaration.formStatus === 'signed' || healthDeclaration.form_status === 'signed');
  
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateHealthDeclarationPdf(registration.id);
    } finally {
      setIsGeneratingPdf(false);
    }
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
      
      {isFormSigned ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-500 hover:text-blue-600"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
              ) : (
                <FileText className="h-4 w-4 mr-1" />
              )}
              הורד PDF
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            הורד הצהרת בריאות
          </TooltipContent>
        </Tooltip>
      ) : (
        <HealthFormLink 
          registrationId={registration.id} 
          isDisabled={isFormSigned || false} 
        />
      )}
    </div>
  );
};

export default TableHealthStatus;
