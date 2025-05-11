
import React, { useState } from 'react';
import { useParticipants } from '@/hooks/useParticipants';
import { toast } from "@/components/ui/use-toast";
import { Registration } from '@/types';

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

  // Handler for opening add participant dialog
  const handleOpenAddParticipant = () => {
    resetForm();
    setIsAddParticipantOpen(true);
  };

  // Handler for opening payment dialog
  const handleOpenAddPayment = (registration: Registration) => {
    setCurrentRegistration(registration);
    setNewPayment({
      amount: 0,
      receiptNumber: '',
      paymentDate: new Date().toISOString().substring(0, 10),
      ...(registration.id ? { registrationId: registration.id } : {})
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
  const handleApplyDiscountWrapper = (amount: number, registrationId?: string) => {
    handleApplyDiscount(amount, setIsAddPaymentOpen, registrationId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <ParticipantsHeader 
        product={product}
        onExport={() => {}} // This is now empty as we're removing the export functionality
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
