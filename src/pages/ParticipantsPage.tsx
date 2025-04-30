
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useParticipants } from '@/hooks/useParticipants';
import ParticipantsSummaryCards from '@/components/participants/ParticipantsSummaryCards';
import ParticipantsTable from '@/components/participants/ParticipantsTable';
import HealthDeclarationForm from '@/components/participants/HealthDeclarationForm';
import EmptyParticipantsState from '@/components/participants/EmptyParticipantsState';
import AddParticipantDialog from '@/components/participants/AddParticipantDialog';
import AddPaymentDialog from '@/components/participants/AddPaymentDialog';
import { prepareParticipantsData, exportToCSV } from '@/utils/exportParticipants';
import { toast } from "@/components/ui/use-toast";
import { ArrowRight, Plus, FileDown } from 'lucide-react';

const ParticipantsPage: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex gap-2">
              <ArrowRight className="h-4 w-4" />
              <span>חזרה למוצרים</span>
            </Button>
          </div>
          <h1 className="text-2xl font-bold font-alef">
            {product ? `משתתפים ב${product.name}` : 'משתתפים'}
          </h1>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleExportToCSV} variant="outline" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            <span>ייצוא CSV</span>
          </Button>
          <Button onClick={() => {
            resetForm();
            setIsAddParticipantOpen(true);
          }} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>הוסף משתתף</span>
          </Button>
        </div>
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
          getHealthDeclarationForRegistration={getHealthDeclarationForRegistration}
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
          onOpenHealthForm={handleOpenHealthForm}
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

      {/* Health Declaration Form */}
      {currentHealthDeclaration && (
        <HealthDeclarationForm
          isOpen={isHealthFormOpen}
          onOpenChange={setIsHealthFormOpen}
          registrationId={currentHealthDeclaration.registrationId}
          participantName={currentHealthDeclaration.participantName}
          defaultPhone={currentHealthDeclaration.phone}
          healthDeclaration={currentHealthDeclaration.declaration}
          afterSubmit={() => {
            // Force refresh the list after sending
            setCurrentHealthDeclaration(null);
          }}
        />
      )}
    </div>
  );
};

export default ParticipantsPage;
