
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { makePdf, createTableData } from '@/pdf/pdfService';
import { format } from 'date-fns';
import { parseParentInfo, parseMedicalNotes, getDeclarationItems } from './pdf/healthDeclarationParser';
import type { Content, StyleDictionary } from 'pdfmake/interfaces';

export const generateHealthDeclarationPdf = async (healthDeclarationId: string) => {
  try {
    console.log("Starting health declaration PDF generation for declaration ID:", healthDeclarationId);
    
    if (!healthDeclarationId) {
      console.error("Health declaration ID is missing or invalid");
      throw new Error('מזהה הצהרת הבריאות חסר או לא תקין');
    }
    
    // Get the health declaration directly by ID
    let { data: healthDeclaration, error: healthDeclarationError } = await supabase
      .from('health_declarations')
      .select('id, participant_id, submission_date, notes, form_status')
      .eq('id', healthDeclarationId)
      .single();
    
    if (healthDeclarationError || !healthDeclaration) {
      console.error("Health declaration not found by ID:", healthDeclarationError, healthDeclarationId);
      throw new Error('הצהרת בריאות לא נמצאה');
    }
    
    console.log("Found health declaration:", healthDeclaration);
    
    // Get participant details
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('firstname, lastname, idnumber, phone')
      .eq('id', healthDeclaration.participant_id)
      .single();
    
    if (participantError || !participant) {
      console.error("Participant details not found:", participantError);
      throw new Error('פרטי המשתתף לא נמצאו');
    }
    
    console.log("Data fetched successfully. Participant:", participant);
    
    try {
      // Parse parent info and medical notes
      const parentInfo = parseParentInfo(healthDeclaration.notes);
      const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
      const declarationItems = getDeclarationItems();
      
      // Format date
      const formattedDate = healthDeclaration.submission_date 
        ? format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy HH:mm') 
        : format(new Date(), 'dd/MM/yyyy HH:mm');
      
      // Generate the filename
      const fileName = `הצהרת_בריאות_${participant.firstname}_${participant.lastname}.pdf`;
      
      // Prepare the content array with proper type casting
      const contentItems: Content[] = [];
      
      // Add title
      contentItems.push({ 
        text: 'הצהרת בריאות', 
        style: 'header', 
        alignment: 'center' 
      });
      
      // Add date
      contentItems.push({ 
        text: `תאריך: ${formattedDate}`, 
        alignment: 'left', 
        margin: [0, 0, 0, 20] 
      });
      
      // Add participant section
      contentItems.push({ 
        text: 'פרטי המשתתף', 
        style: 'subheader', 
        margin: [0, 10, 0, 10] 
      });
      
      // Add participant table
      contentItems.push(createTableData(
        ['שם מלא', 'תעודת זהות', 'טלפון'],
        [[`${participant.firstname} ${participant.lastname}`, participant.idnumber, participant.phone]]
      ));
      
      // Add parent section if available
      if (parentInfo.parentName || parentInfo.parentId) {
        contentItems.push({ 
          text: 'פרטי ההורה/אפוטרופוס', 
          style: 'subheader', 
          margin: [0, 10, 0, 10] 
        });
        
        contentItems.push(createTableData(
          ['שם מלא', 'תעודת זהות'],
          [[parentInfo.parentName || '', parentInfo.parentId || '']]
        ));
      }
      
      // Add declaration items section
      contentItems.push({ 
        text: 'תוכן ההצהרה', 
        style: 'subheader', 
        margin: [0, 10, 0, 10] 
      });
      
      // Add declaration items as a table
      contentItems.push({
        table: {
          widths: ['auto', '*'],
          body: declarationItems.map(item => ['•', { text: item, alignment: 'right' }])
        },
        layout: 'noBorders',
        margin: [10, 5, 0, 10]
      });
      
      // Add medical notes if available
      if (medicalNotes) {
        contentItems.push({ 
          text: 'הערות רפואיות', 
          style: 'subheader', 
          margin: [0, 20, 0, 10] 
        });
        
        contentItems.push({ 
          text: medicalNotes, 
          margin: [0, 0, 0, 20] 
        });
      }
      
      // Add confirmation
      contentItems.push({ 
        text: 'אישור', 
        style: 'subheader', 
        margin: [0, 20, 0, 10] 
        });
      
      contentItems.push({ 
        text: 'אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.', 
        margin: [0, 0, 0, 20] 
      });
      
      // Add signature line
      contentItems.push({ 
        text: 'חתימת ההורה/אפוטרופוס: ________________', 
        margin: [0, 30, 0, 0] 
      });
      
      // Create PDF document definition with properly typed styles
      const styles: StyleDictionary = {
        header: { 
          fontSize: 18, 
          bold: true, 
          margin: [0, 0, 0, 10] 
        },
        subheader: { 
          fontSize: 14, 
          bold: true, 
          margin: [0, 10, 0, 5] 
        },
        tableHeader: { 
          bold: true, 
          fillColor: '#f5f5f5' 
        }
      };
      
      const docDefinition = {
        content: contentItems,
        styles: styles,
      };
      
      // Generate and download the PDF
      console.log("Generating health declaration PDF");
      await makePdf(docDefinition, fileName);
      
      console.log("PDF generated successfully");
      toast({
        title: "PDF נוצר בהצלחה",
        description: "הצהרת הבריאות נשמרה במכשיר שלך",
      });
      
      return fileName;
    } catch (error) {
      console.error('Error during PDF generation:', error);
      toast({
        variant: "destructive",
        title: "שגיאה ביצירת PDF",
        description: "נא לנסות שוב מאוחר יותר",
      });
      throw new Error('אירעה שגיאה ביצירת מסמך ה-PDF');
    }
  } catch (error) {
    console.error('Error in generateHealthDeclarationPdf:', error);
    toast({
      title: "שגיאה",
      description: error instanceof Error ? error.message : 'אירעה שגיאה ביצירת ה-PDF',
      variant: "destructive",
    });
    throw error;
  }
};
