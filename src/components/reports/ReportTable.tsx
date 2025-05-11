
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RegistrationWithDetails } from '@/types';
import { formatCurrencyForTableUI } from '@/utils/formatters';

interface ReportTableProps {
  registrations: RegistrationWithDetails[];
}

const ReportTable: React.FC<ReportTableProps> = ({ registrations }) => {
  if (registrations.length === 0) {
    return <div className="text-center p-4">לא נמצאו רישומים.</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>משתתף</TableHead>
          <TableHead>תוכנית</TableHead>
          <TableHead>עונה</TableHead>
          <TableHead>תאריך רישום</TableHead>
          <TableHead>סכום לתשלום</TableHead>
          <TableHead>סכום ששולם</TableHead>
          <TableHead>סטטוס</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {registrations.map((reg) => {
          const paymentTotal = reg.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
          return (
            <TableRow key={reg.id}>
              <TableCell>{`${reg.participant.firstName} ${reg.participant.lastName}`}</TableCell>
              <TableCell>{reg.product.name}</TableCell>
              <TableCell>{reg.season.name}</TableCell>
              <TableCell>{new Date(reg.registrationDate).toLocaleDateString('he-IL')}</TableCell>
              <TableCell>{formatCurrencyForTableUI(reg.requiredAmount)}</TableCell>
              <TableCell>{formatCurrencyForTableUI(paymentTotal)}</TableCell>
              <TableCell>{reg.paymentStatus}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ReportTable;
