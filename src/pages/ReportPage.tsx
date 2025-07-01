
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { exportRegistrationsToCSV } from '@/utils/exportUtils';
import { ReportFilters } from '@/utils/reportFilters';
import ReportSummaryCards from '@/components/report/ReportSummaryCards';
import RegistrationsTable from '@/components/report/RegistrationsTable';
import ReportFiltersComponent from '@/components/report/ReportFilters';
import ParticipantsDialogs from '@/components/participants/ParticipantsDialogs';
import { filterRegistrations } from '@/utils/reportFilters';
import { FileDown, Filter } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Registration, Participant, HealthDeclaration, Payment } from '@/types';

const ReportPage: React.FC = () => {
  const { 
    seasons, 
    products, 
    pools, 
    getAllRegistrationsWithDetails,
    participants,
    addPayment,
    deleteRegistration,
    updateRegistration,
    updateParticipant,
    getHealthDeclarationForRegistration,
    addHealthDeclaration
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
  
  // Dialog states for actions
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isHealthFormOpen, setIsHealthFormOpen] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const [currentHealthDeclaration, setCurrentHealthDeclaration] = useState<{
    registrationId: string;
    participantName: string;
    phone: string;
    declaration?: HealthDeclaration;
  } | null>(null);
  
  // Payment dialog state
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    receiptNumber: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    registrationId: ''
  });
  
  const allRegistrations = getAllRegistrationsWithDetails();
  const filteredRegistrations = filterRegistrations(allRegistrations, filters);

  // Handle adding payment
  const handleAddPayment = (registration: Registration) => {
    setCurrentRegistration(registration);
    setNewPayment({
      amount: 0,
      receiptNumber: '',
      paymentDate: new Date().toISOString().slice(0, 10),
      registrationId: registration.id
    });
    setIsAddPaymentOpen(true);
  };

  // Handle payment submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentRegistration) return;

    try {
      await addPayment({
        registrationId: currentRegistration.id,
        amount: newPayment.amount,
        receiptNumber: newPayment.receiptNumber,
        paymentDate: new Date(newPayment.paymentDate).toISOString(),
      });

      toast({
        title: "התשלום נוסף בהצלחה",
        description: `נוסף תשלום של ${newPayment.amount}₪`,
      });

      setIsAddPaymentOpen(false);
      setCurrentRegistration(null);
      setNewPayment({
        amount: 0,
        receiptNumber: '',
        paymentDate: new Date().toISOString().slice(0, 10),
        registrationId: ''
      });
    } catch (error) {
      toast({
        title: "שגיאה בהוספת התשלום",
        description: "אירעה שגיאה בעת הוספת התשלום",
        variant: "destructive",
      });
    }
  };

  // Handle discount application
  const handleApplyDiscount = async (amount: number, registrationId?: string) => {
    const targetRegistrationId = registrationId || currentRegistration?.id;
    if (!targetRegistrationId) return;

    try {
      // Find the registration to update
      const registration = allRegistrations.find(reg => reg.id === targetRegistrationId);
      if (!registration) return;

      // Update the registration with discount
      await updateRegistration({
        ...registration,
        discountAmount: amount,
        discountApproved: true
      });

      toast({
        title: "ההנחה הוחלה בהצלחה",
        description: `הוחלה הנחה של ${amount}₪`,
      });
    } catch (error) {
      toast({
        title: "שגיאה בהחלת הנחה",
        description: "אירעה שגיאה בעת החלת ההנחה",
        variant: "destructive",
      });
    }
  };

  // Handle health form opening
  const handleOpenHealthForm = async (registrationId: string) => {
    const registration = allRegistrations.find(reg => reg.id === registrationId);
    if (!registration) return;

    const participant = participants.find(p => p.id === registration.participantId);
    if (!participant) return;

    try {
      const healthDeclaration = await getHealthDeclarationForRegistration(registrationId);

      setCurrentHealthDeclaration({
        registrationId,
        participantName: `${participant.firstName} ${participant.lastName}`,
        phone: participant.phone,
        declaration: healthDeclaration
      });

      setIsHealthFormOpen(true);
    } catch (error) {
      // Handle case where no health declaration exists
      setCurrentHealthDeclaration({
        registrationId,
        participantName: `${participant.firstName} ${participant.lastName}`,
        phone: participant.phone,
        declaration: undefined
      });

      setIsHealthFormOpen(true);
    }
  };

  // Handle registration deletion
  const handleDeleteRegistration = async (registrationId: string) => {
    try {
      await deleteRegistration(registrationId);
      toast({
        title: "הרישום נמחק בהצלחה",
        description: "הרישום הוסר מהמערכת",
      });
    } catch (error) {
      toast({
        title: "שגיאה במחיקת הרישום",
        description: "אירעה שגיאה בעת מחיקת הרישום",
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
          onAddPayment={handleAddPayment}
          onDeleteRegistration={handleDeleteRegistration}
          onOpenHealthForm={handleOpenHealthForm}
        />
      </div>

      {/* Action Dialogs */}
      <ParticipantsDialogs
        isAddParticipantOpen={false}
        setIsAddParticipantOpen={() => {}}
        isAddPaymentOpen={isAddPaymentOpen}
        setIsAddPaymentOpen={setIsAddPaymentOpen}
        isHealthFormOpen={isHealthFormOpen}
        setIsHealthFormOpen={setIsHealthFormOpen}
        newParticipant={{
          firstName: '',
          lastName: '',
          idNumber: '',
          phone: '',
          healthApproval: false,
        }}
        setNewParticipant={() => {}}
        registrationData={{
          requiredAmount: 0,
          paidAmount: 0,
          receiptNumber: '',
          discountApproved: false,
        }}
        setRegistrationData={() => {}}
        currentRegistration={currentRegistration}
        participants={participants}
        newPayment={newPayment}
        setNewPayment={setNewPayment}
        currentHealthDeclaration={currentHealthDeclaration}
        setCurrentHealthDeclaration={setCurrentHealthDeclaration}
        handleAddParticipant={() => {}}
        handleAddPayment={handlePaymentSubmit}
        handleApplyDiscount={handleApplyDiscount}
      />
    </div>
  );
};

export default ReportPage;
