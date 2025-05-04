
/**
 * Parse parent information from the notes field
 */
export const parseParentInfo = (notes: string | null): { parentName: string; parentId: string } => {
  if (!notes) return { parentName: '', parentId: '' };
  
  console.log("Parsing parent info from notes:", notes);
  
  try {
    // First try to parse as JSON
    const parsedNotes = JSON.parse(notes);
    const result = {
      parentName: parsedNotes.parentName || '',
      parentId: parsedNotes.parentId || ''
    };
    console.log("Successfully parsed notes as JSON:", result);
    return result;
  } catch (e) {
    console.log("Failed to parse notes as JSON, trying regex fallbacks");
    
    // If not valid JSON, try to extract using regex
    const nameMatch = notes.match(/parentName"?:\s*"?([^",}]+)"?/i) || 
                     notes.match(/שם מלא"?:\s*"?([^",}]+)"?/i) ||
                     notes.match(/שם ההורה"?:\s*"?([^",}]+)"?/i);
    
    const idMatch = notes.match(/parentId"?:\s*"?([^",}]+)"?/i) || 
                   notes.match(/תעודת זהות"?:\s*"?([^",}]+)"?/i) ||
                   notes.match(/ת\.?ז\.?"?:\s*"?([^",}]+)"?/i);
    
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
 */
export const parseMedicalNotes = (notes: string | null): string => {
  if (!notes) return 'אין הערות רפואיות נוספות';
  
  console.log("Parsing medical notes from:", notes);
  
  try {
    // Try to parse as JSON first
    const parsedNotes = JSON.parse(notes);
    
    // Look for specific medical notes fields
    let medicalNotes = '';
    if (parsedNotes.notes) medicalNotes = parsedNotes.notes;
    else if (parsedNotes.medicalNotes) medicalNotes = parsedNotes.medicalNotes;
    
    console.log("Successfully parsed medical notes as JSON:", medicalNotes);
    return medicalNotes || 'אין הערות רפואיות נוספות';
  } catch (e) {
    console.log("Failed to parse medical notes as JSON, trying regex");
    
    // If not valid JSON, try to extract using regex
    const notesMatch = notes.match(/notes"?:\s*"?([^",}]+)"?/i) || 
                      notes.match(/medicalNotes"?:\s*"?([^",}]+)"?/i) ||
                      notes.match(/הערות רפואיות"?:\s*"?([^",}]+)"?/i);
    
    // If we have a match, use it
    if (notesMatch) {
      return notesMatch[1].trim();
    }
    
    // Check if this might be just medical notes without parent info
    if (!notes.includes('parentName') && !notes.includes('parentId') && 
        !notes.includes('שם') && !notes.includes('ת.ז') && !notes.includes('תעודת זהות')) {
      
      // If it's not structured as JSON at all, it might be just the notes
      if (!notes.includes('{') && !notes.includes('}') && !notes.includes(':')) {
        return notes.trim();
      }
    }
    
    console.log("Could not extract medical notes from:", notes);
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
