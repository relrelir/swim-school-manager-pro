
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Participant, PaymentStatus, Registration, Payment, HealthDeclaration, PaymentStatusDetails } from '@/types';
import TableHealthStatus from './TableHealthStatus';
import TablePaymentInfo from './TablePaymentInfo';
import TableReceiptNumbers from './TableReceiptNumbers';
import TableRowActions from './TableRowActions';
import ParticipantsTableHeader from './ParticipantsTableHeader';
import { formatCurrencyForTableUI } from '@/utils/formatters';

interface ParticipantsTableProps {
  registrations: Registration[];
  getParticipantForRegistration: (registration: Registration) => Participant | undefined;
  getPaymentsForRegistration: (registration: Registration | string) => Promise<Payment[]>; // Updated to Promise<Payment[]>
  getHealthDeclarationForRegistration: (registrationId: string) => Promise<HealthDeclaration | undefined>;
  calculatePaymentStatus: (registration: Registration, payments: Payment[]) => PaymentStatusDetails;
  getStatusClassName: (status: string) => string;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (id: string) => void;
  onUpdateHealthApproval: (registrationId: string, isApproved: boolean) => void;
  onOpenHealthForm: (registrationId: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
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
  searchQuery,
  setSearchQuery
}) => {
  // Store payments for each registration
  const [registrationPayments, setRegistrationPayments] = useState<Record<string, Payment[]>>({});
  
  // Fetch payments for all registrations when component mounts or registrations change
  useEffect(() => {
    const fetchPaymentsForRegistrations = async () => {
      const paymentsMap: Record<string, Payment[]> = {};
      
      for (const registration of registrations) {
        try {
          const payments = await getPaymentsForRegistration(registration);
          paymentsMap[registration.id] = payments;
        } catch (error) {
          console.error(`Failed to fetch payments for registration ${registration.id}:`, error);
          paymentsMap[registration.id] = [];
        }
      }
      
      setRegistrationPayments(paymentsMap);
    };
    
    fetchPaymentsForRegistrations();
  }, [registrations, getPaymentsForRegistration]);
  
  // Helper to calculate discount amount
  const calculateDiscountAmount = (registration: Registration) => {
    return registration.discountAmount || 0;
  };

  // Helper to calculate effective amount required after discount
  const calculateEffectiveRequiredAmount = (registration: Registration) => {
    const discountAmount = registration.discountAmount || 0;
    return Math.max(0, registration.requiredAmount - (registration.discountApproved ? discountAmount : 0));
  };

  return (
    <div className="space-y-4">
      <ParticipantsTableHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>שם מלא</TableHead>
            <TableHead>ת.ז</TableHead>
            <TableHead>טלפון</TableHead>
            <TableHead>סכום מקורי</TableHead>
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
            const regPayments = registrationPayments[registration.id] || [];
            const discountAmount = calculateDiscountAmount(registration);
            const effectiveRequiredAmount = calculateEffectiveRequiredAmount(registration);
            const paymentDetails = calculatePaymentStatus(registration, regPayments);
            const status = paymentDetails.status;
            const hasPayments = regPayments.length > 0;
            
            if (!participant) return null;
            
            return (
              <TableRow key={registration.id}>
                <TableCell>{`${participant.firstName} ${participant.lastName}`}</TableCell>
                <TableCell>{participant.idNumber}</TableCell>
                <TableCell>{participant.phone}</TableCell>
                <TableCell>
                  {formatCurrencyForTableUI(registration.requiredAmount)}
                </TableCell>
                <TableCell>
                  {formatCurrencyForTableUI(effectiveRequiredAmount)}
                </TableCell>
                <TableCell>
                  <TablePaymentInfo 
                    payments={regPayments} 
                    discountAmount={discountAmount}
                    discountApproved={registration.discountApproved}
                    registration={registration} // Pass registration as fallback data source
                  />
                </TableCell>
                <TableCell>
                  <TableReceiptNumbers 
                    payments={regPayments}
                    registration={registration} // Pass registration for potential fallback
                  />
                </TableCell>
                <TableCell>
                  {registration.discountApproved && discountAmount > 0 ? 
                    formatCurrencyForTableUI(discountAmount) : 
                    'לא'}
                </TableCell>
                <TableCell>
                  <TableHealthStatus 
                    registration={registration}
                    participant={participant}
                    onUpdateHealthApproval={(isApproved) => onUpdateHealthApproval(registration.id, isApproved)}
                    onOpenHealthForm={() => onOpenHealthForm(registration.id)}
                  />
                </TableCell>
                <TableCell className={`font-semibold ${getStatusClassName(status)}`}>
                  {status}
                </TableCell>
                <TableCell>
                  <TableRowActions 
                    registration={registration}
                    hasPayments={hasPayments}
                    onAddPayment={onAddPayment}
                    onDeleteRegistration={onDeleteRegistration}
                  />
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
