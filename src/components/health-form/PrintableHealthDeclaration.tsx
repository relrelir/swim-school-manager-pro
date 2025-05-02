
'use client';

import React, { useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import HealthPrintControls from './HealthPrintControls';
import PrintableContent from './PrintableContent';
import { generateHealthDeclarationPdf } from '@/services/healthDeclarationPdfService';

interface PrintableHealthDeclarationProps {
  participantName: string;
  participantId?: string;
  participantPhone?: string;
  formState: {
    agreement: boolean;
    notes: string;
    parentName: string;
    parentId: string;
  };
  submissionDate?: Date;
}

const PrintableHealthDeclaration: React.FC<PrintableHealthDeclarationProps> = ({
  participantName,
  participantId,
  participantPhone,
  formState,
  submissionDate = new Date()
}) => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // Function to handle printing
  const handlePrint = () => {
    window.print();
  };

  // Function to handle PDF download
  const handleDownloadPdf = async () => {
    try {
      await generateHealthDeclarationPdf(
        participantName,
        participantId,
        participantPhone,
        formState,
        submissionDate
      );
      
      toast({
        title: "PDF נוצר בהצלחה",
        description: "הצהרת הבריאות הורדה למחשב שלך",
        duration: 5000
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "שגיאה ביצירת ה-PDF",
        description: "אירעה שגיאה בעת יצירת המסמך",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // Function to export as image (fallback solution)
  const handleExportImage = async () => {
    try {
      // Dynamic import to avoid server-side rendering issues
      const htmlToImage = await import('html-to-image');
      
      if (!printRef.current) {
        throw new Error("Could not find the declaration content");
      }

      // Create a downloadable image
      const dataUrl = await htmlToImage.toPng(printRef.current, { quality: 1 });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `הצהרת_בריאות_${participantName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "התמונה נוצרה בהצלחה",
        description: "הצהרת הבריאות נשמרה כתמונה"
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "שגיאה בייצוא התמונה",
        description: "אירעה שגיאה בעת יצירת התמונה",
        variant: "destructive"
      });
    }
  };

  // Dummy handlers for HealthDeclarationContent component
  // These are needed since we're reusing HealthDeclarationContent component
  // but don't actually need the handlers in the printable version
  const dummyHandler = () => {};

  return (
    <div className="p-4 max-w-3xl mx-auto" dir="rtl">
      {/* Control buttons - hidden when printing */}
      <HealthPrintControls 
        onPrint={handlePrint}
        onDownloadPdf={handleDownloadPdf}
        onExportImage={handleExportImage}
      />

      {/* Printable content */}
      <PrintableContent
        participantName={participantName}
        participantId={participantId}
        participantPhone={participantPhone}
        formState={formState}
        submissionDate={submissionDate}
        contentRef={printRef}
        handleAgreementChange={dummyHandler}
        handleNotesChange={dummyHandler}
        handleParentNameChange={dummyHandler}
        handleParentIdChange={dummyHandler}
      />
    </div>
  );
};

export default PrintableHealthDeclaration;
