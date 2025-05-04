
/**
 * Parse parent information from the notes field
 * Improved to handle various text formats reliably
 */
export const parseParentInfo = (notes: string | null): { parentName: string; parentId: string } => {
  if (!notes) return { parentName: '', parentId: '' };
  
  try {
    console.log("Parsing parent info from notes:", notes);
    
    // First try to parse as JSON
    try {
      const parsedNotes = JSON.parse(notes);
      const result = {
        parentName: parsedNotes.parentName || '',
        parentId: parsedNotes.parentId || ''
      };
      console.log("Successfully parsed notes as JSON:", result);
      return result;
    } catch (jsonError) {
      console.log("Failed to parse as JSON, trying regex patterns");
    }
    
    // If not valid JSON, try to extract using regex with strong patterns
    // More specific patterns for parent name
    const nameMatch = notes.match(/parentName"?:\s*"([^"]+)"/i) || 
                     notes.match(/parentName"?:\s*([^,}\s]+)/i) ||
                     notes.match(/שם מלא"?:\s*"([^"]+)"/i) ||
                     notes.match(/שם ההורה"?:\s*"([^"]+)"/i) ||
                     notes.match(/שם הורה"?:\s*"([^"]+)"/i);
    
    // More specific patterns for parent ID
    const idMatch = notes.match(/parentId"?:\s*"([^"]+)"/i) || 
                   notes.match(/parentId"?:\s*([^,}\s]+)/i) ||
                   notes.match(/תעודת זהות"?:\s*"([^"]+)"/i) ||
                   notes.match(/ת\.?ז\.?"?:\s*"([^"]+)"/i) ||
                   notes.match(/מספר זהות"?:\s*"([^"]+)"/i);
    
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
 * Fixed to properly separate from parent info
 */
export const parseMedicalNotes = (notes: string | null): string => {
  if (!notes) return 'אין הערות רפואיות נוספות';
  
  try {
    console.log("Parsing medical notes from:", notes);
    
    // Try to parse as JSON first
    try {
      const parsedNotes = JSON.parse(notes);
      
      // Look for medical notes in various fields
      const medicalNotes = parsedNotes.notes || 
                          parsedNotes.medicalNotes || 
                          parsedNotes.הערות || 
                          parsedNotes.הערותרפואיות || '';
                          
      console.log("Successfully parsed medical notes as JSON:", medicalNotes);
      return medicalNotes || 'אין הערות רפואיות נוספות';
    } catch (jsonError) {
      console.log("Failed to parse medical notes as JSON, trying regex");
    }
    
    // If not valid JSON, try to extract using specific medical notes regex patterns
    // These patterns are more specific to actual medical notes content
    const notesMatch = notes.match(/notes"?:\s*"([^"]+)"/i) || 
                      notes.match(/medicalNotes"?:\s*"([^"]+)"/i) ||
                      notes.match(/הערות רפואיות"?:\s*"([^"]+)"/i) ||
                      notes.match(/הערות"?:\s*"([^"]+)"/i);
    
    if (notesMatch && notesMatch[1].trim()) {
      return notesMatch[1].trim();
    }
    
    // If we couldn't find specific medical notes but also can't find parent info markers,
    // then the string might be just medical notes (after removing parent info)
    if (!notes.includes('parentName') && !notes.includes('parentId') && 
        !notes.includes('שם') && !notes.includes('ת.ז') && !notes.includes('תעודת זהות')) {
      
      // Try to find and remove any structured parent info
      const cleanedNotes = notes
        .replace(/{[^}]*}/g, '') // Remove JSON-like structures
        .replace(/parentName"?:\s*"[^"]+"/i, '') // Remove parentName pairs
        .replace(/parentId"?:\s*"[^"]+"/i, '') // Remove parentId pairs
        .trim();
      
      if (cleanedNotes) {
        return cleanedNotes;
      }
    }
    
    console.log("No specific medical notes found");
    return 'אין הערות רפואיות נוספות';
  } catch (e) {
    console.error("Error parsing medical notes:", e);
    return 'אין הערות רפואיות נוספות';
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
