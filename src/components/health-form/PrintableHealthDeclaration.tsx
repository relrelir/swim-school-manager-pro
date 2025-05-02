
'use client';

import React, { useRef } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import HealthDeclarationContent from './HealthDeclarationContent';
import { makePdf } from '@/pdf/pdfService';
import type { Content, StyleDictionary } from 'pdfmake/interfaces';

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
      // Create PDF content
      const content: Content[] = [
        // Header
        { text: 'הצהרת בריאות', style: 'header', alignment: 'center' },
        { text: `תאריך: ${format(submissionDate, 'dd/MM/yyyy HH:mm')}`, style: 'subheader', alignment: 'center' },
        
        // Participant details
        { text: 'פרטי המשתתף', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        {
          columns: [
            { text: participantName, width: '*', alignment: 'right' },
            { text: 'שם מלא:', width: 'auto', alignment: 'right', bold: true },
          ],
          columnGap: 10,
        },
      ];
      
      // Add participant ID if available
      if (participantId) {
        content.push({
          columns: [
            { text: participantId, width: '*', alignment: 'right' },
            { text: 'תעודת זהות:', width: 'auto', alignment: 'right', bold: true },
          ],
          columnGap: 10,
          margin: [0, 5, 0, 0]
        });
      }
      
      // Add participant phone if available
      if (participantPhone) {
        content.push({
          columns: [
            { text: participantPhone, width: '*', alignment: 'right' },
            { text: 'טלפון:', width: 'auto', alignment: 'right', bold: true },
          ],
          columnGap: 10,
          margin: [0, 5, 0, 0]
        });
      }
      
      // Health declaration
      content.push(
        { text: 'הצהרת בריאות', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        { text: 'אני מצהיר/ה כי בריאות ילדי תקינה ומאפשרת השתתפות בפעילות.', margin: [0, 0, 0, 10] },
        { text: 'במידה וקיים מידע רפואי חשוב, אנא פרט:', margin: [0, 0, 0, 5], fontSize: 11 },
        { text: formState.notes || 'אין הערות מיוחדות', margin: [0, 0, 0, 15] },
        
        // Parent details
        { text: 'פרטי ההורה/אפוטרופוס', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        {
          columns: [
            { text: formState.parentName, width: '*', alignment: 'right' },
            { text: 'שם מלא:', width: 'auto', alignment: 'right', bold: true },
          ],
          columnGap: 10,
        },
        {
          columns: [
            { text: formState.parentId, width: '*', alignment: 'right' },
            { text: 'תעודת זהות:', width: 'auto', alignment: 'right', bold: true },
          ],
          columnGap: 10,
          margin: [0, 5, 0, 0]
        },
        
        // Agreement
        { text: 'אישור', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        { text: 'אני מאשר/ת כי המידע שמסרתי לעיל הוא נכון ומדויק.', margin: [0, 0, 0, 10] },
        
        // Signature section
        { text: 'חתימה:', margin: [0, 30, 0, 5], bold: true },
        { text: '__________________________', margin: [0, 0, 0, 10] },
        { text: 'תאריך:', margin: [0, 10, 0, 5], bold: true },
        { text: '__________________________', margin: [0, 0, 0, 0] }
      );
      
      // Define styles with proper type
      const styles: StyleDictionary = {
        header: {
          fontSize: 20,
          bold: true,
          margin: [0, 0, 0, 10] as [number, number, number, number]
        },
        subheader: {
          fontSize: 12,
          margin: [0, 0, 0, 20] as [number, number, number, number]
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          decoration: 'underline'
        }
      };

      const fileName = `הצהרת_בריאות_${participantName.replace(/\s+/g, '_')}.pdf`;
      
      // Generate and download PDF
      await makePdf({ content, styles }, fileName, true);
      
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
          <Button onClick={handleDownloadPdf} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            הורד כ-PDF
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
            handleAgreementChange={() => {}}
            handleNotesChange={() => {}}
            handleParentNameChange={() => {}}
            handleParentIdChange={() => {}}
          />
        </div>

        {/* Signature section - only visible when printing */}
        <div className="mt-8 pt-4 border-t">
          <div className="flex flex-col gap-8">
            <div>
              <p className="font-semibold mb-1">חתימת ההורה/אפוטרופוס:</p>
              <div className="h-10 border-b border-dashed border-gray-400 w-64"></div>
            </div>
            <div>
              <p className="font-semibold mb-1">תאריך:</p>
              <div className="h-10 border-b border-dashed border-gray-400 w-32"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableHealthDeclaration;
