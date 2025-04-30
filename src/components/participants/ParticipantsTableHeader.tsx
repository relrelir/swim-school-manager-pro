
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ParticipantsTableHeaderProps {
  onExport?: () => void;
}

const ParticipantsTableHeader: React.FC<ParticipantsTableHeaderProps> = ({ 
  onExport 
}) => {
  if (!onExport) return null;
  
  return (
    <div className="flex justify-end mb-4">
      <Button onClick={onExport} variant="outline" size="sm" className="flex items-center gap-1">
        <Download className="h-4 w-4" />
        ייצא לקובץ CSV
      </Button>
    </div>
  );
};

export default ParticipantsTableHeader;
