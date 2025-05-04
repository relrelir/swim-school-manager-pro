
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

      {/* Printable content - adjusted for single page */}
      <div 
        ref={printRef} 
        className="bg-white p-6 border rounded-md shadow-sm print:shadow-none print:border-none print:p-0 print:text-sm"
        dir="rtl"
      >
        {/* Header with title - visible when printing */}
        <div className="mb-4 text-center border-b pb-3">
          <h1 className="text-xl font-bold mb-1">הצהרת בריאות</h1>
          <p className="text-sm text-gray-500">
            {`תאריך: ${format(submissionDate, 'dd/MM/yyyy HH:mm')}`}
          </p>
        </div>

        {/* Participant information section */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">פרטי המשתתף</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-semibold mb-1">שם מלא:</p>
              <p>{participantName}</p>
            </div>
            {participantId && (
              <div>
                <p className="font-semibold mb-1">תעודת זהות:</p>
                <p>{participantId}</p>
              </div>
            )}
            {participantPhone && (
              <div>
                <p className="font-semibold mb-1">טלפון:</p>
                <p>{participantPhone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Parent/signer information section */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">פרטי ההורה/אפוטרופוס</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-semibold mb-1">שם מלא:</p>
              <p>{formState.parentName || 'לא צוין'}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">תעודת זהות:</p>
              <p>{formState.parentId || 'לא צוין'}</p>
            </div>
          </div>
        </div>

        {/* Declaration content */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">תוכן ההצהרה</h3>
          <div className="text-sm space-y-1 p-2 bg-gray-50 rounded-md">
            <p>• המשתתף נמצא/ת בכושר ובמצב בריאותי תקין המאפשר השתתפות בפעילות.</p>
            <p>• לא ידוע לי על מגבלות רפואיות המונעות להשתתף בפעילות.</p>
            <p>• לא ידוע לי על רגישויות, מחלות או בעיות רפואיות אחרות שעלולות להשפיע על ההשתתפות בפעילות.</p>
            <p>• אני מתחייב/ת להודיע למדריכים על כל שינוי במצבו הבריאותי.</p>
          </div>
        </div>
        
        {/* Medical notes section */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">הערות רפואיות</h3>
          <div className="p-2 bg-gray-50 rounded-md">
            <p>{formState.notes || 'אין הערות רפואיות נוספות'}</p>
          </div>
        </div>

        {/* Confirmation section */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">אישור</h3>
          <p className="text-sm mb-3">אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.</p>
        </div>

        {/* Signature section */}
        <div className="mt-5">
          <div className="mb-2">
            <p className="font-semibold mb-1">חתימת ההורה/אפוטרופוס:</p>
            {formState.parentName ? (
              <p>{formState.parentName}</p>
            ) : (
              <div className="h-8 border-b border-dashed border-gray-400 w-64"></div>
            )}
          </div>
          
          {formState.parentId && (
            <div className="mb-2">
              <p className="font-semibold mb-1">ת.ז.:</p>
              <p>{formState.parentId}</p>
            </div>
          )}
          
          <div className="mt-3">
            <p className="font-semibold mb-1">תאריך:</p>
            <p>{format(submissionDate, 'dd/MM/yyyy')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableHealthDeclaration;
