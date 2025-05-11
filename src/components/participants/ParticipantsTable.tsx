
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Participant, PaymentStatus, Registration, Payment, HealthDeclaration, PaymentStatusDetails } from '@/types';
import TableHealthStatus from './TableHealthStatus';
import TablePaymentInfo from './TablePaymentInfo';
import TableReceiptNumbers from './TableReceiptNumbers';
import TableRowActions from './table-actions/TableRowActions';
import ParticipantsTableHeader from './ParticipantsTableHeader';
import { formatCurrencyForTableUI } from '@/utils/formatters';

interface ParticipantsTableProps {
  registrations: Registration[];
  getParticipantForRegistration: (registration: Registration) => Participant | undefined;
  getPaymentsForRegistration: (registration: Registration | string) => Promise<Payment[]>;
  getHealthDeclarationForRegistration: (registrationId: string) => Promise<HealthDeclaration | undefined>;
  calculatePaymentStatus: (registration: Registration, payments: Payment[]) => PaymentStatusDetails;
  getStatusClassName: (status: string) => string;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (id: string) => void;
  onUpdateHealthApproval: (registrationId: string, isApproved: boolean) => void;
  onOpenHealthForm: (registrationId: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onPaymentTotalsCalculated?: (total: number) => void;
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
  setSearchQuery,
  onPaymentTotalsCalculated
}) => {
  // Store payments for each registration
  const [registrationPayments, setRegistrationPayments] = useState<Record<string, Payment[]>>({});
  // Track loading state for payments - start with false to prevent initial flickering
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  // Track the total actual amount paid across all registrations
  const [totalActualPaid, setTotalActualPaid] = useState(0);
  // Track if this is the initial loading
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Stable registration IDs for dependency tracking
  const registrationIds = useMemo(() => 
    registrations.map(reg => reg.id).join(','), 
    [registrations]
  );
  
  // Memoized fetch payments function to reduce re-renders
  const fetchPaymentsForRegistrations = useCallback(async () => {
    // Only show loading if this is the initial fetch
    if (isInitialLoading) {
      setIsLoadingPayments(true);
    }
    
    const paymentsMap: Record<string, Payment[]> = {};
    let totalPaid = 0;
    
    try {
      for (const registration of registrations) {
        const payments = await getPaymentsForRegistration(registration);
        paymentsMap[registration.id] = payments;
        
        // Calculate actual paid amount from payments
        const regPaidAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        totalPaid += regPaidAmount;
      }
      
      console.log(`Total actual paid amount from all payments: ${totalPaid}`);
      setRegistrationPayments(paymentsMap);
      setTotalActualPaid(totalPaid);
      
      // Pass the calculated total back to parent if callback provided
      if (onPaymentTotalsCalculated) {
        onPaymentTotalsCalculated(totalPaid);
      }
    } catch (error) {
      console.error('Failed to fetch payments for registrations:', error);
    } finally {
      setIsLoadingPayments(false);
      setIsInitialLoading(false);
    }
  }, [registrations, getPaymentsForRegistration, onPaymentTotalsCalculated, isInitialLoading]);
  
  // Fetch payments for all registrations when component mounts or registrations change
  useEffect(() => {
    if (registrations.length > 0) {
      fetchPaymentsForRegistrations();
    }
  }, [registrationIds, fetchPaymentsForRegistrations]);
  
  // Helper to calculate discount amount
  const calculateDiscountAmount = (registration: Registration) => {
    return registration.discountAmount || 0;
  };

  // Helper to calculate effective amount required after discount
  const calculateEffectiveRequiredAmount = (registration: Registration) => {
    const discountAmount = registration.discountAmount || 0;
    return Math.max(0, registration.requiredAmount - (registration.discountApproved ? discountAmount : 0));
  };

  // Use a more stable condition for loading - only show on first load
  if (isLoadingPayments && isInitialLoading) {
    return <div className="flex justify-center p-4">טוען נתוני תשלומים...</div>;
  }

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
                    registration={registration}
                  />
                </TableCell>
                <TableCell>
                  <TableReceiptNumbers 
                    payments={regPayments}
                    registration={registration}
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
