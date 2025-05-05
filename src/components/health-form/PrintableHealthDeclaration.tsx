
import React, { useRef } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import HealthDeclarationContent from './HealthDeclarationContent';

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

  return (
    <div className="p-4 max-w-3xl mx-auto" dir="rtl">
      {/* Control buttons - hidden when printing */}
      <div className="flex justify-between mb-6 print:hidden">
        <h1 className="text-2xl font-bold">הצהרת בריאות</h1>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            הדפסה
          </Button>
          <Button onClick={handleExportImage} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            שמירה כתמונה
          </Button>
        </div>
      </div>

      {/* Printable content */}
      <div 
        ref={printRef} 
        className="bg-white p-6 border rounded-md shadow-sm print:shadow-none print:border-none print:p-0 print:max-w-full"
        dir="rtl"
      >
        {/* Header with title - visible when printing */}
        <div className="mb-6 text-center border-b pb-4">
          <h1 className="text-2xl font-bold mb-2">הצהרת בריאות</h1>
          <p className="text-sm text-gray-500">
            {`תאריך: ${format(submissionDate, 'dd/MM/yyyy HH:mm')}`}
          </p>
        </div>

        {/* SECTION 1: Participant details - CLEARLY SEPARATED */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">פרטי המשתתף</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold mb-1">שם מלא:</p>
              <p className="mb-2">{participantName}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">תעודת זהות:</p>
              <p className="mb-2 text-left">{participantId || 'לא צוין'}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">טלפון:</p>
              <p className="mb-2 text-left">{participantPhone || 'לא צוין'}</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Parent/guardian information - CLEARLY SEPARATED */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="text-lg font-semibold mb-3">פרטי ההורה/אפוטרופוס</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-semibold mb-1">שם מלא:</p>
              <p className="mb-2">{formState.parentName || 'לא צוין'}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">תעודת זהות:</p>
              <p className="mb-2 text-left">{formState.parentId || 'לא צוין'}</p>
            </div>
          </div>
        </div>

        {/* Health declaration content */}
        <div className="print-content print:text-sm mt-6 pt-4 border-t">
          <h3 className="text-lg font-semibold mb-3">תוכן ההצהרה</h3>
          <HealthDeclarationContent
            participantName={participantName}
            participantId={participantId}
            participantPhone={participantPhone}
            formState={{
              ...formState,
              // Don't show notes here - they'll be in their own section
              notes: ''
            }}
            handleAgreementChange={() => {}}
            handleNotesChange={() => {}}
            handleParentNameChange={() => {}}
            handleParentIdChange={() => {}}
            hideNotes={true}
          />
        </div>

        {/* SECTION 3: Medical notes - CLEARLY SEPARATED */}
        <div className="mt-4 pt-3 border-t">
          <h3 className="text-lg font-semibold mb-3">הערות רפואיות</h3>
          <div className="p-3 bg-gray-50 rounded-md">
            {formState.notes && formState.notes.trim() !== '' ? (
              <p>{formState.notes}</p>
            ) : (
              <p>אין הערות נוספות</p>
            )}
          </div>
        </div>

        {/* Signature section - more compact */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex flex-col gap-4 print:gap-2">
            <div>
              <p className="font-semibold mb-1">חתימת ההורה/אפוטרופוס:</p>
              {formState.parentName && formState.parentName.trim() !== '' ? (
                <p className="mb-2">{formState.parentName}</p>
              ) : (
                <div className="h-8 border-b border-dashed border-gray-400 w-64"></div>
              )}
            </div>
            <div>
              <p className="font-semibold mb-1">תאריך:</p>
              <div className="h-8 border-b border-dashed border-gray-400 w-32"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableHealthDeclaration;
