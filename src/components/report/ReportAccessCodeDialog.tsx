
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { KeyRound } from 'lucide-react';

interface ReportAccessCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ACCESS_CODE = '1986';

const ReportAccessCodeDialog: React.FC<ReportAccessCodeDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accessCode === ACCESS_CODE) {
      // Set a session storage flag to remember the user has entered the correct code
      sessionStorage.setItem('reportAccessGranted', 'true');
      setError(false);
      onSuccess();
      toast({
        title: "גישה אושרה",
        description: "הגישה לדוח הרישומים אושרה בהצלחה",
      });
    } else {
      setError(true);
      toast({
        title: "קוד שגוי",
        description: "קוד הגישה שהוזן שגוי, אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            גישה לדוח רישומים
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              דוח הרישומים מכיל מידע רגיש. אנא הזן את קוד הגישה לצפייה בדוח.
            </p>
            
            <div className="space-y-2">
              <Input
                placeholder="הזן קוד גישה"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                type="password"
                className={error ? "border-red-500" : ""}
              />
              {error && (
                <p className="text-red-500 text-sm">קוד גישה שגוי</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit">
              אישור
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportAccessCodeDialog;
