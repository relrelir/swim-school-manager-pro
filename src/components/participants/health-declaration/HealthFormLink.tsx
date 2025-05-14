
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Link, CheckCircle } from "lucide-react";
import { createHealthDeclarationLink } from '@/context/data/healthDeclarations/createHealthDeclarationLink';
import { useAuth } from '@/context/AuthContext';

interface HealthFormLinkProps {
  registrationId: string;
  isDisabled?: boolean;
  className?: string;
}

const HealthFormLink = ({ registrationId, isDisabled, className }: HealthFormLinkProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { isAdmin } = useAuth();
  
  // Only admins can generate links
  if (!isAdmin()) {
    return (
      <Button
        variant="default"
        className={className || "w-full"}
        disabled={true}
      >
        <Link className="h-4 w-4 mr-2" />
        צור קישור להצהרת בריאות
      </Button>
    );
  }
  
  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const link = await createHealthDeclarationLink(registrationId);
      if (link) {
        // Create a full message with the link
        const fullMessage = `שלום!
בית הספר לשחייה ענבר במדבר מזמין אותך למלא את הצהרת הבריאות בקישור הבא:
${link}

יש למלא את הצהרת הבריאות לפני תחילת הפעילות בבריכה.
תודה על שיתוף הפעולה!
צוות ענבר במדבר`;

        // Copy the full message instead of just the link
        await copyToClipboard(fullMessage);
        setIsCopied(true);
        toast({
          title: "ההודעה המלאה הועתקה",
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
    <Button
      variant="default"
      className={className || "w-full"}
      onClick={handleGenerateLink}
      disabled={isGenerating || isDisabled}
    >
      {isGenerating ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
      ) : isCopied ? (
        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
      ) : (
        <Link className="h-4 w-4 mr-2" />
      )}
      צור קישור להצהרת בריאות
    </Button>
  );
};

export default HealthFormLink;
