
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
    updateParticipant,
    deleteParticipant
  } = useData();
  
  const [loading, setLoading] = useState(true);
  const [productRegistrations, setProductRegistrations] = useState<Registration[]>([]);
  const [productParticipants, setProductParticipants] = useState<Participant[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchString, setSearchString] = useState('');
  
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
      } catch (error) {
        console.error('Error loading participant data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [productId, participants, getRegistrationsByProduct]);
  
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
  
  // Calculate payment summary
  const paymentSummary = useMemo(() => {
    let totalExpected = 0;
    let totalPaid = 0;
    
    productRegistrations.forEach(reg => {
      const regPayments = getPaymentsByRegistration(reg.id);
      const paidAmount = regPayments.reduce((sum, pay) => sum + pay.amount, 0);
      
      totalExpected += reg.requiredAmount;
      totalPaid += paidAmount;
    });
    
    return {
      totalExpected,
      totalPaid,
      remaining: totalExpected - totalPaid
    };
  }, [productRegistrations, getPaymentsByRegistration]);
  
  // Handlers
  const handleSearch = (value: string) => {
    setSearchString(value);
  };
  
  const handleAddParticipant = async (newParticipant: Omit<Participant, 'id'>, registrationData: any) => {
    try {
      const participant = await addParticipant(newParticipant);
      if (participant && productId) {
        // Add registration logic here if needed
        console.log('Participant added successfully:', participant);
        setAddDialogOpen(false);
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
      } catch (error) {
        console.error('Error deleting participant:', error);
      }
    }
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
