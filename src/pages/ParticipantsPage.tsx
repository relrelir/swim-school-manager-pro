import React from 'react';
import { useParticipants } from '@/hooks/useParticipants';
import { toast } from "@/components/ui/use-toast";
import { prepareParticipantsData, exportToCSV } from '@/utils/exportParticipants';
import { Registration, Participant } from '@/types';

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
    isLinkDialogOpen,
    setIsLinkDialogOpen,
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

  // Debug log to see the current registration state
  console.log("ParticipantsPage - currentRegistration:", currentRegistration);

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
      // Create an adapter function that works with the expected interface
      const registrationToPayments = (registration: Registration) => {
        return getPaymentsForRegistration(registration);
      };
      
      const data = prepareParticipantsData(
        registrations, 
        getParticipantForRegistration,
        registrationToPayments,
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
  const handleOpenAddPayment = (registration: Registration) => {
    console.log("ParticipantsPage - handleOpenAddPayment called with registration:", registration);
    setCurrentRegistration(registration);
    setNewPayment({
      amount: 0,
      receiptNumber: '',
      paymentDate: new Date().toISOString().substring(0, 10),
    });
    setIsAddPaymentOpen(true);
  };

  // Create adapter functions to match ParticipantsContent expected function signatures
  const getPaymentsForRegistrationById = (registrationId: string) => {
    // Find the registration object first
    const registration = registrations.find(r => r.id === registrationId);
    // Only call getPaymentsForRegistration if we found the registration
    if (registration) {
      return getPaymentsForRegistration(registration);
    }
    return [];
  };
  
  const updateHealthApprovalById = (registrationId: string, isApproved: boolean) => {
    handleUpdateHealthApproval(registrationId, isApproved);
  };

  // Create an adapter for the handleApplyDiscount function to match the expected signature
  const handleApplyDiscountWrapper = (amount: number) => {
    console.log("ParticipantsPage - handleApplyDiscountWrapper with currentRegistration:", currentRegistration);
    handleApplyDiscount(amount, setIsAddPaymentOpen, currentRegistration);
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
        getPaymentsForRegistration={getPaymentsForRegistrationById}
        getHealthDeclarationForRegistration={getHealthDeclarationForRegistration}
        calculatePaymentStatus={calculatePaymentStatus}
        getStatusClassName={getStatusClassName}
        onAddPayment={handleOpenAddPayment}
        onDeleteRegistration={handleDeleteRegistration}
        onUpdateHealthApproval={updateHealthApprovalById}
        onOpenHealthForm={handleOpenHealthForm}
        onExport={handleExportToCSV}
      />

      {/* Dialogs */}
      <ParticipantsDialogs
        isAddParticipantOpen={isAddParticipantOpen}
        setIsAddParticipantOpen={setIsAddParticipantOpen}
        isAddPaymentOpen={isAddPaymentOpen}
        setIsAddPaymentOpen={setIsAddPaymentOpen}
        isHealthFormOpen={isLinkDialogOpen}
        setIsHealthFormOpen={setIsLinkDialogOpen}
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
        handleApplyDiscount={handleApplyDiscountWrapper}
      />
    </div>
  );
};

export default ParticipantsPage;
