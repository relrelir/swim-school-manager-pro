
import React from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyParticipantsStateProps {
  onExport?: () => void;
}

const EmptyParticipantsState: React.FC<EmptyParticipantsStateProps> = ({ onExport }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-card rounded-lg shadow-card">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-primary">אין משתתפים עדיין</h2>
        <p className="text-muted-foreground max-w-md">
          עדיין לא נרשמו משתתפים למוצר זה. ניתן להוסיף משתתפים חדשים או לייבא רשימה קיימת.
        </p>
      </div>
      
      {onExport && (
        <div className="mt-6">
          <Button 
            variant="outline"
            onClick={onExport} 
            className="flex items-center"
          >
            <FileDown className="mr-2 h-4 w-4" />
            ייבא משתתפים
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyParticipantsState;
