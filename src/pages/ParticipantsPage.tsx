import React from 'react';
import { useParticipants } from '@/hooks/useParticipants';
import { toast } from "@/components/ui/use-toast";
import { prepareParticipantsData, exportToCSV } from '@/utils/exportParticipants';
import { Registration, Participant, Payment } from '@/types';
import { generatePaymentReceipt, generatePaymentReport, downloadPDF } from '@/utils/pdfGenerator';

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
    handlePrintHealthDeclaration,
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

  // Handle PDF Export for a single receipt
  const handlePrintReceipt = (registrationId: string, paymentId: string) => {
    const registration = registrations.find(r => r.id === registrationId);
    if (!registration) return;
    
    const participant = getParticipantForRegistration(registration);
    if (!participant) return;
    
    const payments = getPaymentsForRegistration(registration);
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    try {
      const pdfDoc = generatePaymentReceipt(payment, registration, participant);
      downloadPDF(pdfDoc, `קבלה_${payment.receiptNumber}_${participant.firstName}_${participant.lastName}.pdf`);
      
      toast({
        title: "קבלה נוצרה בהצלחה",
        description: `הקבלה עבור ${participant.firstName} ${participant.lastName} נוצרה בהצלחה`,
      });
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast({
        title: "שגיאה ביצירת קבלה",
        description: "אירעה שגיאה ביצירת הקבלה",
        variant: "destructive",
      });
    }
  };

  // Handle PDF Export for a registration report
  const handleGenerateReport = (registrationId: string) => {
    const registration = registrations.find(r => r.id === registrationId);
    if (!registration) return;
    
    const participant = getParticipantForRegistration(registration);
    if (!participant) return;
    
    try {
      // For a single registration, create a filtered report
      const pdfDoc = generatePaymentReport(
        [registration],
        getParticipantForRegistration,
        getPaymentsForRegistration,
        product?.name
      );
      
      downloadPDF(pdfDoc, `דוח_תשלומים_${participant.firstName}_${participant.lastName}.pdf`);
      
      toast({
        title: "דוח נוצר בהצלחה",
        description: `הדוח עבור ${participant.firstName} ${participant.lastName} נוצר בהצלחה`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "שגיאה ביצירת דוח",
        description: "אירעה שגיאה ביצירת הדוח",
        variant: "destructive",
      });
    }
  };

  // Handle PDF Export for all registrations
  const handleGenerateFullReport = () => {
    if (registrations.length === 0) {
      toast({
        title: "אין נתונים לדוח",
        description: "אין משתתפים רשומים למוצר זה",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const pdfDoc = generatePaymentReport(
        registrations,
        getParticipantForRegistration,
        getPaymentsForRegistration,
        product?.name
      );
      
      downloadPDF(pdfDoc, `דוח_תשלומים_מלא_${product?.name || 'מוצר'}.pdf`);
      
      toast({
        title: "דוח מלא נוצר בהצלחה",
        description: `דוח תשלומים מלא עבור ${product?.name} נוצר בהצלחה`,
      });
    } catch (error) {
      console.error('Error generating full report:', error);
      toast({
        title: "שגיאה ביצירת דוח",
        description: "אירעה שגיאה ביצירת הדוח המלא",
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
    handleApplyDiscount(amount, setIsAddPaymentOpen);
  };

  // Adapter function for printing receipt by registration and payment ID
  const handlePrintReceiptAdapter = (paymentId: string) => {
    if (!currentRegistration) return;
    handlePrintReceipt(currentRegistration.id, paymentId);
  };

  // Adapter function for printing health declaration
  const handlePrintHealthDeclarationAdapter = (registrationId: string) => {
    handlePrintHealthDeclaration(registrationId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <ParticipantsHeader 
        product={product}
        onExport={handleExportToCSV}
        onAddParticipant={handleOpenAddParticipant}
        onGenerateReport={handleGenerateFullReport}
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
        onPrintHealthDeclaration={handlePrintHealthDeclarationAdapter}
        onExport={handleExportToCSV}
        onGenerateReport={handleGenerateReport}
        onPrintReceipt={handlePrintReceipt}
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
        handleApplyDiscount={handleApplyDiscountWrapper}
        onPrintReceipt={handlePrintReceiptAdapter}
      />
    </div>
  );
};

export default ParticipantsPage;
