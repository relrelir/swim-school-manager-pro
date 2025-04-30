
import React from 'react';
import { useParticipants } from '@/hooks/useParticipants';
import { toast } from "@/components/ui/use-toast";
import { prepareParticipantsData, exportToCSV } from '@/utils/exportParticipants';

import ParticipantsHeader from '@/components/participants/ParticipantsHeader';
import ParticipantsContent from '@/components/participants/ParticipantsContent';
import ParticipantsDialogs from '@/components/participants/ParticipantsDialogs';

const ParticipantsPage: React.FC = () => {
  const {
    product,
    registrations,
    isAddParticipantOpen,
    setIsAddParticipantOpen,
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    isHealthFormOpen,
    setIsHealthFormOpen,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    newParticipant,
    setNewParticipant,
    currentRegistration,
    setCurrentRegistration,
    registrationData,
    setRegistrationData,
    newPayment,
    setNewPayment,
    totalParticipants,
    registrationsFilled,
    totalExpected,
    totalPaid,
    participants,
    handleAddParticipant,
    handleAddPayment,
    handleApplyDiscount,
    handleDeleteRegistration,
    handleUpdateHealthApproval,
    handleOpenHealthForm,
    resetForm,
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName,
    calculatePaymentStatus,
    getHealthDeclarationForRegistration,
  } = useParticipants();

  // Handle CSV Export
  const handleExportToCSV = () => {
    if (registrations.length === 0) {
      toast({
        title: "אין נתונים לייצוא",
        description: "אין משתתפים רשומים למוצר זה",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const data = prepareParticipantsData(
        registrations, 
        getParticipantForRegistration,
        (registration) => getPaymentsForRegistration(registration.id), // Adapter function
        calculatePaymentStatus
      );
      
      const filename = `משתתפים_${product?.name || 'מוצר'}_${new Date().toISOString().split('T')[0]}.csv`;
      exportToCSV(data, filename);
      
      toast({
        title: "הייצוא הושלם בהצלחה",
        description: "הנתונים יוצאו בהצלחה לקובץ CSV",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "שגיאה בייצוא",
        description: "אירעה שגיאה בייצוא הנתונים",
        variant: "destructive",
      });
    }
  };

  // Handler for opening add participant dialog
  const handleOpenAddParticipant = () => {
    resetForm();
    setIsAddParticipantOpen(true);
  };

  // Handler for opening payment dialog
  const handleOpenAddPayment = (registration: any) => {
    setCurrentRegistration(registration);
    setNewPayment({
      amount: 0,
      receiptNumber: '',
      paymentDate: new Date().toISOString().substring(0, 10),
    });
    setIsAddPaymentOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <ParticipantsHeader 
        product={product}
        onExport={handleExportToCSV}
        onAddParticipant={handleOpenAddParticipant}
      />

      {/* Main Content */}
      <ParticipantsContent
        registrations={registrations}
        totalParticipants={totalParticipants}
        product={product}
        totalExpected={totalExpected}
        totalPaid={totalPaid}
        registrationsFilled={registrationsFilled}
        getParticipantForRegistration={getParticipantForRegistration}
        getPaymentsForRegistration={getPaymentsForRegistration}
        getHealthDeclarationForRegistration={getHealthDeclarationForRegistration}
        calculatePaymentStatus={calculatePaymentStatus}
        getStatusClassName={getStatusClassName}
        onAddPayment={handleOpenAddPayment}
        onDeleteRegistration={handleDeleteRegistration}
        onUpdateHealthApproval={handleUpdateHealthApproval}
        onOpenHealthForm={handleOpenHealthForm}
        onExport={handleExportToCSV}
      />

      {/* Dialogs */}
      <ParticipantsDialogs
        isAddParticipantOpen={isAddParticipantOpen}
        setIsAddParticipantOpen={setIsAddParticipantOpen}
        isAddPaymentOpen={isAddPaymentOpen}
        setIsAddPaymentOpen={setIsAddPaymentOpen}
        isHealthFormOpen={isHealthFormOpen}
        setIsHealthFormOpen={setIsHealthFormOpen}
        newParticipant={newParticipant}
        setNewParticipant={setNewParticipant}
        registrationData={registrationData}
        setRegistrationData={setRegistrationData}
        currentRegistration={currentRegistration}
        participants={participants}
        newPayment={newPayment}
        setNewPayment={setNewPayment}
        currentHealthDeclaration={currentHealthDeclaration}
        setCurrentHealthDeclaration={setCurrentHealthDeclaration}
        handleAddParticipant={handleAddParticipant}
        handleAddPayment={handleAddPayment}
        handleApplyDiscount={handleApplyDiscount}
      />
    </div>
  );
};

export default ParticipantsPage;
