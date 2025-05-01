
import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Extend the jsPDF type to include the lastAutoTable property added by autotable plugin
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

export const generateHealthDeclarationPdf = async (registrationId: string) => {
  try {
    // First, get the health declaration for this registration
    const { data: healthDeclaration, error: healthDeclarationError } = await supabase
      .from('health_declarations')
      .select('id, participant_id, submission_date, notes, form_status')
      .eq('participant_id', registrationId)
      .single();
    
    if (healthDeclarationError || !healthDeclaration) {
      throw new Error('הצהרת בריאות לא נמצאה');
    }
    
    if (healthDeclaration.form_status !== 'signed') {
      throw new Error('הצהרת הבריאות לא מולאה עדיין');
    }
    
    // Get participant details
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('firstname, lastname, idnumber, phone')
      .eq('id', healthDeclaration.participant_id)
      .single();
    
    if (participantError || !participant) {
      throw new Error('פרטי המשתתף לא נמצאו');
    }
    
    // Parse parent info from notes
    const parentInfo = parseParentInfo(healthDeclaration.notes);
    
    // Create the PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Enable RTL support
    pdf.setR2L(true);
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('הצהרת בריאות', pdf.internal.pageSize.width / 2, 20, { align: 'center' });
    
    // Add date
    const formattedDate = healthDeclaration.submission_date 
      ? format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy HH:mm') 
      : format(new Date(), 'dd/MM/yyyy HH:mm');
    
    pdf.setFontSize(12);
    pdf.text(`תאריך: ${formattedDate}`, pdf.internal.pageSize.width - 20, 30, { align: 'right' });
    
    // Add participant details
    pdf.setFontSize(14);
    pdf.text('פרטי המשתתף', 20, 45);
    
    const participantData = [
      ['שם מלא', `${participant.firstname} ${participant.lastname}`],
      ['תעודת זהות', participant.idnumber],
      ['טלפון', participant.phone],
    ];
    
    autoTable(pdf, {
      startY: 50,
      head: [],
      body: participantData,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        halign: 'right',
      },
      headStyles: {
        fillColor: [220, 220, 220],
      }
    });
    
    // Add parent details if available
    if (parentInfo.parentName || parentInfo.parentId) {
      pdf.text('פרטי ההורה/אפוטרופוס', 20, pdf.lastAutoTable.finalY + 15);
      
      const parentData = [
        ['שם מלא', parentInfo.parentName || ''],
        ['תעודת זהות', parentInfo.parentId || ''],
      ];
      
      autoTable(pdf, {
        startY: pdf.lastAutoTable.finalY + 20,
        head: [],
        body: parentData,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 10,
          halign: 'right',
        },
        headStyles: {
          fillColor: [220, 220, 220],
        }
      });
    }
    
    // Add declaration text
    pdf.text('תוכן ההצהרה', 20, pdf.lastAutoTable.finalY + 15);
    
    const declarationItems = [
      'בני/בתי נמצא/ת בכושר ובמצב בריאותי תקין המאפשר השתתפות בפעילות.',
      'לא ידוע לי על מגבלות רפואיות המונעות מבני/בתי להשתתף בפעילות.',
      'לא ידוע לי על רגישויות, מחלות או בעיות רפואיות אחרות שעלולות להשפיע על השתתפותו/ה בפעילות.',
      'אני מתחייב/ת להודיע למדריכים על כל שינוי במצב הבריאותי של בני/בתי.',
    ];
    
    const declarationData = declarationItems.map(item => ['•', item]);
    
    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 20,
      head: [],
      body: declarationData,
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        halign: 'right',
      },
      columnStyles: {
        0: { cellWidth: 5 },
        1: { cellWidth: 'auto' },
      }
    });
    
    // Add medical notes if any
    if (healthDeclaration.notes) {
      const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
      
      if (medicalNotes) {
        pdf.text('הערות רפואיות', 20, pdf.lastAutoTable.finalY + 15);
        
        autoTable(pdf, {
          startY: pdf.lastAutoTable.finalY + 20,
          head: [],
          body: [[medicalNotes]],
          theme: 'plain',
          styles: {
            font: 'helvetica',
            fontSize: 10,
            halign: 'right',
          },
        });
      }
    }
    
    // Add confirmation
    pdf.text('אישור', 20, pdf.lastAutoTable.finalY + 15);
    
    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 20,
      head: [],
      body: [['אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.']],
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        halign: 'right',
      },
    });
    
    // Add signature line
    pdf.text('חתימת ההורה/אפוטרופוס: ________________', 30, pdf.lastAutoTable.finalY + 20);
    
    // Generate filename and save
    const fileName = `הצהרת_בריאות_${participant.firstname}_${participant.lastname}.pdf`;
    pdf.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('Error generating health declaration PDF:', error);
    throw error;
  }
};

// Helper functions to parse notes
function parseParentInfo(notes: string | null): { parentName: string; parentId: string } {
  if (!notes) return { parentName: '', parentId: '' };
  
  const parentNameMatch = notes.match(/הורה\/אפוטרופוס: ([^,]+)/);
  const parentIdMatch = notes.match(/ת\.ז\.: ([^\n]+)/);
  
  return {
    parentName: parentNameMatch ? parentNameMatch[1].trim() : '',
    parentId: parentIdMatch ? parentIdMatch[1].trim() : '',
  };
}

function parseMedicalNotes(notes: string | null): string {
  if (!notes) return '';
  
  // Remove parent info part from notes
  const cleanNotes = notes.replace(/הורה\/אפוטרופוס: [^,]+, ת\.ז\.: [^\n]+\n\n/g, '').trim();
  
  return cleanNotes;
}
