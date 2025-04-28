
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { exportRegistrationsToCSV } from '@/utils/exportUtils';
import { ReportFilters } from '@/utils/reportFilters';
import ReportSummaryCards from '@/components/report/ReportSummaryCards';
import RegistrationsTable from '@/components/report/RegistrationsTable';
import ReportFiltersComponent from '@/components/report/ReportFilters';
import { filterRegistrations } from '@/utils/reportFilters';

const ReportPage: React.FC = () => {
  const { seasons, products, getAllRegistrationsWithDetails } = useData();
  const [filters, setFilters] = useState<ReportFilters>({
    search: '',
    receiptNumber: '',
    seasonId: 'all',
    productId: 'all',
    paymentStatus: 'all',
  });
  
  const allRegistrations = getAllRegistrationsWithDetails();
  const filteredRegistrations = filterRegistrations(allRegistrations, filters);

  // Handle exporting to CSV
  const handleExport = () => {
    exportRegistrationsToCSV(
      filteredRegistrations,
      `swim-school-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">דו"ח מאוחד - כל הרישומים</h1>
        <Button onClick={handleExport}>ייצוא לאקסל (CSV)</Button>
      </div>

      <ReportSummaryCards registrations={filteredRegistrations} />
      <ReportFiltersComponent filters={filters} setFilters={setFilters} seasons={seasons} products={products} />
      <RegistrationsTable registrations={filteredRegistrations} />
    </div>
  );
};

export default ReportPage;
