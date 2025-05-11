
import React from 'react';
import { Table, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Registration, Participant, Payment, HealthDeclaration, PaymentStatusDetails } from '@/types';
import ParticipantsTableHeader from './ParticipantsTableHeader';
import TableContent from './TableContent';
import { useParticipantsTableData } from '@/hooks/participants/useParticipantsTableData';

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
  // Use the custom hook for data fetching and calculations
  const { 
    registrationPayments, 
    isLoadingPayments, 
    isInitialLoading 
  } = useParticipantsTableData(
    registrations,
    getPaymentsForRegistration,
    onPaymentTotalsCalculated
  );
  
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
        
        <TableContent 
          registrations={registrations}
          registrationPayments={registrationPayments}
          getParticipantForRegistration={getParticipantForRegistration}
          calculatePaymentStatus={calculatePaymentStatus}
          getStatusClassName={getStatusClassName}
          onAddPayment={onAddPayment}
          onDeleteRegistration={onDeleteRegistration}
          onUpdateHealthApproval={onUpdateHealthApproval}
          onOpenHealthForm={onOpenHealthForm}
        />
      </Table>
    </div>
  );
};

export default ParticipantsTable;
