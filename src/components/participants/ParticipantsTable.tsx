
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Participant, PaymentStatus, Registration, Payment } from '@/types';
import { Download, Send } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface ParticipantsTableProps {
  registrations: Registration[];
  getParticipantForRegistration: (registration: Registration) => Participant | undefined;
  getPaymentsForRegistration: (registration: Registration) => Payment[];
  calculatePaymentStatus: (registration: Registration) => PaymentStatus;
  getStatusClassName: (status: PaymentStatus) => string;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (registrationId: string) => void;
  onUpdateHealthApproval: (participant: Participant, isApproved: boolean) => void;
  onExport?: () => void;
}

const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
  registrations,
  getParticipantForRegistration,
  getPaymentsForRegistration,
  calculatePaymentStatus,
  getStatusClassName,
  onAddPayment,
  onDeleteRegistration,
  onUpdateHealthApproval,
  onExport,
}) => {
  const [isHealthFormDialogOpen, setIsHealthFormDialogOpen] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [phoneToSend, setPhoneToSend] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Helper to separate actual payments from discounts
  const calculateActualPayments = (payments: Payment[]) => {
    return payments.filter(p => p.receiptNumber !== '');
  };
  
  // Helper to calculate discount amount
  const calculateDiscountAmount = (registration: Registration) => {
    return registration.discountAmount || 0;
  };

  const handleSendHealthForm = async (participant: Participant) => {
    setCurrentParticipant(participant);
    setPhoneToSend(participant.phone); // Default to participant's phone
    setIsHealthFormDialogOpen(true);
  };

  const submitHealthFormSend = async () => {
    if (!currentParticipant || !phoneToSend.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין מספר טלפון תקין",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-health-form', {
        body: {
          participantId: currentParticipant.id,
          phone: phoneToSend,
          name: `${currentParticipant.firstName} ${currentParticipant.lastName}`
        }
      });

      if (error) throw new Error(error.message);

      toast({
        title: "טופס נשלח בהצלחה",
        description: `הצהרת הבריאות נשלחה ל${phoneToSend}`,
      });

      setIsHealthFormDialogOpen(false);
    } catch (error: any) {
      console.error('Error sending health form:', error);
      toast({
        title: "שגיאה בשליחת הטופס",
        description: error.message || "אירעה שגיאה בשליחת טופס הצהרת הבריאות",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      {onExport && (
        <div className="flex justify-end mb-4">
          <Button onClick={onExport} variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            ייצא לקובץ CSV
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>שם מלא</TableHead>
            <TableHead>ת.ז</TableHead>
            <TableHead>טלפון</TableHead>
            <TableHead>סכום לתשלום</TableHead>
            <TableHead>תשלומים</TableHead>
            <TableHead>מספרי קבלות</TableHead>
            <TableHead>הנחה</TableHead>
            <TableHead>אישור בריאות</TableHead>
            <TableHead>סטטוס</TableHead>
            <TableHead>פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => {
            const participant = getParticipantForRegistration(registration);
            const registrationPayments = getPaymentsForRegistration(registration);
            const actualPayments = calculateActualPayments(registrationPayments);
            const discountAmount = calculateDiscountAmount(registration);
            const actualPaidAmount = actualPayments.reduce((sum, payment) => sum + payment.amount, 0);
            const status = calculatePaymentStatus(registration);
            const hasPayments = registrationPayments.length > 0;
            
            if (!participant) return null;
            
            return (
              <TableRow key={registration.id}>
                <TableCell>{`${participant.firstName} ${participant.lastName}`}</TableCell>
                <TableCell>{participant.idNumber}</TableCell>
                <TableCell>{participant.phone}</TableCell>
                <TableCell>{Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(registration.requiredAmount)}</TableCell>
                <TableCell>
                  {registrationPayments.length > 0 ? (
                    <div className="space-y-1">
                      {registrationPayments.map((payment, idx) => (
                        <div key={idx} className={`text-sm ${!payment.receiptNumber ? 'text-gray-500 font-medium' : ''}`}>
                          {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(payment.amount)}
                        </div>
                      ))}
                      {registration.discountApproved && discountAmount > 0 && (
                        <div className="text-sm text-gray-500 font-medium">
                          {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(discountAmount)} (הנחה)
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {registrationPayments.length > 0 ? (
                    <div className="space-y-1">
                      {registrationPayments.map((payment, idx) => (
                        <div key={idx} className="text-xs text-gray-500">
                          {payment.receiptNumber ? payment.receiptNumber : '--'}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>{registration.discountApproved ? 'כן' : 'לא'}</TableCell>
                <TableCell>
                  {participant.healthApproval ? (
                    <Checkbox 
                      checked={true} 
                      onCheckedChange={(checked) => {
                        if (participant) {
                          onUpdateHealthApproval(participant, checked === true);
                        }
                      }}
                      className="mx-auto block"
                    />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendHealthForm(participant)}
                      className="mx-auto block"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      שלח טופס
                    </Button>
                  )}
                </TableCell>
                <TableCell className={`font-semibold ${getStatusClassName(status)}`}>
                  {status}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddPayment(registration)}
                      className="ml-2"
                    >
                      הוסף תשלום
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteRegistration(registration.id)}
                      disabled={hasPayments}
                    >
                      הסר
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Send Health Form Dialog */}
      <Dialog open={isHealthFormDialogOpen} onOpenChange={setIsHealthFormDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>שליחת טופס הצהרת בריאות</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="participant-name">משתתף</Label>
              <Input 
                id="participant-name" 
                value={currentParticipant ? `${currentParticipant.firstName} ${currentParticipant.lastName}` : ''}
                readOnly 
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-number">מספר טלפון לשליחה</Label>
              <Input 
                id="phone-number" 
                type="tel"
                value={phoneToSend} 
                onChange={(e) => setPhoneToSend(e.target.value)}
                placeholder="הכנס מספר טלפון"
                className="ltr"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={submitHealthFormSend} disabled={isSending}>
              {isSending ? 'שולח...' : 'שלח טופס'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParticipantsTable;
