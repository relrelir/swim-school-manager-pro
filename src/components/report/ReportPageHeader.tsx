
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Filter } from 'lucide-react';

interface ReportPageHeaderProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onExport: () => void;
}

const ReportPageHeader: React.FC<ReportPageHeaderProps> = ({
  showFilters,
  setShowFilters,
  onExport,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 className="text-2xl font-bold font-alef">דו"ח מאוחד - כל הרישומים</h1>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          <span>{showFilters ? 'הסתר פילטרים' : 'הצג פילטרים'}</span>
        </Button>
        
        <Button 
          onClick={onExport}
          className="flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          <span>ייצוא לאקסל (CSV)</span>
        </Button>
      </div>
    </div>
  );
};

export default ReportPageHeader;
