
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Participant, Registration } from '@/types';

interface AddPaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentRegistration: Registration | null;
  participants: Participant[];
  newPayment: {
    amount: number;
    receiptNumber: string;
    paymentDate: string;
    registrationId?: string;
  };
  setNewPayment: React.Dispatch<React.SetStateAction<{
    amount: number;
    receiptNumber: string;
    paymentDate: string;
    registrationId?: string;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
  onApplyDiscount: (amount: number, registrationId?: string) => void;
}

const AddPaymentDialog: React.FC<AddPaymentDialogProps> = ({
  isOpen,
  onOpenChange,
  currentRegistration,
  participants,
  newPayment,
  setNewPayment,
  onSubmit,
  onApplyDiscount,
}) => {
  const [isDiscount, setIsDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

  // Set registration ID when currentRegistration changes
  useEffect(() => {
    if (currentRegistration) {
      setNewPayment(prev => ({
        ...prev,
        registrationId: currentRegistration.id
      }));
    }
  }, [currentRegistration, setNewPayment]);

  // Calculate total paid including discount
  const calculateTotalPaid = (registration: Registration) => {
    // Add the discount amount to paid amount if approved
    const paidWithDiscount = registration.paidAmount + (registration.discountApproved ? (registration.discountAmount || 0) : 0);
    return paidWithDiscount;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>הוסף תשלום</DialogTitle>
        </DialogHeader>
        <form onSubmit={isDiscount ? (e) => {
          e.preventDefault();
          // Pass the registration ID when applying discount
          onApplyDiscount(discountAmount, currentRegistration?.id);
        } : onSubmit}>
          <div className="space-y-4 py-2">
            {currentRegistration && (
              <>
                <div className="bg-blue-50 p-4 rounded">
                  <p className="font-semibold">הוספת תשלום עבור משתתף:</p>
                  {participants.find(p => p.id === currentRegistration.participantId) && (
                    <p>
                      {`${participants.find(p => p.id === currentRegistration.participantId)?.firstName} ${participants.find(p => p.id === currentRegistration.participantId)?.lastName}`}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">סכום לתשלום:</span> {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(currentRegistration.requiredAmount)}
                  </p>
                  <p>
                    <span className="font-medium">סכום ששולם עד כה:</span> {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(calculateTotalPaid(currentRegistration))}
                    {currentRegistration.discountApproved && currentRegistration.discountAmount ? (
                      <span className="text-sm text-green-600 mr-2">(כולל הנחה של {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(currentRegistration.discountAmount)})</span>
                    ) : null}
                  </p>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="is-discount"
                    checked={isDiscount}
                    onCheckedChange={(checked) => setIsDiscount(checked as boolean)}
                  />
                  <Label htmlFor="is-discount" className="mr-2">הנחה</Label>
                </div>
                
                {isDiscount ? (
                  <div className="space-y-2">
                    <Label htmlFor="discount-amount">סכום הנחה</Label>
                    <Input
                      id="discount-amount"
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      required
                      min={1}
                      className="ltr"
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="payment-amount">סכום לתשלום</Label>
                      <Input
                        id="payment-amount"
                        type="number"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({ 
                          ...newPayment, 
                          amount: Number(e.target.value), 
                          registrationId: currentRegistration.id 
                        })}
                        required
                        min={1}
                        className="ltr"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payment-receipt">מספר קבלה</Label>
                      <Input
                        id="payment-receipt"
                        value={newPayment.receiptNumber}
                        onChange={(e) => setNewPayment({ 
                          ...newPayment, 
                          receiptNumber: e.target.value,
                          registrationId: currentRegistration.id 
                        })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payment-date">תאריך תשלום</Label>
                      <Input
                        id="payment-date"
                        type="date"
                        value={newPayment.paymentDate}
                        onChange={(e) => setNewPayment({ 
                          ...newPayment, 
                          paymentDate: e.target.value,
                          registrationId: currentRegistration.id 
                        })}
                        required
                        className="ltr"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit">
              {isDiscount ? 'אשר הנחה' : 'הוסף תשלום'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentDialog;
