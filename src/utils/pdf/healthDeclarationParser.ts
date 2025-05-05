
/**
 * Parse parent information from the notes field with improved extraction
 */
export const parseParentInfo = (notes: string | null): { parentName: string; parentId: string } => {
  if (!notes) return { parentName: '', parentId: '' };
  
  try {
    console.log("Parsing parent info from notes:", notes);
    // First try to parse as JSON
    try {
      const parsedNotes = JSON.parse(notes);
      const result = {
        parentName: parsedNotes.parentName || 
                   parsedNotes.parentname || 
                   parsedNotes.שם_הורה || 
                   parsedNotes.שםהורה || 
                   parsedNotes.parent_name || '',
        parentId: parsedNotes.parentId || 
                 parsedNotes.parentid || 
                 parsedNotes.תעודת_זהות || 
                 parsedNotes.תעודתזהות || 
                 parsedNotes.parent_id || ''
      };
      console.log("Successfully parsed notes as JSON:", result);
      return result;
    } catch (e) {
      // If JSON parsing fails, continue to regex approach
      console.log("Failed to parse notes as JSON, trying regex");
    }
    
    // If not valid JSON, try to extract using regex with improved patterns
    // For parent name, look for various Hebrew and English patterns
    const nameMatch = notes.match(/(?:שם[\s_]*(?:הורה|מלא|ההורה)|parentName|parentname|parent[\s_]*name)[\s:"=]*["']?([^",}\n]+)["']?/i);
    
    // For parent ID, look for various Hebrew and English patterns
    const idMatch = notes.match(/(?:תעודת[\s_]*זהות|ת\.?ז\.?|מספר[\s_]*זהות|parentId|parentid|parent[\s_]*id)[\s:"=]*["']?([^",}\n]+)["']?/i);
    
    const result = {
      parentName: nameMatch ? nameMatch[1].trim() : '',
      parentId: idMatch ? idMatch[1].trim() : ''
    };
    
    console.log("Extracted parent info using regex:", result);
    return result;
  } catch (e) {
    console.error("Error parsing parent info:", e);
    return { parentName: '', parentId: '' };
  }
};

/**
 * Parse medical notes from the notes field
 * Improved to ensure proper separation from parent info
 */
export const parseMedicalNotes = (notes: string | null): string => {
  if (!notes) return '';
  
  try {
    console.log("Parsing medical notes from:", notes);
    // Try to parse as JSON first
    try {
      const parsedNotes = JSON.parse(notes);
      
      // Look for medical notes in various fields
      const medicalNotes = parsedNotes.notes || 
                          parsedNotes.medicalNotes || 
                          parsedNotes.medicalComments || 
                          parsedNotes.הערות || 
                          parsedNotes.הערותרפואיות || 
                          parsedNotes.medical_notes || '';
                          
      console.log("Successfully parsed medical notes as JSON:", medicalNotes);
      return typeof medicalNotes === 'string' ? medicalNotes : '';
    } catch (e) {
      // If JSON parsing fails, continue to regex approach
      console.log("Failed to parse medical notes as JSON, trying regex");
    }
    
    // If not valid JSON, try to extract using improved regex
    const notesMatch = notes.match(/(?:notes|medicalNotes|medical[\s_]*notes|הערות[\s_]*רפואיות|הערות)[\s:"=]*["']?([^"}\n]+)["']?/i);
    
    if (notesMatch) {
      const result = notesMatch[1].trim();
      console.log("Extracted medical notes using regex:", result);
      return result;
    }
    
    // If no specific medical notes found, check if there might be other content
    // that's not parent info related
    if (!notes.includes('parentName') && 
        !notes.includes('parentId') && 
        !notes.includes('שם') && 
        !notes.includes('ת.ז') && 
        !notes.includes('תעודת זהות')) {
      
      // Remove any JSON-like patterns and return what's left as potential notes
      const cleanedNotes = notes.replace(/[\{\}"\s]*(parentName|parentId|שם|תעודת זהות|ת\.ז\.)[\s:"=]*["']?[^"}\n,]*["']?[,\s]*/gi, '').trim();
      
      if (cleanedNotes !== notes) {
        console.log("Extracted remaining text as possible medical notes:", cleanedNotes);
        return cleanedNotes;
      }
    }
    
    console.log("No medical notes found");
    return '';
  } catch (e) {
    console.error("Error parsing medical notes:", e);
    return '';
  }
};

/**
 * Get declaration items for the health form
 */
export const getDeclarationItems = (): string[] => {
  return [
    'אני מצהיר/ה כי בני/בתי בריא/ה ואין לו/לה מגבלות בריאותיות המונעות ממנו/ממנה להשתתף בפעילות.',
    'במידה ויש מגבלה רפואית, יש לציין אותה בהערות למעלה ולצרף אישור רפואי המאשר השתתפות.',
    'אני מתחייב/ת לעדכן על כל שינוי במצב הבריאותי.',
    'אני מאשר/ת לצוות הרפואי לתת טיפול ראשוני במקרה הצורך.',
    'ידוע לי שללא הצהרת בריאות חתומה לא יוכל בני/בתי להשתתף בפעילות.'
  ];
};
