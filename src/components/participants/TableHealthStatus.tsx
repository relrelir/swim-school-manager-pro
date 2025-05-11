
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertCircle, Link } from 'lucide-react';
import { Participant, Registration, HealthDeclaration } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { createHealthDeclarationLink } from '@/context/data/healthDeclarations/createHealthDeclarationLink';
import { useHealthDeclarationsContext } from '@/context/data/HealthDeclarationsProvider';
import { useAuth } from '@/context/AuthContext';

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
  const [isCopied, setIsCopied] = useState(false);
  const [healthDeclaration, setHealthDeclaration] = useState<HealthDeclaration | undefined>(undefined);
  const [isFormSigned, setIsFormSigned] = useState(false);
  const { getHealthDeclarationForRegistration } = useHealthDeclarationsContext();
  const { isAdmin } = useAuth();

  // אופטימיזציה: שימוש ב-useMemo ותנאי מחמיר יותר
  const registrationId = useMemo(() => registration?.id, [registration?.id]);

  // אופטימיזציה: שימוש ב-useCallback למניעת רינדורים מיותרים
  const fetchHealthDeclaration = useCallback(async () => {
    if (!registrationId) return;
    
    try {
      const declaration = await getHealthDeclarationForRegistration(registrationId);
      if (declaration?.id !== healthDeclaration?.id) {
        setHealthDeclaration(declaration);
        
        // Check if the form is signed
        const signed = Boolean(
          declaration && 
          (declaration.formStatus === 'signed' || declaration.form_status === 'signed')
        );
        setIsFormSigned(signed);
      }
    } catch (error) {
      console.error("Error fetching health declaration:", error);
    }
  }, [registrationId, getHealthDeclarationForRegistration, healthDeclaration?.id]);

  // אופטימיזציה: שימוש ב-useEffect עם תלויות נכונות
  useEffect(() => {
    fetchHealthDeclaration();
  }, [fetchHealthDeclaration]);

  if (!participant) return null;
  
  // אופטימיזציה: שימוש ב-useCallback למניעת רינדורים מיותרים
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

  // אופטימיזציה: שימוש ב-useCallback למניעת רינדורים מיותרים
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    }
  };

  // הפחתת מספר האלמנטים המרונדרים
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
      
      {/* Link Button - Now checks if user is admin */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-blue-500 hover:text-blue-600 flex items-center border-blue-200 hover:border-blue-400"
            onClick={handleGenerateLink}
            disabled={isGeneratingLink || !isAdmin()}
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
          {isAdmin() 
            ? "צור וקבל קישור להצהרת בריאות" 
            : "רק מנהל יכול ליצור קישור להצהרת בריאות"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default TableHealthStatus;
