
/**
 * Parse parent information from the notes field
 */
export const parseParentInfo = (notes: string | null): { parentName: string; parentId: string } => {
  if (!notes) return { parentName: '', parentId: '' };
  
  try {
    console.log("Parsing parent info from notes:", notes);
    // First try to parse as JSON
    const parsedNotes = JSON.parse(notes);
    const result = {
      parentName: parsedNotes.parentName || '',
      parentId: parsedNotes.parentId || ''
    };
    console.log("Successfully parsed notes as JSON:", result);
    return result;
  } catch (e) {
    console.log("Failed to parse notes as JSON, trying regex", notes);
    
    // If not valid JSON, try to extract using regex
    const nameMatch = notes.match(/parentName"?:\s*"?([^",}]+)"?/i);
    const idMatch = notes.match(/parentId"?:\s*"?([^",}]+)"?/i);
    
    const result = {
      parentName: nameMatch ? nameMatch[1] : '',
      parentId: idMatch ? idMatch[1] : ''
    };
    
    console.log("Extracted parent info using regex:", result);
    return result;
  }
};

/**
 * Parse medical notes from the notes field
 */
export const parseMedicalNotes = (notes: string | null): string => {
  if (!notes) return '';
  
  try {
    console.log("Parsing medical notes from:", notes);
    // Try to parse as JSON first
    const parsedNotes = JSON.parse(notes);
    const result = parsedNotes.notes || parsedNotes.medicalNotes || '';
    console.log("Successfully parsed medical notes as JSON:", result);
    return result;
  } catch (e) {
    console.log("Failed to parse medical notes as JSON, trying regex");
    
    // If not valid JSON, try to extract using regex
    const notesMatch = notes.match(/notes"?:\s*"?([^",}]+)"?/i) || 
                      notes.match(/medicalNotes"?:\s*"?([^",}]+)"?/i);
    
    const result = notesMatch ? notesMatch[1] : '';
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
