
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCardIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Registration } from '@/types';

interface PaymentActionButtonProps {
  registration: Registration;
  onAddPayment: (registration: Registration) => void;
}

const PaymentActionButton: React.FC<PaymentActionButtonProps> = ({
  registration,
  onAddPayment
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onAddPayment(registration)}
        >
          <CreditCardIcon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>הוסף תשלום</TooltipContent>
    </Tooltip>
  );
};

export default PaymentActionButton;
