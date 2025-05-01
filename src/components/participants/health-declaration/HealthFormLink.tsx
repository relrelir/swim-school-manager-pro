
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LinkIcon, CheckIcon } from "lucide-react";
import { createHealthDeclarationLink } from '@/context/data/healthDeclarations/service';

interface HealthFormLinkProps {
  registrationId: string;
  isDisabled: boolean;
}

const HealthFormLink = ({ registrationId, isDisabled }: HealthFormLinkProps) => {
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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center"
          onClick={handleGenerateLink}
          disabled={isDisabled || isGenerating}
        >
          {isGenerating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : isCopied ? (
            <CheckIcon className="h-4 w-4 mr-1 text-green-500" />
          ) : (
            <LinkIcon className="h-4 w-4 mr-1" />
          )}
          קבל לינק
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isDisabled ? "טופס כבר מולא" : "יצירת קישור למילוי הצהרת בריאות"}
      </TooltipContent>
    </Tooltip>
  );
};

export default HealthFormLink;
