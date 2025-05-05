
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
    
    // If not valid JSON, try to extract using improved regex patterns for better capture
    
    // For parent name, look for various Hebrew and English patterns with better boundary detection
    const nameMatch = notes.match(/(?:שם[\s_]*(?:הורה|מלא|ההורה|אפוטרופוס)|parentName|parentname|parent[\s_]*name)[\s:="]+["']?([^",\}\r\n]+)["']?/i) || 
                     notes.match(/["'](?:שם[\s_]*(?:הורה|מלא|ההורה|אפוטרופוס)|parentName|parentname|parent[\s_]*name)["'][\s:="]+["']?([^",\}\r\n]+)["']?/i);
    
    // For parent ID, look for various Hebrew and English patterns with better boundary detection
    const idMatch = notes.match(/(?:תעודת[\s_]*זהות|ת\.?ז\.?|מספר[\s_]*זהות|parentId|parentid|parent[\s_]*id)[\s:="]+["']?([^",\}\r\n]+)["']?/i) || 
                    notes.match(/["'](?:תעודת[\s_]*זהות|ת\.?ז\.?|מספר[\s_]*זהות|parentId|parentid|parent[\s_]*id)["'][\s:="]+["']?([^",\}\r\n]+)["']?/i);
    
    // CRITICAL FIX: If the entire notes field seems to be just the parent name (like "יצחק הראל")
    // Check if the entire notes could be just a name without any prefixes
    // This matches Hebrew names with space between words (like first and last name)
    const directNameMatch = !nameMatch && /^[\u0590-\u05FF\s\u0027\u0022\u05F3\u05F4א-ת]+\s+[\u0590-\u05FF\s\u0027\u0022\u05F3\u05F4א-ת]+$/i.test(notes);
    
    const result = {
      parentName: nameMatch ? nameMatch[1].trim() : (directNameMatch ? notes.trim() : ''),
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
    
    // Look for explicitly marked medical notes first
    const notesMatch = notes.match(/(?:notes|medicalNotes|medical[\s_]*notes|הערות[\s_]*רפואיות|הערות)[\s:="]+["']?([^"\}\r\n]+)["']?/i) || 
                      notes.match(/["'](?:notes|medicalNotes|medical[\s_]*notes|הערות[\s_]*רפואיות|הערות)["'][\s:="]+["']?([^"\}\r\n]+)["']?/i);
    
    if (notesMatch && notesMatch[1].trim()) {
      const result = notesMatch[1].trim();
      console.log("Extracted medical notes using regex:", result);
      return result;
    }
    
    // CRITICAL FIX: Check for specific medical phrase pattern like "אני קוף"
    const medicalPhraseMatch = notes.match(/אני\s+([^"\{\}\r\n]+)/i);
    if (medicalPhraseMatch && medicalPhraseMatch[0].trim()) {
      const result = medicalPhraseMatch[0].trim();
      console.log("Extracted medical phrase:", result);
      return result;
    }
    
    // If we can't identify specific medical notes but there's content without parent info
    // First, strip out all parent-related patterns
    const parentPatterns = [
      /(?:שם[\s_]*(?:הורה|מלא|ההורה)|parentName|parentname|parent[\s_]*name)[\s:="]+["']?([^",\}\r\n]+)["']?/gi,
      /["'](?:שם[\s_]*(?:הורה|מלא|ההורה)|parentName|parentname|parent[\s_]*name)["'][\s:="]+["']?([^",\}\r\n]+)["']?/gi,
      /(?:תעודת[\s_]*זהות|ת\.?ז\.?|מספר[\s_]*זהות|parentId|parentid|parent[\s_]*id)[\s:="]+["']?([^",\}\r\n]+)["']?/gi,
      /["'](?:תעודת[\s_]*זהות|ת\.?ז\.?|מספר[\s_]*זהות|parentId|parentid|parent[\s_]*id)["'][\s:="]+["']?([^",\}\r\n]+)["']?/gi,
      // Try to remove parent name patterns (first+last name)
      /[\u0590-\u05FF\s]+\s+[\u0590-\u05FF\s]+/i,
      // Remove objects and syntax elements
      /[\{\}"\s]*(parentName|parentId|שם|תעודת זהות|ת\.ז\.)[\s:"=]*["']?[^"\}\r\n,]*["']?[,\s]*/gi
    ];
    
    // Remove all parent-related patterns
    let remainingText = notes;
    parentPatterns.forEach(pattern => {
      remainingText = remainingText.replace(pattern, ' ');
    });
    
    // Clean up JSON syntax remnants and extra spaces
    remainingText = remainingText
      .replace(/[\{\}",]|\s*:\s*['"]?|['"]?\s*[,:]?\s*[\{\}]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
      
    // If we have substantial remaining text after removing parent info, it might be medical notes
    if (remainingText && remainingText.length > 5 && remainingText !== notes) {
      console.log("Extracted remaining text as medical notes:", remainingText);
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
