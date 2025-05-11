
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";

interface DeleteRegistrationButtonProps {
  registrationId: string;
  hasPayments: boolean;
  onDeleteRegistration: (registrationId: string) => void;
}

const DeleteRegistrationButton: React.FC<DeleteRegistrationButtonProps> = ({
  registrationId,
  hasPayments,
  onDeleteRegistration,
}) => {
  // Handle delete registration with confirmation
  const handleDeleteRegistration = () => {
    if (hasPayments) {
      toast({
        title: "לא ניתן למחוק",
        description: "לא ניתן למחוק רישום שבוצע עבורו תשלום",
        variant: "destructive",
      });
      return;
    }
    
    onDeleteRegistration(registrationId);
  };

  return (
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
  );
};

export default DeleteRegistrationButton;
