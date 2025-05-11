
import React, { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface AddPoolDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddPool: (name: string) => void;
}

const AddPoolDialog: React.FC<AddPoolDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  onAddPool 
}) => {
  const [poolName, setPoolName] = useState("");
  const { seasonId } = useParams<{ seasonId: string }>();

  const handleAddPool = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!poolName.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין שם לבריכה",
        variant: "destructive"
      });
      return;
    }
    
    if (!seasonId) {
      toast({
        title: "שגיאה",
        description: "עונה לא נמצאה",
        variant: "destructive"
      });
      return;
    }

    onAddPool(poolName);
    setPoolName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הוסף בריכה חדשה</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddPool}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pool-name">שם הבריכה</Label>
              <Input
                id="pool-name"
                value={poolName}
                onChange={(e) => setPoolName(e.target.value)}
                placeholder="שם הבריכה"
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="submit">הוסף בריכה</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPoolDialog;
