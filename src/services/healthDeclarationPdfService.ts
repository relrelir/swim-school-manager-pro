
'use client';

import { format } from 'date-fns';
import { makePdf } from '@/pdf/pdfService';
import type { Content, StyleDictionary } from 'pdfmake/interfaces';

interface HealthFormState {
  agreement: boolean;
  notes: string;
  parentName: string;
  parentId: string;
}

export async function generateHealthDeclarationPdf(
  participantName: string,
  participantId: string | undefined,
  participantPhone: string | undefined,
  formState: HealthFormState,
  submissionDate: Date = new Date()
): Promise<void> {
  // Create PDF content
  const content: Content[] = [
    // Header
    { text: 'הצהרת בריאות', style: 'header', alignment: 'center' },
    { text: `תאריך: ${format(submissionDate, 'dd/MM/yyyy HH:mm')}`, style: 'subheader', alignment: 'center' },
    
    // Participant details
    { text: 'פרטי המשתתף', style: 'sectionHeader', margin: [0, 20, 0, 10] as [number, number, number, number] },
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
      margin: [0, 5, 0, 0] as [number, number, number, number]
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
      margin: [0, 5, 0, 0] as [number, number, number, number]
    });
  }
  
  // Health declaration
  content.push(
    { text: 'הצהרת בריאות', style: 'sectionHeader', margin: [0, 20, 0, 10] as [number, number, number, number] },
    { text: 'אני מצהיר/ה כי בריאות ילדי תקינה ומאפשרת השתתפות בפעילות.', margin: [0, 0, 0, 10] as [number, number, number, number] },
    { text: 'במידה וקיים מידע רפואי חשוב, אנא פרט:', margin: [0, 0, 0, 5] as [number, number, number, number], fontSize: 11 },
    { text: formState.notes || 'אין הערות מיוחדות', margin: [0, 0, 0, 15] as [number, number, number, number] },
    
    // Parent details
    { text: 'פרטי ההורה/אפוטרופוס', style: 'sectionHeader', margin: [0, 20, 0, 10] as [number, number, number, number] },
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
      margin: [0, 5, 0, 0] as [number, number, number, number]
    },
    
    // Agreement
    { text: 'אישור', style: 'sectionHeader', margin: [0, 20, 0, 10] as [number, number, number, number] },
    { text: 'אני מאשר/ת כי המידע שמסרתי לעיל הוא נכון ומדויק.', margin: [0, 0, 0, 10] as [number, number, number, number] },
    
    // Signature section
    { text: 'חתימה:', margin: [0, 30, 0, 5] as [number, number, number, number], bold: true },
    { text: '__________________________', margin: [0, 0, 0, 10] as [number, number, number, number] },
    { text: 'תאריך:', margin: [0, 10, 0, 5] as [number, number, number, number], bold: true },
    { text: '__________________________', margin: [0, 0, 0, 0] as [number, number, number, number] }
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
}
