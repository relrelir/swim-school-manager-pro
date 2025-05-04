
import React from 'react';
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";

interface CreateHealthFormProps {
  participantName: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const CreateHealthForm: React.FC<CreateHealthFormProps> = ({
  participantName,
  isLoading,
  onSubmit
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-gray-500 mb-2">
          יצירת טופס הצהרת בריאות עבור {participantName}
        </p>
        <p className="text-sm mb-4">
          לחץ על הכפתור להלן כדי ליצור קישור ייחודי להצהרת בריאות. הקישור יועתק ללוח.
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'יוצר קישור...' : (
            <>
              <LinkIcon className="h-4 w-4 mr-2" />
              צור קישור להצהרת בריאות
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateHealthForm;
