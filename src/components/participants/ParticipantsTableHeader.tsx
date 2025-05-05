
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ParticipantsTableHeaderProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const ParticipantsTableHeader: React.FC<ParticipantsTableHeaderProps> = ({ 
  searchQuery, 
  setSearchQuery 
}) => {
  return (
    <div className="flex justify-end mb-4">
      <div className="relative max-w-md w-full">
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="חיפוש לפי שם, ת.ז או טלפון..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>
    </div>
  );
};

export default ParticipantsTableHeader;
