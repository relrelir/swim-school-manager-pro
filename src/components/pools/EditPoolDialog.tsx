
import React, { useState, FormEvent, useEffect } from 'react';
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
import { Pool } from '@/types';

interface EditPoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (pool: Pool) => void;
  editingPool: Pool | null;
}

const EditPoolDialog: React.FC<EditPoolDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  editingPool
}) => {
  const [editPoolName, setEditPoolName] = useState('');

  // Update the name field when the editing pool changes
  useEffect(() => {
    if (editingPool) {
      setEditPoolName(editingPool.name);
    }
  }, [editingPool]);

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingPool) {
      onSubmit({
        ...editingPool,
        name: editPoolName
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ערוך בריכה</DialogTitle>
          <DialogDescription>שינוי פרטי הבריכה</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-pool-name">שם הבריכה</Label>
              <Input
                id="edit-pool-name"
                value={editPoolName}
                onChange={e => setEditPoolName(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit">שמור שינויים</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPoolDialog;
