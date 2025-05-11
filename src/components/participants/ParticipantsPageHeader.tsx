
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import ParticipantsHeader from "@/components/participants/ParticipantsHeader";
import { Product } from "@/types";

interface ParticipantsPageHeaderProps {
  product: Product | undefined;
  onAddParticipant: () => void;
  onBackToProducts: () => void;
}

const ParticipantsPageHeader: React.FC<ParticipantsPageHeaderProps> = ({
  product,
  onAddParticipant,
  onBackToProducts
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <ParticipantsHeader 
        product={product}
        onAddParticipant={onAddParticipant}
      />
      <Button variant="outline" onClick={onBackToProducts} className="flex items-center gap-2">
        <ChevronLeft className="h-4 w-4" />
        <span>חזרה למוצרים</span>
      </Button>
    </div>
  );
};

export default ParticipantsPageHeader;
