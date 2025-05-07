
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Registration } from '@/types';
import { Trash2Icon, FileDownIcon, CreditCardIcon, PrinterIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generateRegistrationPdf } from '@/utils/generateRegistrationPdf';
import { generateHealthDeclarationPdf } from '@/utils/generateHealthDeclarationPdf';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

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
  const [isGeneratingRegPdf, setIsGeneratingRegPdf] = useState(false);
  const [isGeneratingHealthPdf, setIsGeneratingHealthPdf] = useState(false);
  const [hasHealthDeclaration, setHasHealthDeclaration] = useState(false);
  const [isCheckingDeclaration, setIsCheckingDeclaration] = useState(false);
  
  // Optimization: Create registrationId and participantId as useMemo to prevent unnecessary calculations
  const registrationId = useMemo(() => registration?.id, [registration?.id]);
  const participantId = useMemo(() => registration?.participantId, [registration?.participantId]);
  
  // Optimization: Use useCallback to prevent unnecessary rerenders
  const checkForHealthDeclaration = useCallback(async () => {
    if (!registrationId || !participantId || isCheckingDeclaration) return;
    
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
  }, [registrationId, participantId, hasHealthDeclaration, isCheckingDeclaration]);
  
  // Optimization: Use useEffect with correct dependencies
  useEffect(() => {
    checkForHealthDeclaration();
  }, [checkForHealthDeclaration]);

  // Optimization: Use useCallback to prevent unnecessary rerenders
  const handleGenerateRegPdf = useCallback(async () => {
    setIsGeneratingRegPdf(true);
    try {
      await generateRegistrationPdf(registrationId);
    } finally {
      setIsGeneratingRegPdf(false);
    }
  }, [registrationId]);
  
  // Optimization: Use useCallback to prevent unnecessary rerenders
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
    
    setIsGeneratingHealthPdf(true);
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
      setIsGeneratingHealthPdf(false);
    }
  }, [registrationId, participantId, registration]);
  
  // Handle delete registration with confirmation - optimized with useCallback
  const handleDeleteRegistration = useCallback(() => {
    if (hasPayments) {
      toast({
        title: "לא ניתן למחוק",
        description: "לא ניתן למחוק רישום שבוצע עבורו תשלום",
        variant: "destructive",
      });
      return;
    }
    
    onDeleteRegistration(registration.id);
  }, [hasPayments, onDeleteRegistration, registration.id]);
  
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
      
      {/* Health Declaration Print Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrintHealthDeclaration}
            disabled={isGeneratingHealthPdf || !hasHealthDeclaration}
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
            onClick={handleDeleteRegistration}
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
