
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertCircle, Link, FileText } from 'lucide-react';
import { Participant, Registration, HealthDeclaration } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { createHealthDeclarationLink } from '@/context/data/healthDeclarations/createHealthDeclarationLink';
import { useHealthDeclarationsContext } from '@/context/data/HealthDeclarationsProvider';
import { generateHealthDeclarationPdf } from '@/utils/generateHealthDeclarationPdf';

interface TableHealthStatusProps {
  registration: Registration;
  participant?: Participant;
  onUpdateHealthApproval: (isApproved: boolean) => void;
  onOpenHealthForm?: () => void;
}

const TableHealthStatus: React.FC<TableHealthStatusProps> = ({
  registration,
  participant,
  onUpdateHealthApproval,
  onOpenHealthForm
}) => {
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [healthDeclaration, setHealthDeclaration] = useState<HealthDeclaration | undefined>(undefined);
  const [isFormSigned, setIsFormSigned] = useState(false);
  const { getHealthDeclarationForRegistration } = useHealthDeclarationsContext();

  useEffect(() => {
    // Fetch the health declaration when component mounts or registration changes
    const fetchHealthDeclaration = async () => {
      if (registration?.id) {
        try {
          const declaration = await getHealthDeclarationForRegistration(registration.id);
          setHealthDeclaration(declaration);
          
          // Check if the form is signed
          const signed = Boolean(
            declaration && 
            (declaration.formStatus === 'signed' || declaration.form_status === 'signed')
          );
          setIsFormSigned(signed);
          
          console.log("Health declaration status in TableHealthStatus:", {
            registrationId: registration.id,
            participantId: registration.participantId,
            hasDeclaration: Boolean(declaration),
            formStatus: declaration?.formStatus || declaration?.form_status,
            isFormSigned: signed,
            healthDeclarationId: declaration?.id
          });
        } catch (error) {
          console.error("Error fetching health declaration:", error);
        }
      }
    };
    
    fetchHealthDeclaration();
  }, [registration?.id, getHealthDeclarationForRegistration]);

  if (!participant) return null;
  
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
  
  // Handle generate PDF
  const handleGeneratePDF = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateHealthDeclarationPdf(participant.id);
      toast({
        title: "PDF נוצר בהצלחה",
        description: "הצהרת הבריאות נשמרה במכשיר שלך",
      });
    } catch (error) {
      console.error('Error generating health declaration PDF:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת ה-PDF",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
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
      
      {/* Link Button */}
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
      
      {/* PDF Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600 flex items-center border-red-200 hover:border-red-400"
            onClick={handleGeneratePDF}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ml-1" />
            ) : (
              <FileText className="h-4 w-4 ml-1" />
            )}
            צור PDF
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          צור קובץ PDF של הצהרת הבריאות
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default TableHealthStatus;
