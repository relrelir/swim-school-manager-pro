
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { exportRegistrationsToCSV } from '@/utils/exportUtils';
import { ReportFilters } from '@/utils/reportFilters';
import ReportSummaryCards from '@/components/report/ReportSummaryCards';
import RegistrationsTable from '@/components/report/RegistrationsTable';
import ReportFiltersComponent from '@/components/report/ReportFilters';
import { filterRegistrations } from '@/utils/reportFilters';
import { FileDown, Filter } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Registration, Participant, Payment, RegistrationWithDetails } from '@/types';
import { useAuth } from '@/context/AuthContext';
import ParticipantsDialogs from '@/components/participants/ParticipantsDialogs';

const ReportPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { 
    seasons, 
    products, 
    pools, 
    getAllRegistrationsWithDetails,
    participants,
    updateParticipant,
    updateRegistration,
    updatePayment,
    deleteRegistration,
    addPayment
  } = useData();
  
  const [filters, setFilters] = useState<ReportFilters>({
    search: '',
    receiptNumber: '',
    seasonId: 'all',
    productId: 'all',
    paymentStatus: 'all',
    poolId: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Dialog states
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editingPayments, setEditingPayments] = useState<Payment[]>([]);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    receiptNumber: '',
    paymentDate: new Date().toISOString().substring(0, 10),
  });
  
  const allRegistrations = getAllRegistrationsWithDetails();
  const filteredRegistrations = filterRegistrations(allRegistrations, filters);

  // Convert RegistrationWithDetails to Registration format for compatibility
  const convertToRegistration = (regWithDetails: RegistrationWithDetails): Registration => ({
    id: regWithDetails.id,
    productId: regWithDetails.product.id,
    participantId: regWithDetails.participant.id,
    requiredAmount: regWithDetails.requiredAmount,
    paidAmount: regWithDetails.paidAmount,
    discountApproved: regWithDetails.discountApproved,
    registrationDate: regWithDetails.registrationDate,
    discountAmount: regWithDetails.discountAmount,
    receiptNumber: regWithDetails.receiptNumber || '',
  });

  // Helper to get participant for registration
  const getParticipantForRegistration = (registration: Registration): Participant | undefined => {
    return participants.find(p => p.id === registration.participantId);
  };

  // Helper to get payments for registration
  const getPaymentsForRegistration = (registrationId: string): Payment[] => {
    const regWithDetails = allRegistrations.find(r => r.id === registrationId);
    return regWithDetails?.payments || [];
  };

  // Handler for opening add payment dialog
  const handleOpenAddPayment = (regWithDetails: RegistrationWithDetails) => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה להוסיף תשלומים",
        variant: "destructive",
      });
      return;
    }

    const registration = convertToRegistration(regWithDetails);
    setCurrentRegistration(registration);
    setNewPayment({
      amount: 0,
      receiptNumber: '',
      paymentDate: new Date().toISOString().substring(0, 10),
    });
    setIsAddPaymentOpen(true);
  };

  // Handler for deleting registration
  const handleDeleteRegistration = (registrationId: string) => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה למחוק רישומים",
        variant: "destructive",
      });
      return;
    }

    const regWithDetails = allRegistrations.find(r => r.id === registrationId);
    if (regWithDetails && regWithDetails.payments && regWithDetails.payments.length > 0) {
      toast({
        title: "לא ניתן למחוק",
        description: "לא ניתן למחוק רישום שבוצע עבורו תשלום",
        variant: "destructive",
      });
      return;
    }

    deleteRegistration(registrationId);
  };

  // Handler for editing participant
  const handleEditParticipant = (regWithDetails: RegistrationWithDetails) => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה לערוך משתתפים",
        variant: "destructive",
      });
      return;
    }

    const registration = convertToRegistration(regWithDetails);
    const participant = regWithDetails.participant;
    const payments = regWithDetails.payments || [];
    
    setEditingRegistration(registration);
    setEditingParticipant(participant);
    setEditingPayments(payments);
    setIsEditDialogOpen(true);
  };

  // Handler for updating participant
  const handleUpdateParticipant = async (
    registrationId: string,
    participantData: Partial<Participant>,
    registrationData: Partial<Registration>,
    paymentsData: Payment[]
  ) => {
    try {
      const regWithDetails = allRegistrations.find(r => r.id === registrationId);
      if (!regWithDetails) {
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
          ...regWithDetails.participant,
          ...participantData,
        } as Participant;
        
        await updateParticipant(fullParticipant);
      }

      // Update registration data
      if (Object.keys(registrationData).length > 0) {
        const registration = convertToRegistration(regWithDetails);
        const fullRegistration = {
          ...registration,
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

  // Handler for saving participant edits
  const handleSaveParticipant = (
    participantData: Partial<Participant>,
    registrationData: Partial<Registration>,
    paymentsData: Payment[]
  ) => {
    if (editingRegistration) {
      handleUpdateParticipant(editingRegistration.id, participantData, registrationData, paymentsData);
    }
    
    setEditingRegistration(null);
    setEditingParticipant(null);
    setEditingPayments([]);
  };

  // Handler for adding payment
  const handleAddPayment = async () => {
    if (!currentRegistration) return;

    try {
      await addPayment({
        ...newPayment,
        registrationId: currentRegistration.id,
      });

      toast({
        title: "התשלום נוסף בהצלחה",
        description: `נוסף תשלום בסך ${newPayment.amount} ₪`,
      });

      setIsAddPaymentOpen(false);
      setNewPayment({
        amount: 0,
        receiptNumber: '',
        paymentDate: new Date().toISOString().substring(0, 10),
      });
    } catch (error) {
      toast({
        title: "שגיאה בהוספת התשלום",
        description: "אירעה שגיאה בעת הוספת התשלום",
        variant: "destructive",
      });
    }
  };

  // Handle exporting to CSV
  const handleExport = () => {
    if (filteredRegistrations.length === 0) {
      toast({
        title: "אין נתונים לייצוא",
        description: "לא נמצאו רשומות התואמות את הפילטרים",
        variant: "destructive",
      });
      return;
    }
    
    try {
      exportRegistrationsToCSV(
        filteredRegistrations,
        `דוח-רישומים-${new Date().toISOString().slice(0, 10)}.csv`
      );
      
      toast({
        title: "הייצוא הושלם בהצלחה",
        description: `יוצאו ${filteredRegistrations.length} רשומות לקובץ CSV`,
      });
    } catch (error) {
      toast({
        title: "שגיאה בייצוא",
        description: "אירעה שגיאה בעת ייצוא הנתונים",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold font-alef">דו"ח מאוחד - כל הרישומים</h1>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            <span>{showFilters ? 'הסתר פילטרים' : 'הצג פילטרים'}</span>
          </Button>
          
          <Button 
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            <span>ייצוא לאקסל (CSV)</span>
          </Button>
        </div>
      </div>

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

      <ReportSummaryCards registrations={filteredRegistrations} />
      
      <div className="bg-white rounded-lg shadow-card">
        <RegistrationsTable 
          registrations={filteredRegistrations}
          onAddPayment={handleOpenAddPayment}
          onDeleteRegistration={handleDeleteRegistration}
          onEditParticipant={handleEditParticipant}
        />
      </div>

      <ParticipantsDialogs
        isAddParticipantOpen={false}
        setIsAddParticipantOpen={() => {}}
        isAddPaymentOpen={isAddPaymentOpen}
        setIsAddPaymentOpen={setIsAddPaymentOpen}
        isHealthFormOpen={false}
        setIsHealthFormOpen={() => {}}
        newParticipant={{
          firstName: '',
          lastName: '',
          phone: '',
          idNumber: '',
          healthApproval: false,
        }}
        setNewParticipant={() => {}}
        registrationData={{
          requiredAmount: 0,
          discountAmount: 0,
          discountApproved: false,
        }}
        setRegistrationData={() => {}}
        currentRegistration={currentRegistration}
        participants={participants}
        newPayment={newPayment}
        setNewPayment={setNewPayment}
        currentHealthDeclaration={null}
        setCurrentHealthDeclaration={() => {}}
        handleAddParticipant={async () => {}}
        handleAddPayment={handleAddPayment}
        handleApplyDiscount={async () => {}}
        editingRegistration={editingRegistration}
        editingParticipant={editingParticipant}
        editingPayments={editingPayments}
        onSaveParticipant={handleSaveParticipant}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
      />
    </div>
  );
};

export default ReportPage;
