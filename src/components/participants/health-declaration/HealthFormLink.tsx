
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Link, Copy } from 'lucide-react';

interface HealthFormLinkProps {
  healthFormUrl: string;
  participantName: string;
  formStatus?: string;
}

const HealthFormLink: React.FC<HealthFormLinkProps> = ({ 
  healthFormUrl, 
  participantName, 
  formStatus 
}) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(healthFormUrl);
    toast({
      title: "הלינק הועתק",
      description: "הלינק להצהרת הבריאות הועתק ללוח",
    });
  };

  // Helper function to get status display text and color
  const getStatusDisplay = (status?: string) => {
    if (!status) return { text: 'ממתין', color: 'text-amber-500' };
    
    // Safe comparison with string literals
    if (status === 'completed') return { text: 'הושלם', color: 'text-green-500' };
    if (status === 'signed') return { text: 'חתום', color: 'text-green-500' };
    if (status === 'sent') return { text: 'נשלח', color: 'text-blue-500' };
    if (status === 'expired') return { text: 'פג תוקף', color: 'text-red-500' };
    return { text: 'ממתין', color: 'text-amber-500' };
  };

  // Get status display properties
  const statusDisplay = getStatusDisplay(formStatus);

  return (
    <div className="grid gap-4 py-4">
      <div className="text-sm">
        הצהרת בריאות עבור: <span className="font-bold">{participantName}</span>
      </div>
      <div className="text-sm">
        העתק את הלינק ושלח למשתתף בוואטסאפ/מייל:
      </div>
      <div className="flex gap-2">
        <Input
          value={healthFormUrl}
          readOnly
          onClick={(e) => (e.target as HTMLInputElement).select()}
          className="flex-1 text-right"
        />
        <Button onClick={handleCopyLink}>
          <Copy className="h-4 w-4 mr-1" />
          העתק
        </Button>
      </div>
      <div className="flex items-center justify-center mt-2">
        <div className="bg-muted p-3 rounded-md flex items-center gap-2">
          <Link className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm">
            סטטוס הצהרה: 
            <span className={`font-medium ml-1 ${statusDisplay.color}`}>
              {statusDisplay.text}
            </span>
          </span>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        כאשר המשתתף ימלא את הטופס, אישור הבריאות יעודכן אוטומטית במערכת.
      </div>
    </div>
  );
};

export default HealthFormLink;
