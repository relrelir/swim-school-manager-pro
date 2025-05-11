
import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useParticipants } from "@/hooks/useParticipants";
import { Registration } from "@/types";

export const useParticipantsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { products, getPoolById } = useData();

  // Find current product
  const currentProduct = products.find(p => p.id === productId);
  
  // Get pool information if product has poolId
  const currentPool = currentProduct?.poolId ? getPoolById(currentProduct.poolId) : undefined;

  // Use the useParticipants hook
  const participantsData = useParticipants();
  
  // State for health form dialog
  const [isHealthFormOpen, setIsHealthFormOpen] = useState(false);
  
  // State for the calculated total from the table
  const [tableCalculatedTotal, setTableCalculatedTotal] = useState<number | null>(null);

  // Handle back navigation to products
  const handleBackToProducts = () => {
    if (currentProduct?.poolId && currentProduct?.seasonId) {
      navigate(`/season/${currentProduct.seasonId}/pool/${currentProduct.poolId}/products`);
    } else if (currentProduct?.seasonId) {
      navigate(`/season/${currentProduct.seasonId}/products`);
    } else {
      navigate('/'); // Fallback to home
    }
  };

  // Define a custom handler that adapts the signature for the dialogsProps
  const adaptedApplyDiscount = (amount: number, registrationId?: string) => {
    participantsData.handleApplyDiscount(amount, participantsData.setIsAddPaymentOpen, registrationId);
  };
  
  // Handler for when payment totals are calculated by the table
  const handlePaymentTotalsCalculated = useCallback((total: number) => {
    console.log("Total payments calculated by table:", total);
    setTableCalculatedTotal(total);
  }, []);
  
  // Props for ParticipantsContent
  const contentProps = {
    participants: participantsData.participants,
    registrations: participantsData.registrations,
    product: currentProduct,
    totalParticipants: participantsData.totalParticipants,
    // Use the table's calculated total if available, otherwise fall back to the hook's calculation
    totalExpected: participantsData.totalExpected,
    totalPaid: tableCalculatedTotal !== null ? tableCalculatedTotal : participantsData.totalPaid,
    registrationsFilled: participantsData.registrationsFilled,
    isCalculating: participantsData.isCalculating || false,
    getParticipantForRegistration: participantsData.getParticipantForRegistration,
    getPaymentsForRegistration: participantsData.getPaymentsForRegistration,
    getHealthDeclarationForRegistration: participantsData.getHealthDeclarationForRegistration,
    calculatePaymentStatus: participantsData.calculatePaymentStatus,
    getStatusClassName: participantsData.getStatusClassName,
    onAddPayment: (registration: Registration) => {
      participantsData.setCurrentRegistration(registration);
      participantsData.setIsAddPaymentOpen(true);
    },
    onDeleteRegistration: participantsData.handleDeleteRegistration,
    onUpdateHealthApproval: participantsData.handleUpdateHealthApproval,
    onOpenHealthForm: participantsData.handleOpenHealthForm,
    onPaymentTotalsCalculated: handlePaymentTotalsCalculated // Add the handler
  };

  // Props for ParticipantsDialogs
  const dialogsProps = {
    isAddParticipantOpen: participantsData.isAddParticipantOpen,
    setIsAddParticipantOpen: participantsData.setIsAddParticipantOpen,
    isAddPaymentOpen: participantsData.isAddPaymentOpen,
    setIsAddPaymentOpen: participantsData.setIsAddPaymentOpen,
    isHealthFormOpen,
    setIsHealthFormOpen,
    newParticipant: participantsData.newParticipant,
    setNewParticipant: participantsData.setNewParticipant,
    registrationData: participantsData.registrationData,
    setRegistrationData: participantsData.setRegistrationData,
    currentRegistration: participantsData.currentRegistration,
    participants: participantsData.participants,
    newPayment: participantsData.newPayment,
    setNewPayment: participantsData.setNewPayment,
    currentHealthDeclaration: participantsData.currentHealthDeclaration,
    setCurrentHealthDeclaration: participantsData.setCurrentHealthDeclaration,
    handleAddParticipant: participantsData.handleAddParticipant,
    handleAddPayment: participantsData.handleAddPayment,
    handleApplyDiscount: adaptedApplyDiscount
  };

  return {
    loading: participantsData.loading,
    currentProduct,
    currentPool,
    contentProps,
    dialogsProps,
    handleBackToProducts,
    setIsAddParticipantOpen: participantsData.setIsAddParticipantOpen
  };
};
