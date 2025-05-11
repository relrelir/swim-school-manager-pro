
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PrinterIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generateHealthDeclarationPdf } from '@/utils/generateHealthDeclarationPdf';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

interface HealthDeclarationButtonProps {
  registrationId: string;
  participantId: string;
}

const HealthDeclarationButton: React.FC<HealthDeclarationButtonProps> = ({
  registrationId,
  participantId,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [hasHealthDeclaration, setHasHealthDeclaration] = useState(false);
  const [isCheckingDeclaration, setIsCheckingDeclaration] = useState(false);

  // Check for health declaration
  const checkForHealthDeclaration = useCallback(async () => {
    if (!participantId || isCheckingDeclaration) return;
    
    try {
      setIsCheckingDeclaration(true);
      
      // Direct Supabase query to get the latest health declaration status
      const { data, error } = await supabase
        .from('health_declarations')
        .select('id')
        .eq('participant_id', participantId)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking for health declaration:", error);
        return;
      }
      
      // Update state only if changed
      const declarationExists = Boolean(data?.id);
      if (hasHealthDeclaration !== declarationExists) {
        setHasHealthDeclaration(declarationExists);
      }
    } catch (error) {
      console.error("Error checking for health declaration:", error);
    } finally {
      setIsCheckingDeclaration(false);
    }
  }, [participantId, hasHealthDeclaration, isCheckingDeclaration]);
  
  // Check for health declaration when component mounts or participantId changes
  useEffect(() => {
    checkForHealthDeclaration();
  }, [checkForHealthDeclaration]);

  // Handle printing health declaration
  const handlePrintHealthDeclaration = useCallback(async () => {
    if (!registrationId || !participantId) {
      console.error("Cannot generate PDF: Invalid registration or participant ID");
      toast({
        title: "שגיאה",
        description: "פרטי הרישום אינם תקינים",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingPdf(true);
    try {
      await generateHealthDeclarationPdf(participantId);
      
      toast({
        title: "הצהרת הבריאות נוצרה בהצלחה",
        description: "המסמך נשמר למכשיר שלך"
      });
    } catch (error) {
      console.error("Error generating health declaration PDF:", error);
      toast({
        title: "שגיאה ביצירת הצהרת בריאות",
        description: "אירעה שגיאה בעת יצירת המסמך",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [registrationId, participantId]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrintHealthDeclaration}
          disabled={isGeneratingPdf || !hasHealthDeclaration}
        >
          {isGeneratingPdf ? (
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
  );
};

export default HealthDeclarationButton;
