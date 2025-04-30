
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Participant, Registration, HealthDeclaration } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TableHealthStatusProps {
  registration: Registration;
  participant?: Participant;
  healthDeclaration?: HealthDeclaration;
  onOpenHealthForm: (registrationId: string) => void;
  onUpdateHealthApproval: (registrationId: string, isApproved: boolean) => void;
}

const TableHealthStatus: React.FC<TableHealthStatusProps> = ({
  registration,
  participant,
  healthDeclaration,
  onOpenHealthForm,
  onUpdateHealthApproval
}) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const baseUrl = window.location.origin;
  const healthFormUrl = `${baseUrl}/health-form?id=${healthDeclaration?.id || ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(healthFormUrl);
    toast({
      title: "הלינק הועתק",
      description: "הלינק להצהרת הבריאות הועתק ללוח",
    });
  };

  if (!participant) return null;

  return (
    <div className="flex items-center gap-2">
      {participant.healthApproval ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </TooltipTrigger>
          <TooltipContent>
            אישור בריאות התקבל
          </TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </TooltipTrigger>
          <TooltipContent>
            אישור בריאות חסר
          </TooltipContent>
        </Tooltip>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        className={cn("flex items-center")}
        onClick={() => setIsLinkDialogOpen(true)}
      >
        <Send className="h-4 w-4 mr-1" />
        שלח
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          participant.healthApproval ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600"
        )}
        onClick={() => onUpdateHealthApproval(registration.id, !participant.healthApproval)}
      >
        {participant.healthApproval ? 'בטל אישור' : 'סמן כמאושר'}
      </Button>

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>לינק להצהרת בריאות</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="text-sm">
              העתק את הלינק ושלח למשתתף בוואטסאפ:
            </div>
            <div className="flex gap-2">
              <Input
                value={healthFormUrl}
                readOnly
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1"
              />
              <Button onClick={handleCopyLink}>העתק</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              כאשר המשתתף ימלא את הטופס, אישור הבריאות יעודכן אוטומטית במערכת.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableHealthStatus;
