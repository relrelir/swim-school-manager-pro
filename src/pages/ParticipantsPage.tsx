
import React, { useState } from "react";
import { useParticipantsPage } from "@/hooks/useParticipantsPage";
import ParticipantsBreadcrumb from "@/components/participants/ParticipantsBreadcrumb";
import ParticipantsPageHeader from "@/components/participants/ParticipantsPageHeader";
import ParticipantsSummaryCards from "@/components/participants/ParticipantsSummaryCards";
import ParticipantsContent from "@/components/participants/ParticipantsContent";
import ParticipantsDialogs from "@/components/participants/ParticipantsDialogs";

const ParticipantsPage: React.FC = () => {
  const {
    loading,
    currentProduct,
    currentPool,
    contentProps,
    dialogsProps,
    handleBackToProducts,
    setIsAddParticipantOpen
  } = useParticipantsPage();

  // Track the stable table-calculated total to avoid flickering
  const [tableCalculatedTotal, setTableCalculatedTotal] = useState<number | null>(null);
  
  // Reset display total as requested
  const displayPaidTotal = 0; // We'll update this based on new calculation instructions

  if (loading || !currentProduct) {
    return <div className="flex justify-center items-center h-screen">טוען...</div>;
  }

  return (
    <div className="p-6">
      {/* Breadcrumb navigation */}
      <div className="mb-4">
        <ParticipantsBreadcrumb
          seasonId={currentProduct.seasonId}
          poolId={currentProduct.poolId}
          productName={currentProduct.name}
          poolName={currentPool?.name}
        />
      </div>

      <ParticipantsPageHeader 
        product={currentProduct}
        onAddParticipant={() => setIsAddParticipantOpen(true)}
        onBackToProducts={handleBackToProducts}
      />

      <ParticipantsSummaryCards 
        product={currentProduct}
        activeCount={contentProps.totalParticipants - (contentProps.participants.filter(p => !p.healthApproval).length)}
        inactiveCount={contentProps.participants.filter(p => !p.healthApproval).length}
        totalExpectedPayment={0} // Reset as requested
        totalPaid={0} // Reset as requested
        isCalculating={false}
      />

      <ParticipantsContent 
        {...contentProps} 
        onPaymentTotalsCalculated={(total) => {
          console.log("Payment totals calculation reset");
          setTableCalculatedTotal(0);
        }}
      />
      <ParticipantsDialogs {...dialogsProps} />
    </div>
  );
};

export default ParticipantsPage;
