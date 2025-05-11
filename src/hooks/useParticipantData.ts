
import { useState, useEffect, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Participant, Registration, Payment } from '@/types';

export const useParticipantData = (productId?: string) => {
  const { 
    products, 
    participants, 
    registrations,
    payments, 
    getRegistrationsByProduct,
    getPaymentsByRegistration,
    addParticipant,
    addRegistration,
    updateParticipant,
    deleteParticipant
  } = useData();
  
  const [loading, setLoading] = useState(true);
  const [productRegistrations, setProductRegistrations] = useState<Registration[]>([]);
  const [productParticipants, setProductParticipants] = useState<Participant[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [paymentSummary, setPaymentSummary] = useState({
    totalExpected: 0,
    totalPaid: 0,
    remaining: 0
  });
  
  // Load product registrations and participants
  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        // Get registrations for this product
        const regs = getRegistrationsByProduct(productId);
        setProductRegistrations(regs);
        
        // Get participants for these registrations
        const parts = regs
          .map(reg => participants.find(p => p.id === reg.participantId))
          .filter(Boolean) as Participant[];
          
        setProductParticipants(parts);
        
        // Calculate payment summary
        let totalExpected = 0;
        let totalPaid = 0;
        
        for (const reg of regs) {
          const regPayments = await getPaymentsByRegistration(reg.id);
          const paidAmount = regPayments.reduce((sum, pay) => sum + Number(pay.amount), 0);
          
          totalExpected += reg.requiredAmount;
          totalPaid += paidAmount;
        }
        
        setPaymentSummary({
          totalExpected,
          totalPaid,
          remaining: totalExpected - totalPaid
        });
        
      } catch (error) {
        console.error('Error loading participant data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [productId, participants, getRegistrationsByProduct, getPaymentsByRegistration]);
  
  // Filter participants by search term
  const filteredParticipants = useMemo(() => {
    if (!searchString) return productParticipants;
    
    return productParticipants.filter(p => {
      const fullName = `${p.firstName} ${p.lastName}`;
      return fullName.includes(searchString) || 
             p.phone.includes(searchString) || 
             p.idNumber.includes(searchString);
    });
  }, [productParticipants, searchString]);
  
  // Calculate status counts
  const statusSummary = useMemo(() => {
    const active = productParticipants.filter(p => p.healthApproval).length;
    const inactive = productParticipants.length - active;
    
    return {
      active,
      inactive,
      total: productParticipants.length
    };
  }, [productParticipants]);
  
  // Handlers
  const handleSearch = (value: string) => {
    setSearchString(value);
  };
  
  const handleAddParticipant = async (e: React.FormEvent, newParticipantData: Omit<Participant, 'id'>, registrationData: any, resetForm: () => void) => {
    e.preventDefault();
    
    try {
      // Add participant first
      const participant = await addParticipant(newParticipantData);
      if (participant && productId) {
        // Then add registration
        const newRegistration: Omit<Registration, 'id'> = {
          productId: productId,
          participantId: participant.id,
          requiredAmount: registrationData.requiredAmount,
          paidAmount: registrationData.paidAmount,
          receiptNumber: registrationData.receiptNumber,
          discountApproved: registrationData.discountApproved,
          registrationDate: new Date().toISOString(),
        };
        
        await addRegistration(newRegistration);
        
        // Reset form and close dialog
        resetForm();
        setAddDialogOpen(false);
        
        // Refresh participant data
        const updatedRegs = getRegistrationsByProduct(productId);
        setProductRegistrations(updatedRegs);
        
        const updatedParts = updatedRegs
          .map(reg => participants.find(p => p.id === reg.participantId))
          .filter(Boolean) as Participant[];
          
        setProductParticipants(updatedParts);
        
        return participant;
      }
    } catch (error) {
      console.error('Error adding participant:', error);
    }
    return null;
  };
  
  const handleHealthFormOpen = (participantId: string) => {
    console.log('Opening health form for participant:', participantId);
    // Implement health form opening logic here
  };
  
  const handleDeleteParticipant = async (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק משתתף זה?')) {
      try {
        await deleteParticipant(id);
        console.log('Participant deleted successfully');
        return true;
      } catch (error) {
        console.error('Error deleting participant:', error);
        return false;
      }
    }
    return false;
  };
  
  return {
    loading,
    participants: productParticipants,
    filteredParticipants,
    productRegistrations,
    addDialogOpen,
    setAddDialogOpen,
    searchString,
    handleSearch,
    handleAddParticipant,
    handleHealthFormOpen,
    handleDeleteParticipant,
    statusSummary,
    paymentSummary
  };
};
