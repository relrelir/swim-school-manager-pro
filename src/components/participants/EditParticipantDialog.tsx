
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Participant, Registration, Payment } from '@/types';
import { formatCurrencyForUI } from '@/utils/formatters';

interface EditParticipantDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  registration: Registration | null;
  participant: Participant | null;
  payments: Payment[];
  onSave: (
    participantData: Partial<Participant>,
    registrationData: Partial<Registration>,
    paymentsData: Payment[]
  ) => void;
}

const EditParticipantDialog: React.FC<EditParticipantDialogProps> = ({
  isOpen,
  onOpenChange,
  registration,
  participant,
  payments,
  onSave,
}) => {
  const [editedParticipant, setEditedParticipant] = useState<Partial<Participant>>({});
  const [editedRegistration, setEditedRegistration] = useState<Partial<Registration>>({});
  const [editedPayments, setEditedPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (participant && registration) {
      setEditedParticipant({
        firstName: participant.firstName,
        lastName: participant.lastName,
        phone: participant.phone,
        idNumber: participant.idNumber,
        healthApproval: participant.healthApproval,
      });
      
      setEditedRegistration({
        requiredAmount: registration.requiredAmount,
        discountAmount: registration.discountAmount || 0,
        discountApproved: registration.discountApproved || false,
      });
      
      setEditedPayments([...payments]);
    }
  }, [participant, registration, payments]);

  const handleSave = () => {
    onSave(editedParticipant, editedRegistration, editedPayments);
    onOpenChange(false);
  };

  const handlePaymentChange = (index: number, field: keyof Payment, value: any) => {
    const updatedPayments = [...editedPayments];
    updatedPayments[index] = { ...updatedPayments[index], [field]: value };
    setEditedPayments(updatedPayments);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ערוך פרטי משתתף</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Participant Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">פרטים אישיים</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">שם פרטי</Label>
                <Input
                  id="firstName"
                  value={editedParticipant.firstName || ''}
                  onChange={(e) => setEditedParticipant({ ...editedParticipant, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">שם משפחה</Label>
                <Input
                  id="lastName"
                  value={editedParticipant.lastName || ''}
                  onChange={(e) => setEditedParticipant({ ...editedParticipant, lastName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  value={editedParticipant.phone || ''}
                  onChange={(e) => setEditedParticipant({ ...editedParticipant, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="idNumber">תעודת זהות</Label>
                <Input
                  id="idNumber"
                  value={editedParticipant.idNumber || ''}
                  onChange={(e) => setEditedParticipant({ ...editedParticipant, idNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="healthApproval"
                checked={editedParticipant.healthApproval || false}
                onCheckedChange={(checked) => 
                  setEditedParticipant({ ...editedParticipant, healthApproval: checked as boolean })
                }
              />
              <Label htmlFor="healthApproval">אישור הצהרת בריאות</Label>
            </div>
          </div>

          {/* Registration Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">פרטי רישום</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requiredAmount">סכום נדרש</Label>
                <Input
                  id="requiredAmount"
                  type="number"
                  value={editedRegistration.requiredAmount || 0}
                  onChange={(e) => setEditedRegistration({ 
                    ...editedRegistration, 
                    requiredAmount: parseFloat(e.target.value) || 0 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="discountAmount">סכום הנחה</Label>
                <Input
                  id="discountAmount"
                  type="number"
                  value={editedRegistration.discountAmount || 0}
                  onChange={(e) => setEditedRegistration({ 
                    ...editedRegistration, 
                    discountAmount: parseFloat(e.target.value) || 0 
                  })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="discountApproved"
                checked={editedRegistration.discountApproved || false}
                onCheckedChange={(checked) => 
                  setEditedRegistration({ ...editedRegistration, discountApproved: checked as boolean })
                }
              />
              <Label htmlFor="discountApproved">הנחה מאושרת</Label>
            </div>
          </div>

          {/* Payments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">תשלומים</h3>
            {editedPayments.map((payment, index) => (
              <div key={payment.id} className="grid grid-cols-3 gap-4 p-4 border rounded">
                <div>
                  <Label htmlFor={`amount-${index}`}>סכום</Label>
                  <Input
                    id={`amount-${index}`}
                    type="number"
                    value={payment.amount}
                    onChange={(e) => handlePaymentChange(index, 'amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor={`receipt-${index}`}>מספר קבלה</Label>
                  <Input
                    id={`receipt-${index}`}
                    value={payment.receiptNumber}
                    onChange={(e) => handlePaymentChange(index, 'receiptNumber', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`date-${index}`}>תאריך</Label>
                  <Input
                    id={`date-${index}`}
                    type="date"
                    value={payment.paymentDate}
                    onChange={(e) => handlePaymentChange(index, 'paymentDate', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button onClick={handleSave}>
              שמור שינויים
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditParticipantDialog;
