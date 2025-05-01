
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface HealthDeclarationContentProps {
  participantName: string;
  participantId?: string;
  participantPhone?: string;
  formState: {
    agreement: boolean;
    notes: string;
    parentName: string;
    parentId: string;
  };
  handleAgreementChange: (checked: boolean) => void;
  handleNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleParentNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleParentIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const HealthDeclarationContent: React.FC<HealthDeclarationContentProps> = ({
  participantName,
  participantId,
  participantPhone,
  formState,
  handleAgreementChange,
  handleNotesChange,
  handleParentNameChange,
  handleParentIdChange
}) => {
  return (
    <div className="space-y-6">
      {/* Participant Information */}
      <div className="space-y-2 rounded-md border p-4">
        <h3 className="font-medium">פרטי המשתתף:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="font-semibold">שם מלא:</span> {participantName}</div>
          {participantId && <div><span className="font-semibold">ת.ז.:</span> {participantId}</div>}
          {participantPhone && <div><span className="font-semibold">טלפון:</span> {participantPhone}</div>}
        </div>
      </div>

      {/* Parent Information */}
      <div className="space-y-3">
        <h3 className="font-medium">פרטי ההורה/אפוטרופוס:</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="parentName">שם מלא של ההורה</Label>
            <Input 
              id="parentName" 
              placeholder="שם ההורה/אפוטרופוס"
              value={formState.parentName}
              onChange={handleParentNameChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parentId">ת.ז. של ההורה</Label>
            <Input 
              id="parentId" 
              placeholder="מספר תעודת זהות"
              value={formState.parentId}
              onChange={handleParentIdChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2 space-y-0">
          <Label 
            htmlFor="health-declaration" 
            className="flex-grow text-base font-medium"
          >
            אני מצהיר/ה בזאת כי:
          </Label>
        </div>
        
        <div className="text-sm space-y-2 rounded-md border p-4">
          <p>• בני/בתי נמצא/ת בכושר ובמצב בריאותי תקין המאפשר השתתפות בפעילות.</p>
          <p>• לא ידוע לי על מגבלות רפואיות המונעות מבני/בתי להשתתף בפעילות.</p>
          <p>• לא ידוע לי על רגישויות, מחלות או בעיות רפואיות אחרות שעלולות להשפיע על השתתפותו/ה בפעילות.</p>
          <p>• אני מתחייב/ת להודיע למדריכים על כל שינוי במצב הבריאותי של בני/בתי.</p>
        </div>
        
        <div className="flex items-center space-x-2 space-y-0 pt-2">
          <Checkbox 
            id="health-agreement" 
            checked={formState.agreement}
            onCheckedChange={checked => handleAgreementChange(checked === true)}
            required
          />
          <Label 
            htmlFor="health-agreement" 
            className="mr-2 text-sm"
          >
            אני מאשר/ת את הצהרת הבריאות
          </Label>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">הערות רפואיות (אופציונלי)</Label>
        <Textarea 
          id="notes" 
          placeholder="אם יש מידע רפואי נוסף שעלינו לדעת, אנא ציין כאן"
          value={formState.notes}
          onChange={handleNotesChange}
        />
      </div>
    </div>
  );
};

export default HealthDeclarationContent;
