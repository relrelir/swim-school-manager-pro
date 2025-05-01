
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { makePdf, createTableData } from '@/pdf/pdfService';
import { format } from 'date-fns';
import { parseParentInfo, parseMedicalNotes, getDeclarationItems } from './pdf/healthDeclarationParser';

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
      
      // Create PDF document definition
      const docDefinition = {
        content: [
          // Title
          { text: 'הצהרת בריאות', style: 'header', alignment: 'center' },
          { text: `תאריך: ${formattedDate}`, alignment: 'left', margin: [0, 0, 0, 20] },
          
          // Participant section
          { text: 'פרטי המשתתף', style: 'subheader', margin: [0, 10, 0, 10] },
          createTableData(
            ['שם מלא', 'תעודת זהות', 'טלפון'],
            [[`${participant.firstname} ${participant.lastname}`, participant.idnumber, participant.phone]]
          ),
          
          // Parent section (if available)
          parentInfo.parentName || parentInfo.parentId ? 
          [
            { text: 'פרטי ההורה/אפוטרופוס', style: 'subheader', margin: [0, 10, 0, 10] },
            createTableData(
              ['שם מלא', 'תעודת זהות'],
              [[parentInfo.parentName || '', parentInfo.parentId || '']]
            )
          ] : [],
          
          // Declaration items
          { text: 'תוכן ההצהרה', style: 'subheader', margin: [0, 10, 0, 10] },
          ...declarationItems.map(item => ({
            margin: [10, 5, 0, 0],
            columns: [
              { width: 10, text: '•' },
              { width: 'auto', text: item }
            ]
          })),
          
          // Medical notes (if available)
          medicalNotes ? [
            { text: 'הערות רפואיות', style: 'subheader', margin: [0, 20, 0, 10] },
            { text: medicalNotes, margin: [0, 0, 0, 20] }
          ] : [],
          
          // Confirmation
          { text: 'אישור', style: 'subheader', margin: [0, 20, 0, 10] },
          { text: 'אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.', margin: [0, 0, 0, 20] },
          
          // Signature line
          { text: 'חתימת ההורה/אפוטרופוס: ________________', margin: [0, 30, 0, 0] },
        ],
        styles: {
          header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
          subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
          tableHeader: { bold: true, fillColor: '#f5f5f5' }
        }
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
