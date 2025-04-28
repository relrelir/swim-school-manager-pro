
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useParticipants } from '@/hooks/useParticipants';
import ParticipantsSummaryCards from '@/components/participants/ParticipantsSummaryCards';
import ParticipantsTable from '@/components/participants/ParticipantsTable';
import EmptyParticipantsState from '@/components/participants/EmptyParticipantsState';
import AddParticipantDialog from '@/components/participants/AddParticipantDialog';
import AddPaymentDialog from '@/components/participants/AddPaymentDialog';
import { prepareParticipantsData, exportToCSV } from '@/utils/exportParticipants';
import { toast } from "@/components/ui/use-toast";

const ParticipantsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    product,
    registrations,
    isAddParticipantOpen,
    setIsAddParticipantOpen,
    isAddPaymentOpen,
    setIsAddPaymentOpen,
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
    resetForm,
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName,
    calculatePaymentStatus,
  } = useParticipants();

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
        getPaymentsForRegistration,
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

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="outline" onClick={() => navigate(-1)}>חזרה למוצרים</Button>
          <h1 className="text-2xl font-bold mt-2">
            {product ? `משתתפים ב${product.name}` : 'משתתפים'}
          </h1>
        </div>
        <Button onClick={() => {
          resetForm();
          setIsAddParticipantOpen(true);
        }}>
          הוסף משתתף
        </Button>
      </div>

      <ParticipantsSummaryCards 
        totalParticipants={totalParticipants}
        product={product}
        totalExpected={totalExpected}
        totalPaid={totalPaid}
        registrationsFilled={registrationsFilled}
      />

      {registrations.length === 0 ? (
        <EmptyParticipantsState />
      ) : (
        <ParticipantsTable
          registrations={registrations}
          getParticipantForRegistration={getParticipantForRegistration}
          getPaymentsForRegistration={getPaymentsForRegistration}
          calculatePaymentStatus={calculatePaymentStatus}
          getStatusClassName={getStatusClassName}
          onAddPayment={(registration) => {
            setCurrentRegistration(registration);
            setNewPayment({
              amount: 0,
              receiptNumber: '',
              paymentDate: new Date().toISOString().substring(0, 10),
            });
            setIsAddPaymentOpen(true);
          }}
          onDeleteRegistration={handleDeleteRegistration}
          onUpdateHealthApproval={handleUpdateHealthApproval}
          onExport={handleExportToCSV}
        />
      )}

      {/* Add Participant Dialog */}
      <AddParticipantDialog
        isOpen={isAddParticipantOpen}
        onOpenChange={setIsAddParticipantOpen}
        newParticipant={newParticipant}
        setNewParticipant={setNewParticipant}
        registrationData={registrationData}
        setRegistrationData={setRegistrationData}
        onSubmit={handleAddParticipant}
      />

      {/* Add Payment Dialog */}
      <AddPaymentDialog
        isOpen={isAddPaymentOpen}
        onOpenChange={setIsAddPaymentOpen}
        currentRegistration={currentRegistration}
        participants={participants}
        newPayment={newPayment}
        setNewPayment={setNewPayment}
        onSubmit={handleAddPayment}
        onApplyDiscount={handleApplyDiscount}
      />
    </div>
  );
};

export default ParticipantsPage;
