
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';

interface HealthPrintControlsProps {
  onPrint: () => void;
  onDownloadPdf: () => void;
  onExportImage: () => void;
}

const HealthPrintControls: React.FC<HealthPrintControlsProps> = ({
  onPrint,
  onDownloadPdf,
  onExportImage
}) => {
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  
  // Wrapper functions to handle loading states
  const handleDownloadPdf = async () => {
    setIsPdfLoading(true);
    try {
      await onDownloadPdf();
    } catch (error) {
      console.error("PDF download error:", error);
    } finally {
      setIsPdfLoading(false);
    }
  };
  
  const handleExportImage = async () => {
    setIsImageLoading(true);
    try {
      await onExportImage();
    } catch (error) {
      console.error("Image export error:", error);
    } finally {
      setIsImageLoading(false);
    }
  };
  
  return (
    <div className="flex justify-between mb-6 print:hidden">
      <h1 className="text-2xl font-bold">הצהרת בריאות</h1>
      <div className="flex gap-2">
        <Button onClick={onPrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          הדפסה
        </Button>
        <Button 
          onClick={handleDownloadPdf} 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={isPdfLoading}
        >
          {isPdfLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          הורד כ-PDF
        </Button>
        <Button 
          onClick={handleExportImage} 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={isImageLoading}
        >
          {isImageLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          שמירה כתמונה
        </Button>
      </div>
    </div>
  );
};

export default HealthPrintControls;
