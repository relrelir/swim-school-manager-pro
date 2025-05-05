
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
    
    // If not valid JSON, try to extract using improved regex patterns with better capture groups
    
    // For parent name, look for various Hebrew and English patterns
    // Improved pattern with more variations and better boundary detection
    const nameMatch = notes.match(/(?:שם[\s_]*(?:הורה|מלא|ההורה|אפוטרופוס)|parentName|parentname|parent[\s_]*name)[\s:="]+["']?([^",}\r\n]+)["']?/i) || 
                      notes.match(/["'](?:שם[\s_]*(?:הורה|מלא|ההורה|אפוטרופוס)|parentName|parentname|parent[\s_]*name)["'][\s:="]+["']?([^",}\r\n]+)["']?/i);
    
    // For parent ID, look for various Hebrew and English patterns
    // Improved pattern with more variations and better boundary detection
    const idMatch = notes.match(/(?:תעודת[\s_]*זהות|ת\.?ז\.?|מספר[\s_]*זהות|parentId|parentid|parent[\s_]*id)[\s:="]+["']?([^",}\r\n]+)["']?/i) || 
                    notes.match(/["'](?:תעודת[\s_]*זהות|ת\.?ז\.?|מספר[\s_]*זהות|parentId|parentid|parent[\s_]*id)["'][\s:="]+["']?([^",}\r\n]+)["']?/i);
    
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
      
      // Look for medical notes in various fields with improved field detection
      const medicalNotes = parsedNotes.notes || 
                          parsedNotes.medicalNotes || 
                          parsedNotes.medicalComments || 
                          parsedNotes.הערות || 
                          parsedNotes.הערות_רפואיות ||
                          parsedNotes.הערותרפואיות || 
                          parsedNotes.medical_notes || '';
                          
      console.log("Successfully parsed medical notes as JSON:", medicalNotes);
      if (medicalNotes) {
        return typeof medicalNotes === 'string' ? medicalNotes : '';
      }
    } catch (e) {
      // If JSON parsing fails, continue to regex approach
      console.log("Failed to parse medical notes as JSON, trying regex");
    }
    
    // If not valid JSON, use improved regex patterns to extract medical notes
    // Look for explicitly marked medical notes first
    const notesMatch = notes.match(/(?:notes|medicalNotes|medical[\s_]*notes|הערות[\s_]*רפואיות|הערות)[\s:="]+["']?([^"}\r\n]+)["']?/i) || 
                       notes.match(/["'](?:notes|medicalNotes|medical[\s_]*notes|הערות[\s_]*רפואיות|הערות)["'][\s:="]+["']?([^"}\r\n]+)["']?/i);
    
    if (notesMatch && notesMatch[1].trim()) {
      const result = notesMatch[1].trim();
      console.log("Extracted medical notes using regex:", result);
      return result;
    }
    
    // If no specific medical notes found, check if the notes field contains 
    // content that isn't parent-related
    
    // First, strip out all parent info patterns
    const parentPatterns = [
      /(?:שם[\s_]*(?:הורה|מלא|ההורה)|parentName|parentname|parent[\s_]*name)[\s:="]+["']?([^",}\r\n]+)["']?/gi,
      /["'](?:שם[\s_]*(?:הורה|מלא|ההורה)|parentName|parentname|parent[\s_]*name)["'][\s:="]+["']?([^",}\r\n]+)["']?/gi,
      /(?:תעודת[\s_]*זהות|ת\.?ז\.?|מספר[\s_]*זהות|parentId|parentid|parent[\s_]*id)[\s:="]+["']?([^",}\r\n]+)["']?/gi,
      /["'](?:תעודת[\s_]*זהות|ת\.?ז\.?|מספר[\s_]*זהות|parentId|parentid|parent[\s_]*id)["'][\s:="]+["']?([^",}\r\n]+)["']?/gi,
      /[\{\}"\s]*(parentName|parentId|שם|תעודת זהות|ת\.ז\.)[\s:"=]*["']?[^"}\r\n,]*["']?[,\s]*/gi
    ];
    
    // Remove all parent-related patterns
    let remainingText = notes;
    parentPatterns.forEach(pattern => {
      remainingText = remainingText.replace(pattern, '');
    });
    
    // Clean up JSON syntax remnants
    remainingText = remainingText
      .replace(/[\{\}",]|\s*:\s*['"]?|['"]?\s*[,:]?\s*[\{\}]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
      
    // If we have remaining text after removing parent info, it might be medical notes
    if (remainingText && remainingText !== notes) {
      console.log("Extracted remaining text as possible medical notes:", remainingText);
      return remainingText;
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
