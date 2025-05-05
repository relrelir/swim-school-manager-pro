
/**
 * Parse parent information from the notes field with improved extraction
 */
export const parseParentInfo = (notes: string | null): { parentName: string; parentId: string } => {
  if (!notes) return { parentName: '', parentId: '' };
  
  try {
    console.log("Parsing parent info from notes:", notes);
    // First try to parse as JSON
    const parsedNotes = JSON.parse(notes);
    const result = {
      parentName: parsedNotes.parentName || parsedNotes.parentname || parsedNotes.שם_הורה || '',
      parentId: parsedNotes.parentId || parsedNotes.parentid || parsedNotes.תעודת_זהות || ''
    };
    console.log("Successfully parsed notes as JSON:", result);
    return result;
  } catch (e) {
    console.log("Failed to parse notes as JSON, trying regex", notes);
    
    // If not valid JSON, try to extract using regex with improved patterns
    // For parent name, look for various Hebrew and English patterns
    const nameMatch = notes.match(/parentName"?:\s*"?([^",}]+)"?/i) || 
                     notes.match(/parentname"?:\s*"?([^",}]+)"?/i) || 
                     notes.match(/שם[\s_]מלא"?:\s*"?([^",}]+)"?/i) ||
                     notes.match(/שם[\s_]ההורה"?:\s*"?([^",}]+)"?/i) ||
                     notes.match(/שם[\s_]הורה"?:\s*"?([^",}]+)"?/i);
    
    // For parent ID, look for various Hebrew and English patterns
    const idMatch = notes.match(/parentId"?:\s*"?([^",}]+)"?/i) || 
                   notes.match(/parentid"?:\s*"?([^",}]+)"?/i) || 
                   notes.match(/תעודת[\s_]זהות"?:\s*"?([^",}]+)"?/i) ||
                   notes.match(/ת\.?ז\.?"?:\s*"?([^",}]+)"?/i) ||
                   notes.match(/מספר[\s_]זהות"?:\s*"?([^",}]+)"?/i);
    
    const result = {
      parentName: nameMatch ? nameMatch[1].trim() : '',
      parentId: idMatch ? idMatch[1].trim() : ''
    };
    
    console.log("Extracted parent info using regex:", result);
    return result;
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
    const parsedNotes = JSON.parse(notes);
    
    // Look for medical notes in various fields
    const medicalNotes = parsedNotes.notes || 
                        parsedNotes.medicalNotes || 
                        parsedNotes.medicalComments || 
                        parsedNotes.הערות || 
                        parsedNotes.הערותרפואיות || '';
                        
    console.log("Successfully parsed medical notes as JSON:", medicalNotes);
    return typeof medicalNotes === 'string' ? medicalNotes : '';
  } catch (e) {
    console.log("Failed to parse medical notes as JSON, trying regex");
    
    // If not valid JSON, try to extract using improved regex
    // Look for patterns that specifically match medical notes
    const notesMatch = notes.match(/notes"?:\s*"?([^"]*)"?[,}]?/i) || 
                      notes.match(/medicalNotes"?:\s*"?([^"]*)"?[,}]?/i) ||
                      notes.match(/הערות רפואיות"?:\s*"?([^"]*)"?[,}]?/i) ||
                      notes.match(/הערות"?:\s*"?([^"]*)"?[,}]?/i);
    
    let result = notesMatch ? notesMatch[1].trim() : '';
    
    // If no specific medical notes found but notes don't contain parent info markers,
    // assume the entire text might be medical notes (after removing JSON-like parts)
    if (!result && !notes.includes('parentName') && !notes.includes('parentId') && 
        !notes.includes('parentname') && !notes.includes('parentid') && 
        !notes.includes('שם') && !notes.includes('ת.ז') && !notes.includes('תעודת זהות')) {
      
      // Check if entire text is potentially medical notes
      result = notes.replace(/{[^}]*}/g, '').trim();
    }
    
    console.log("Extracted medical notes using regex:", result);
    return result;
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
