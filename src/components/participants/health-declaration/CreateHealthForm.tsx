
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface CreateHealthFormProps {
  phone: string;
  participantName: string;
  isLoading: boolean;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CreateHealthForm: React.FC<CreateHealthFormProps> = ({
  phone,
  participantName,
  isLoading,
  onPhoneChange,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="text-sm">
          יצירת הצהרת בריאות עבור: <span className="font-bold">{participantName}</span>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-left col-span-1">
            טלפון
          </Label>
          <Input
            id="phone"
            value={phone}
            onChange={onPhoneChange}
            placeholder="הזן מספר טלפון"
            className="col-span-3 text-right"
            required
          />
        </div>
        
        <div className="text-xs text-muted-foreground">
          לאחר יצירת ההצהרה תוכל להעתיק את הלינק ולשלוח למשתתף בוואטסאפ או מייל.
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'מכין...' : 'צור הצהרה'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CreateHealthForm;
