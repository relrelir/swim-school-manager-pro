
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Participant } from '@/types';

interface AddParticipantDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  participants: Participant[];
  selectedParticipant: Participant | null;
  setSelectedParticipant: (participant: Participant | null) => void;
  newParticipant: Omit<Participant, 'id'>;
  setNewParticipant: React.Dispatch<React.SetStateAction<Omit<Participant, 'id'>>>;
  registrationData: {
    requiredAmount: number;
    paidAmount: number;
    receiptNumber: string;
    discountApproved: boolean;
  };
  setRegistrationData: React.Dispatch<React.SetStateAction<{
    requiredAmount: number;
    paidAmount: number;
    receiptNumber: string;
    discountApproved: boolean;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
}

const AddParticipantDialog: React.FC<AddParticipantDialogProps> = ({
  isOpen,
  onOpenChange,
  participants,
  selectedParticipant,
  setSelectedParticipant,
  newParticipant,
  setNewParticipant,
  registrationData,
  setRegistrationData,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>הוסף משתתף חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="space-y-4 py-2">
            {selectedParticipant ? (
              <div className="bg-blue-50 p-4 rounded">
                <p className="font-semibold">משתתף נבחר:</p>
                <p>{`${selectedParticipant.firstName} ${selectedParticipant.lastName}, ת.ז: ${selectedParticipant.idNumber}`}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedParticipant(null)}
                  className="mt-2"
                >
                  בחר משתתף אחר
                </Button>
              </div>
            ) : (
              <>
                {participants.length > 0 && (
                  <div className="space-y-2">
                    <Label>בחר משתתף קיים</Label>
                    <div className="max-h-32 overflow-y-auto border rounded p-2">
                      {participants.map(participant => (
                        <div 
                          key={participant.id} 
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => setSelectedParticipant(participant)}
                        >
                          {`${participant.firstName} ${participant.lastName} (${participant.idNumber})`}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">או מלא פרטי משתתף חדש:</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">שם פרטי</Label>
                    <Input
                      id="first-name"
                      value={newParticipant.firstName}
                      onChange={(e) => setNewParticipant({ ...newParticipant, firstName: e.target.value })}
                      required={!selectedParticipant}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">שם משפחה</Label>
                    <Input
                      id="last-name"
                      value={newParticipant.lastName}
                      onChange={(e) => setNewParticipant({ ...newParticipant, lastName: e.target.value })}
                      required={!selectedParticipant}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id-number">תעודת זהות</Label>
                    <Input
                      id="id-number"
                      value={newParticipant.idNumber}
                      onChange={(e) => setNewParticipant({ ...newParticipant, idNumber: e.target.value })}
                      required={!selectedParticipant}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">טלפון</Label>
                    <Input
                      id="phone"
                      value={newParticipant.phone}
                      onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value })}
                      required={!selectedParticipant}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="health-approval"
                    checked={newParticipant.healthApproval}
                    onCheckedChange={(checked) => 
                      setNewParticipant({ ...newParticipant, healthApproval: checked as boolean })
                    }
                  />
                  <Label htmlFor="health-approval" className="mr-2">אישור בריאות</Label>
                </div>
              </>
            )}
            
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">פרטי תשלום</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="required-amount">סכום לתשלום</Label>
                  <Input
                    id="required-amount"
                    type="number"
                    value={registrationData.requiredAmount}
                    onChange={(e) => setRegistrationData({ 
                      ...registrationData, 
                      requiredAmount: Number(e.target.value) 
                    })}
                    required
                    min={0}
                    className="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paid-amount">סכום ששולם</Label>
                  <Input
                    id="paid-amount"
                    type="number"
                    value={registrationData.paidAmount}
                    onChange={(e) => setRegistrationData({ 
                      ...registrationData, 
                      paidAmount: Number(e.target.value) 
                    })}
                    required
                    min={0}
                    className="ltr"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receipt-number">מספר קבלה</Label>
                <Input
                  id="receipt-number"
                  value={registrationData.receiptNumber}
                  onChange={(e) => setRegistrationData({ ...registrationData, receiptNumber: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="discount-approved"
                  checked={registrationData.discountApproved}
                  onCheckedChange={(checked) => 
                    setRegistrationData({ ...registrationData, discountApproved: checked as boolean })
                  }
                />
                <Label htmlFor="discount-approved" className="mr-2">אישור הנחה</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit">
              {selectedParticipant ? 'רשום משתתף קיים' : 'רשום משתתף חדש'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddParticipantDialog;
