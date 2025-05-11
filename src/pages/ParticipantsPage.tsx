
import React from "react";
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
        totalExpectedPayment={contentProps.totalExpected}
        totalPaid={contentProps.totalPaid}
        isCalculating={contentProps.isCalculating}
      />

      <ParticipantsContent {...contentProps} />
      <ParticipantsDialogs {...dialogsProps} />
    </div>
  );
};

export default ParticipantsPage;
