
import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { UserPlus, FileDown, Printer } from 'lucide-react';

interface ParticipantsHeaderProps {
  product: Product | undefined;
  onExport: () => void;
  onAddParticipant: () => void;
  onGenerateReport?: () => void;
}

const ParticipantsHeader: React.FC<ParticipantsHeaderProps> = ({
  product,
  onExport,
  onAddParticipant,
  onGenerateReport
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
      <h1 className="text-2xl font-bold">
        {product ? `משתתפים: ${product.name}` : 'רשימת משתתפים'}
      </h1>
      
      <div className="flex flex-wrap space-x-2 space-y-2 md:space-y-0">
        <Button 
          variant="outline"
          onClick={onExport} 
          className="flex items-center"
        >
          <FileDown className="mr-2 h-4 w-4" />
          ייצוא CSV
        </Button>
        
        {onGenerateReport && (
          <Button 
            variant="outline"
            onClick={onGenerateReport} 
            className="flex items-center mr-2"
          >
            <Printer className="mr-2 h-4 w-4" />
            ייצוא PDF
          </Button>
        )}
        
        <Button 
          onClick={onAddParticipant} 
          className="flex items-center mr-2"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          הוספת משתתף
        </Button>
      </div>
    </div>
  );
};

export default ParticipantsHeader;
