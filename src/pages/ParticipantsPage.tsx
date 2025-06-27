
import React, { useState } from 'react';
import { useParticipants } from '@/hooks/useParticipants';
import { toast } from "@/components/ui/use-toast";
import { Registration, Participant, Payment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

import ParticipantsHeader from '@/components/participants/ParticipantsHeader';
import ParticipantsContent from '@/components/participants/ParticipantsContent';
import ParticipantsDialogs from '@/components/participants/ParticipantsDialogs';

const ParticipantsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { updateParticipant, updateRegistration, updatePayment } = useData();
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
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה להוסיף משתתפים",
        variant: "destructive",
      });
      return;
    }

    resetForm();
    setIsAddParticipantOpen(true);
  };

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

  const getPaymentsForRegistrationById = (registrationId: string) => {
    const registration = registrations.find(r => r.id === registrationId);
    if (registration) {
      return getPaymentsForRegistration(registration);
    }
    return [];
  };
  
  const updateHealthApprovalById = (registrationId: string, isApproved: boolean) => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה לאשר הצהרות בריאות",
        variant: "destructive",
      });
      return;
    }
    
    handleUpdateHealthApproval(registrationId, isApproved);
  };

  const handleApplyDiscountWrapper = (amount: number, registrationId?: string) => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה לאשר הנחות",
        variant: "destructive",
      });
      return;
    }
    
    handleApplyDiscount(amount, setIsAddPaymentOpen, registrationId);
  };

  const secureDeleteRegistration = (registrationId: string) => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה למחוק רישומים",
        variant: "destructive",
      });
      return;
    }
    
    handleDeleteRegistration(registrationId);
  };

  // New handler for updating participant data
  const handleUpdateParticipant = async (
    participantData: Partial<Participant>,
    registrationData: Partial<Registration>,
    paymentsData: Payment[]
  ) => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה לערוך משתתפים",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find the current registration to get the participant ID
      const currentReg = registrations.find(r => 
        Object.keys(registrationData).some(key => 
          r[key as keyof Registration] !== registrationData[key as keyof Registration]
        )
      );
      
      if (!currentReg) {
        toast({
          title: "שגיאה",
          description: "לא נמצא רישום מתאים",
          variant: "destructive",
        });
        return;
      }

      // Update participant data
      if (Object.keys(participantData).length > 0) {
        const fullParticipant = {
          id: currentReg.participantId,
          firstName: participantData.firstName || '',
          lastName: participantData.lastName || '',
          phone: participantData.phone || '',
          idNumber: participantData.idNumber || '',
          healthApproval: participantData.healthApproval || false,
        } as Participant;
        
        await updateParticipant(fullParticipant);
      }

      // Update registration data
      if (Object.keys(registrationData).length > 0) {
        const fullRegistration = {
          ...currentReg,
          ...registrationData,
        } as Registration;
        
        await updateRegistration(fullRegistration);
      }

      // Update payments data
      for (const payment of paymentsData) {
        await updatePayment(payment);
      }

      toast({
        title: "עודכן בהצלחה",
        description: "פרטי המשתתף עודכנו בהצלחה",
      });

    } catch (error) {
      console.error('Error updating participant:', error);
      toast({
        title: "שגיאה בעדכון",
        description: "אירעה שגיאה בעת עדכון פרטי המשתתף",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <ParticipantsHeader 
        product={product}
        onExport={() => {}}
        onAddParticipant={handleOpenAddParticipant}
      />

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
        onDeleteRegistration={secureDeleteRegistration}
        onUpdateHealthApproval={updateHealthApprovalById}
        onOpenHealthForm={handleOpenHealthForm}
        onUpdateParticipant={handleUpdateParticipant}
      />

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
