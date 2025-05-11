
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
import ParticipantsContent from "@/components/participants/ParticipantsContent";
import ParticipantsDialogs from "@/components/participants/ParticipantsDialogs";
import ParticipantsHeader from "@/components/participants/ParticipantsHeader";
import ParticipantsSummaryCards from "@/components/participants/ParticipantsSummaryCards";
import { useParticipants } from "@/hooks/useParticipants";

const ParticipantsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { products, getPoolById } = useData();

  // Find current product
  const currentProduct = products.find(p => p.id === productId);
  
  // Get pool information if product has poolId
  const currentPool = currentProduct?.poolId ? getPoolById(currentProduct.poolId) : undefined;

  const {
    isLoading,
    participants,
    isAddDialogOpen,
    setIsAddDialogOpen,
    filteredParticipants,
    searchTerm,
    handleSearchChange,
    handleAddParticipant,
    handleNavigateToHealth,
    handleDeleteParticipant,
    statusCounts,
    paymentInfo
  } = useParticipants(productId);
  
  const [healthFormOpen, setHealthFormOpen] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

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

  if (isLoading || !currentProduct) {
    return <div className="flex justify-center items-center h-screen">טוען...</div>;
  }
  
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
          onAddParticipant={() => setIsAddDialogOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        <Button variant="outline" onClick={handleBackToProducts} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          <span>חזרה למוצרים</span>
        </Button>
      </div>

      <ParticipantsSummaryCards 
        statusCounts={statusCounts}
        paymentInfo={paymentInfo}
        product={currentProduct}
      />

      <ParticipantsContent 
        product={currentProduct}
        participants={filteredParticipants}
        onNavigateToHealth={handleNavigateToHealth}
        onDeleteParticipant={handleDeleteParticipant}
        setHealthFormOpen={setHealthFormOpen}
        setSelectedParticipantId={setSelectedParticipantId}
      />

      <ParticipantsDialogs 
        product={currentProduct}
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        onAddParticipant={handleAddParticipant}
        healthFormOpen={healthFormOpen}
        setHealthFormOpen={setHealthFormOpen}
        selectedParticipantId={selectedParticipantId}
      />
    </div>
  );
};

export default ParticipantsPage;
