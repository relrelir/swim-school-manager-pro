
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FileDownIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generateRegistrationPdf } from '@/utils/generateRegistrationPdf';

interface RegistrationPdfButtonProps {
  registrationId: string;
}

const RegistrationPdfButton: React.FC<RegistrationPdfButtonProps> = ({
  registrationId
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePdf = useCallback(async () => {
    setIsGenerating(true);
    try {
      await generateRegistrationPdf(registrationId);
    } finally {
      setIsGenerating(false);
    }
  }, [registrationId]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGeneratePdf}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <FileDownIcon className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>הורד אישור רישום</TooltipContent>
    </Tooltip>
  );
};

export default RegistrationPdfButton;
