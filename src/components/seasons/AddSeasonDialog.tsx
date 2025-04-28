
import React, { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useData } from "@/context/DataContext";

interface AddSeasonDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const AddSeasonDialog: React.FC<AddSeasonDialogProps> = ({ isOpen, onOpenChange }) => {
  const { addSeason } = useData();
  const [newSeason, setNewSeason] = useState({
    name: "",
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().substring(0, 10)
  });

  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSeason.name || !newSeason.startDate || !newSeason.endDate) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addSeason(newSeason);
      onOpenChange(false);
      toast({
        title: "עונה נוספה בהצלחה",
        description: `העונה "${newSeason.name}" נוספה בהצלחה`
      });
      
      // Reset form
      setNewSeason({
        name: "",
        startDate: new Date().toISOString().substring(0, 10),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().substring(0, 10)
      });
      
    } catch (error) {
      console.error('Failed to add season:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את העונה",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הוסף עונה חדשה</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddSeason}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="season-name">שם העונה</Label>
              <Input
                id="season-name"
                value={newSeason.name}
                onChange={(e) => setNewSeason({ ...newSeason, name: e.target.value })}
                placeholder="קיץ 2025"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start-date">תאריך התחלה</Label>
              <Input
                id="start-date"
                type="date"
                value={newSeason.startDate}
                onChange={(e) => setNewSeason({ ...newSeason, startDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">תאריך סיום</Label>
              <Input
                id="end-date"
                type="date"
                value={newSeason.endDate}
                onChange={(e) => setNewSeason({ ...newSeason, endDate: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="submit">הוסף עונה</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSeasonDialog;
