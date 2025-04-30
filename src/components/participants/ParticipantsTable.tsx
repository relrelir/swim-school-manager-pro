
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Participant, PaymentStatus, Registration, Payment, HealthDeclaration } from '@/types';
import { Download } from 'lucide-react';

interface ParticipantsTableProps {
  registrations: Registration[];
  getParticipantForRegistration: (registration: Registration) => Participant | undefined;
  getPaymentsForRegistration: (registration: Registration) => Payment[];
  getHealthDeclarationForRegistration?: (registrationId: string) => HealthDeclaration | undefined;
  calculatePaymentStatus: (registration: Registration) => PaymentStatus;
  getStatusClassName: (status: PaymentStatus) => string;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (registrationId: string) => void;
  onUpdateHealthApproval: (participant: Participant, isApproved: boolean) => void;
  onOpenHealthForm?: (registrationId: string) => void;
  onExport?: () => void;
}

const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
  registrations,
  getParticipantForRegistration,
  getPaymentsForRegistration,
  getHealthDeclarationForRegistration,
  calculatePaymentStatus,
  getStatusClassName,
  onAddPayment,
  onDeleteRegistration,
  onUpdateHealthApproval,
  onOpenHealthForm,
  onExport,
}) => {
  // Helper to separate actual payments from discounts
  const calculateActualPayments = (payments: Payment[]) => {
    return payments.filter(p => p.receiptNumber !== '');
  };
  
  // Helper to calculate discount amount
  const calculateDiscountAmount = (registration: Registration) => {
    return registration.discountAmount || 0;
  };
  
  // Helper to render health form status button or checkbox
  const renderHealthFormStatus = (registration: Registration) => {
    if (!getHealthDeclarationForRegistration || !onOpenHealthForm) {
      const participant = getParticipantForRegistration(registration);
      if (!participant) return null;
      
      return (
        <Checkbox 
          checked={participant.healthApproval} 
          onCheckedChange={(checked) => {
            if (participant) {
              onUpdateHealthApproval(participant, checked === true);
            }
          }}
          className="mx-auto block"
        />
      );
    }
    
    const healthDeclaration = getHealthDeclarationForRegistration(registration.id);
    
    if (!healthDeclaration || healthDeclaration.formStatus === 'pending') {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenHealthForm(registration.id)}
          className="w-full"
        >
          שלח הצהרת בריאות
        </Button>
      );
    } else if (healthDeclaration.formStatus === 'sent') {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenHealthForm(registration.id)}
          className="w-full bg-yellow-100 hover:bg-yellow-200 border-yellow-300"
        >
          שלח שוב
        </Button>
      );
    } else if (healthDeclaration.formStatus === 'signed') {
      const participant = getParticipantForRegistration(registration);
      if (!participant) return null;
      
      // Update participant health approval automatically
      if (!participant.healthApproval) {
        onUpdateHealthApproval(participant, true);
      }
      
      return (
        <Checkbox 
          checked={true}
          disabled
          className="mx-auto block"
        />
      );
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
            <TableHead>הצהרת בריאות</TableHead>
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
                  {renderHealthFormStatus(registration)}
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
    </div>
  );
};

export default ParticipantsTable;
