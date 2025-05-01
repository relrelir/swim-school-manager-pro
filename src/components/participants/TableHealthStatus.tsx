
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertCircle, Printer, Link } from 'lucide-react';
import { Participant, Registration, HealthDeclaration } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { generateHealthDeclarationPdf } from '@/utils/generateHealthDeclarationPdf';
import { createHealthDeclarationLink } from '@/context/data/healthDeclarations/createHealthDeclarationLink';

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
  const [isGeneratingLink, setIsGeneratingLink] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  if (!participant) return null;

  // Check if the form is signed (completed)
  const isFormSigned = Boolean(
    healthDeclaration && 
    (healthDeclaration.formStatus === 'signed' || healthDeclaration.form_status === 'signed')
  );
  
  console.log("Health declaration status in TableHealthStatus:", {
    registrationId: registration.id,
    participantId: registration.participantId,
    hasDeclaration: Boolean(healthDeclaration),
    healthDeclarationObj: healthDeclaration,
    formStatus: healthDeclaration?.formStatus || healthDeclaration?.form_status,
    isFormSigned,
    healthDeclarationId: healthDeclaration?.id
  });
  
  // Handle print health declaration
  const handlePrintHealthDeclaration = async () => {
    if (!healthDeclaration) {
      console.error("Cannot generate PDF: Health declaration is missing");
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "הצהרת הבריאות לא נמצאה",
      });
      return;
    }
    
    setIsGeneratingPdf(true);
    try {
      console.log("Generating PDF for health declaration ID:", healthDeclaration.id);
      await generateHealthDeclarationPdf(healthDeclaration.id);
      console.log("PDF generated successfully");
    } catch (error) {
      console.error("Error generating health declaration PDF:", error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת קובץ PDF",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  
  // Handle generate health declaration link
  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);
    try {
      const link = await createHealthDeclarationLink(registration.id);
      if (link) {
        await copyToClipboard(link);
        setIsCopied(true);
        toast({
          title: "הקישור הועתק",
          description: "הקישור להצהרת הבריאות הועתק ללוח",
        });
        
        // Reset copied state after 3 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error generating health form link:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת הקישור",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Helper function to copy text to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
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
      
      {/* Link Button - Always visible */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-blue-500 hover:text-blue-600 flex items-center border-blue-200 hover:border-blue-400"
            onClick={handleGenerateLink}
            disabled={isGeneratingLink}
          >
            {isGeneratingLink ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ml-1" />
            ) : isCopied ? (
              <CheckCircle className="h-4 w-4 ml-1 text-green-500" />
            ) : (
              <Link className="h-4 w-4 ml-1" />
            )}
            צור לינק
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          צור וקבל קישור להצהרת בריאות
        </TooltipContent>
      </Tooltip>
      
      {/* Print Button - Always visible when a health declaration exists */}
      {healthDeclaration && healthDeclaration.id && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-green-500 hover:text-green-600 flex items-center border-green-200 hover:border-green-400"
              onClick={handlePrintHealthDeclaration}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ml-1" />
              ) : (
                <Printer className="h-4 w-4 ml-1" />
              )}
              הדפס הצהרה
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            הדפס הצהרת בריאות
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default TableHealthStatus;
