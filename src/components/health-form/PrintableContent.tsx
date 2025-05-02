
import React from 'react';
import { format } from 'date-fns';
import HealthDeclarationContent from './HealthDeclarationContent';
import SignatureSection from './SignatureSection';

interface PrintableContentProps {
  participantName: string;
  participantId?: string;
  participantPhone?: string;
  formState: {
    agreement: boolean;
    notes: string;
    parentName: string;
    parentId: string;
  };
  submissionDate: Date;
  contentRef: React.RefObject<HTMLDivElement>;
  handleAgreementChange: () => void;
  handleNotesChange: () => void;
  handleParentNameChange: () => void;
  handleParentIdChange: () => void;
}

const PrintableContent: React.FC<PrintableContentProps> = ({
  participantName,
  participantId,
  participantPhone,
  formState,
  submissionDate,
  contentRef,
  handleAgreementChange,
  handleNotesChange,
  handleParentNameChange,
  handleParentIdChange
}) => {
  return (
    <div 
      ref={contentRef} 
      className="bg-white p-6 border rounded-md shadow-sm print:shadow-none print:border-none print:p-0"
      dir="rtl"
    >
      {/* Header with logo and title - visible when printing */}
      <div className="mb-6 text-center border-b pb-4">
        <h1 className="text-2xl font-bold mb-2">הצהרת בריאות</h1>
        <p className="text-sm text-gray-500">
          {`תאריך: ${format(submissionDate, 'dd/MM/yyyy HH:mm')}`}
        </p>
      </div>

      {/* Health declaration content */}
      <div className="print-content">
        <HealthDeclarationContent
          participantName={participantName}
          participantId={participantId}
          participantPhone={participantPhone}
          formState={formState}
          handleAgreementChange={handleAgreementChange}
          handleNotesChange={handleNotesChange}
          handleParentNameChange={handleParentNameChange}
          handleParentIdChange={handleParentIdChange}
        />
      </div>

      {/* Signature section */}
      <SignatureSection />
    </div>
  );
};

export default PrintableContent;
