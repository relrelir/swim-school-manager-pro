
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PrinterIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Registration } from '@/types';
import { generateHealthDeclarationPdf } from '@/utils/generateHealthDeclarationPdf';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

interface HealthDeclarationButtonProps {
  registration: Registration;
}

const HealthDeclarationButton: React.FC<HealthDeclarationButtonProps> = ({
  registration
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasHealthDeclaration, setHasHealthDeclaration] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const registrationId = useMemo(() => registration?.id, [registration?.id]);
  const participantId = useMemo(() => registration?.participantId, [registration?.participantId]);

  const checkForHealthDeclaration = useCallback(async () => {
    if (!registrationId || !participantId || isChecking) return;
    
    try {
      setIsChecking(true);
      
      const { data, error } = await supabase
        .from('health_declarations')
        .select('id')
        .eq('participant_id', participantId)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking for health declaration:", error);
        return;
      }
      
      const declarationExists = Boolean(data?.id);
      if (hasHealthDeclaration !== declarationExists) {
        setHasHealthDeclaration(declarationExists);
      }
    } catch (error) {
      console.error("Error checking for health declaration:", error);
    } finally {
      setIsChecking(false);
    }
  }, [registrationId, participantId, hasHealthDeclaration, isChecking]);

  useEffect(() => {
    checkForHealthDeclaration();
  }, [checkForHealthDeclaration]);

  const handlePrintHealthDeclaration = useCallback(async () => {
    if (!registration || !registrationId || !participantId) {
      console.error("Cannot generate PDF: Invalid registration", registration);
      toast({
        title: "שגיאה",
        description: "פרטי הרישום אינם תקינים",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
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
      setIsGenerating(false);
    }
  }, [registrationId, participantId, registration]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrintHealthDeclaration}
          disabled={isGenerating || !hasHealthDeclaration}
        >
          {isGenerating ? (
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
