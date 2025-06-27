
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Registration } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';

interface EditParticipantButtonProps {
  registration: Registration;
  onEditParticipant?: (registration: Registration) => void;
}

const EditParticipantButton: React.FC<EditParticipantButtonProps> = ({
  registration,
  onEditParticipant
}) => {
  const { isAdmin } = useAuth();

  const handleEditParticipant = useCallback(() => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה לערוך משתתף",
        variant: "destructive",
      });
      return;
    }
    
    if (onEditParticipant) {
      onEditParticipant(registration);
    }
  }, [isAdmin, onEditParticipant, registration]);

  if (!isAdmin()) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEditParticipant}
        >
          <Edit className="h-4 w-4 text-blue-500" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>ערוך משתתף</TooltipContent>
    </Tooltip>
  );
};

export default EditParticipantButton;
