
import React from 'react';
import { TableRow, TableHead } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from 'lucide-react';

interface SeasonProductsTableHeaderProps {
  sortField: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: string) => void;
}

const SeasonProductsTableHeader: React.FC<SeasonProductsTableHeaderProps> = ({
  sortField,
  sortDirection,
  handleSort
}) => {
  const renderSortIcon = (field: string) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? 
        <ChevronUp className="h-4 w-4 mr-1" /> : 
        <ChevronDown className="h-4 w-4 mr-1" />;
    }
    return null;
  };

  return (
    <TableRow>
      <TableHead 
        className="cursor-pointer" 
        onClick={() => handleSort('name')}
      >
        <div className="flex items-center justify-end">
          שם {renderSortIcon('name')}
        </div>
      </TableHead>
      <TableHead 
        className="cursor-pointer" 
        onClick={() => handleSort('type')}
      >
        <div className="flex items-center justify-end">
          סוג {renderSortIcon('type')}
        </div>
      </TableHead>
      <TableHead 
        className="cursor-pointer" 
        onClick={() => handleSort('price')}
      >
        <div className="flex items-center justify-end">
          מחיר {renderSortIcon('price')}
        </div>
      </TableHead>
      <TableHead 
        className="cursor-pointer" 
        onClick={() => handleSort('startDate')}
      >
        <div className="flex items-center justify-end">
          תאריך התחלה {renderSortIcon('startDate')}
        </div>
      </TableHead>
      <TableHead 
        className="cursor-pointer" 
        onClick={() => handleSort('endDate')}
      >
        <div className="flex items-center justify-end">
          תאריך סיום {renderSortIcon('endDate')}
        </div>
      </TableHead>
      <TableHead>ימי פעילות</TableHead>
      <TableHead>שעת התחלה</TableHead>
      <TableHead>מפגש</TableHead>
      <TableHead 
        className="cursor-pointer" 
        onClick={() => handleSort('maxParticipants')}
      >
        <div className="flex items-center justify-end">
          משתתפים {renderSortIcon('maxParticipants')}
        </div>
      </TableHead>
      <TableHead>פעולות</TableHead>
    </TableRow>
  );
};

export default SeasonProductsTableHeader;
