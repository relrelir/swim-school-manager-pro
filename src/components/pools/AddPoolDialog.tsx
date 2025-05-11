
import React, { useState, FormEvent } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddPoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
  seasonName: string;
}

const AddPoolDialog: React.FC<AddPoolDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  seasonName
}) => {
  const [newPoolName, setNewPoolName] = useState('');

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(newPoolName);
    setNewPoolName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הוסף בריכה חדשה</DialogTitle>
          <DialogDescription>
            הוסף בריכה חדשה לעונה {seasonName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="pool-name">שם הבריכה</Label>
              <Input
                id="pool-name"
                value={newPoolName}
                onChange={e => setNewPoolName(e.target.value)}
                placeholder="לדוגמה: בריכה ראשית"
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit">הוסף בריכה</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPoolDialog;
