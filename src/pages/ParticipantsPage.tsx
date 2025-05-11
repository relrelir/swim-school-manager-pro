
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { ChevronLeft } from "lucide-react";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

// Import components
import ParticipantsHeader from "@/components/participants/ParticipantsHeader";
import ParticipantsSummaryCards from "@/components/participants/ParticipantsSummaryCards";
import ParticipantsDialogs from "@/components/participants/ParticipantsDialogs";
import ParticipantsContent from "@/components/participants/ParticipantsContent";
import { useParticipants } from "@/hooks/useParticipants";

const ParticipantsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { products, getPoolById } = useData();

  // Find current product
  const currentProduct = products.find(p => p.id === productId);
  
  // Get pool information if product has poolId
  const currentPool = currentProduct?.poolId ? getPoolById(currentProduct.poolId) : undefined;

  // Use the useParticipants hook instead of useParticipantData
  const {
    loading,
    product,
    participants,
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
    getHealthDeclarationForRegistration
  } = useParticipants();
  
  // State for health form dialog
  const [isHealthFormOpen, setIsHealthFormOpen] = useState(false);

  // Handle back navigation to products
  const handleBackToProducts = () => {
    if (currentProduct?.poolId && currentProduct?.seasonId) {
      navigate(`/season/${currentProduct.seasonId}/pool/${currentProduct.poolId}/products`);
    } else if (currentProduct?.seasonId) {
      navigate(`/season/${currentProduct.seasonId}/products`);
    } else {
      navigate('/'); // Fallback to home if we can't determine the proper back link
    }
  };

  if (loading || !currentProduct) {
    return <div className="flex justify-center items-center h-screen">טוען...</div>;
  }
  
  // Props for ParticipantsContent
  const contentProps = {
    participants,
    registrations,
    product: currentProduct,
    totalParticipants,
    totalExpected,
    totalPaid,
    registrationsFilled,
    setIsAddPaymentOpen,
    setCurrentRegistration,
    setIsHealthFormOpen,
    handleDeleteRegistration,
    handleUpdateHealthApproval,
    handleOpenHealthForm,
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName,
    calculatePaymentStatus,
    getHealthDeclarationForRegistration,
    onAddPayment: (registration: any) => {
      setCurrentRegistration(registration);
      setIsAddPaymentOpen(true);
    },
    onDeleteRegistration: handleDeleteRegistration,
    onUpdateHealthApproval: handleUpdateHealthApproval,
    onOpenHealthForm: handleOpenHealthForm
  };

  // Props for ParticipantsDialogs
  const dialogsProps = {
    isAddParticipantOpen,
    setIsAddParticipantOpen,
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    isHealthFormOpen: isHealthFormOpen,
    setIsHealthFormOpen: setIsHealthFormOpen,
    newParticipant,
    setNewParticipant,
    registrationData,
    setRegistrationData,
    currentRegistration,
    participants,
    newPayment,
    setNewPayment,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    handleAddParticipant,
    handleAddPayment,
    handleApplyDiscount: (amount: number, registrationId?: string) => {
      handleApplyDiscount(amount, setIsAddPaymentOpen, registrationId);
    }
  };
  
  return (
    <div className="p-6">
      {/* Breadcrumb navigation */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">עונות</BreadcrumbLink>
            </BreadcrumbItem>
            {currentProduct.seasonId && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/season/${currentProduct.seasonId}/pools`}>
                    בריכות
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            {currentPool && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/season/${currentProduct.seasonId}/pool/${currentPool.id}/products`}>
                    מוצרים - {currentPool.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-bold">משתתפים - {currentProduct.name}</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex justify-between items-center mb-6">
        <ParticipantsHeader 
          product={currentProduct}
          onAddParticipant={() => setIsAddParticipantOpen(true)}
        />
        <Button variant="outline" onClick={handleBackToProducts} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          <span>חזרה למוצרים</span>
        </Button>
      </div>

      <ParticipantsSummaryCards 
        product={currentProduct}
        activeCount={totalParticipants - (participants.filter(p => !p.healthApproval).length)}
        inactiveCount={participants.filter(p => !p.healthApproval).length}
        totalExpectedPayment={totalExpected}
        totalPaid={totalPaid}
      />

      <ParticipantsContent {...contentProps} />
      <ParticipantsDialogs {...dialogsProps} />
    </div>
  );
};

export default ParticipantsPage;
