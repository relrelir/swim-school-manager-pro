
'use client';

import React from 'react';
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
  return (
    <div className="flex justify-between mb-6 print:hidden">
      <h1 className="text-2xl font-bold">הצהרת בריאות</h1>
      <div className="flex gap-2">
        <Button onClick={onPrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          הדפסה
        </Button>
        <Button onClick={onDownloadPdf} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          הורד כ-PDF
        </Button>
        <Button onClick={onExportImage} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          שמירה כתמונה
        </Button>
      </div>
    </div>
  );
};

export default HealthPrintControls;
