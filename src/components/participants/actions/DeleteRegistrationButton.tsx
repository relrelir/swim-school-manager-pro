
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Registration } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';

interface DeleteRegistrationButtonProps {
  registration: Registration;
  hasPayments: boolean;
  onDeleteRegistration: (registrationId: string) => void;
}

const DeleteRegistrationButton: React.FC<DeleteRegistrationButtonProps> = ({
  registration,
  hasPayments,
  onDeleteRegistration
}) => {
  const { isAdmin } = useAuth();

  const handleDeleteRegistration = useCallback(() => {
    if (hasPayments) {
      toast({
        title: "לא ניתן למחוק",
        description: "לא ניתן למחוק רישום שבוצע עבורו תשלום",
        variant: "destructive",
      });
      return;
    }
    
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה למחוק רישום",
        variant: "destructive",
      });
      return;
    }
    
    onDeleteRegistration(registration.id);
  }, [hasPayments, onDeleteRegistration, registration.id, isAdmin]);

  if (!isAdmin()) return null;

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
