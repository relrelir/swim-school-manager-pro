
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LinkIcon, CheckIcon, Printer } from "lucide-react";
import { createHealthDeclarationLink } from '@/context/data/healthDeclarations/createHealthDeclarationLink';

interface HealthFormLinkProps {
  registrationId: string;
  isDisabled: boolean;
  declarationId?: string;
  className?: string;
}

const HealthFormLink = ({ registrationId, isDisabled, declarationId, className }: HealthFormLinkProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const link = await createHealthDeclarationLink(registrationId);
      if (link) {
        await copyToClipboard(link);
        setIsCopied(true);
        toast({
          title: "הקישור הועתק",
          description: "הדבק ושלח ללקוח",
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
      setIsGenerating(false);
    }
  };
  
  const handlePrintDeclaration = () => {
    if (!declarationId) {
      toast({
        title: "שגיאה",
        description: "לא נמצא מזהה להצהרת הבריאות",
        variant: "destructive",
      });
      return;
    }
    
    const printUrl = `/printable-health-declaration?id=${declarationId}`;
    console.log("Opening printable form at:", printUrl, "Declaration ID:", declarationId);
    window.open(printUrl, '_blank', 'noopener,noreferrer');
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    }
  };
  
  // This component is now only used in the HealthDeclarationForm dialog
  // It will only show the "Generate Link" functionality
  return (
    <Button
      variant="default"
      className={className || "w-full"}
      onClick={handleGenerateLink}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
      ) : isCopied ? (
        <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
      ) : (
        <LinkIcon className="h-4 w-4 mr-2" />
      )}
      צור קישור להצהרת בריאות
    </Button>
  );
};

export default HealthFormLink;
