
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { ReportFilters } from '@/utils/reportFilters';
import ReportSummaryCards from '@/components/report/ReportSummaryCards';
import RegistrationsTable from '@/components/report/RegistrationsTable';
import ReportFiltersComponent from '@/components/report/ReportFilters';
import ReportPageHeader from '@/components/report/ReportPageHeader';
import ReportDialogs from '@/components/report/ReportDialogs';
import { filterRegistrations } from '@/utils/reportFilters';
import { useReportActions } from '@/hooks/useReportActions';
import { useReportExport } from '@/hooks/useReportExport';

const ReportPage: React.FC = () => {
  const { seasons, products, pools, participants } = useData();
  
  const [filters, setFilters] = useState<ReportFilters>({
    search: '',
    receiptNumber: '',
    seasonId: 'all',
    productId: 'all',
    paymentStatus: 'all',
    poolId: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    currentRegistration,
    editingRegistration,
    editingParticipant,
    editingPayments,
    newPayment,
    setNewPayment,
    handleOpenAddPayment,
    handleDeleteRegistration,
    handleEditParticipant,
    handleSaveParticipant,
    handleAddPayment,
  } = useReportActions();

  const { handleExport } = useReportExport();
  
  const allRegistrations = filterRegistrations(
    useData().getAllRegistrationsWithDetails(), 
    filters
  );

  return (
    <div className="space-y-6">
      <ReportPageHeader
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onExport={() => handleExport(allRegistrations)}
      />

      {showFilters && (
        <div className="bg-muted/40 p-4 rounded-lg border animate-scale-in">
          <ReportFiltersComponent 
            filters={filters} 
            setFilters={setFilters} 
            seasons={seasons} 
            products={products}
            pools={pools} 
          />
        </div>
      )}

      <ReportSummaryCards registrations={allRegistrations} />
      
      <div className="bg-white rounded-lg shadow-card">
        <RegistrationsTable 
          registrations={allRegistrations}
          onAddPayment={handleOpenAddPayment}
          onDeleteRegistration={handleDeleteRegistration}
          onEditParticipant={handleEditParticipant}
        />
      </div>

      <ReportDialogs
        isAddPaymentOpen={isAddPaymentOpen}
        setIsAddPaymentOpen={setIsAddPaymentOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        currentRegistration={currentRegistration}
        editingRegistration={editingRegistration}
        editingParticipant={editingParticipant}
        editingPayments={editingPayments}
        newPayment={newPayment}
        setNewPayment={setNewPayment}
        participants={participants}
        onSaveParticipant={handleSaveParticipant}
        onAddPayment={handleAddPayment}
      />
    </div>
  );
};

export default ReportPage;
