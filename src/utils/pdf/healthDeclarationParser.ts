
/**
 * Parse parent information from the notes field
 */
export const parseParentInfo = (notes: string | null): { parentName: string; parentId: string } => {
  if (!notes) return { parentName: '', parentId: '' };
  
  try {
    // Try to parse as JSON first
    const parsedNotes = JSON.parse(notes);
    return {
      parentName: parsedNotes.parentName || '',
      parentId: parsedNotes.parentId || ''
    };
  } catch (e) {
    // If not valid JSON, try to extract using regex
    const nameMatch = notes.match(/parentName"?:\s*"?([^",}]+)"?/i);
    const idMatch = notes.match(/parentId"?:\s*"?([^",}]+)"?/i);
    
    return {
      parentName: nameMatch ? nameMatch[1] : '',
      parentId: idMatch ? idMatch[1] : ''
    };
  }
};

/**
 * Parse medical notes from the notes field
 */
export const parseMedicalNotes = (notes: string | null): string => {
  if (!notes) return '';
  
  try {
    // Try to parse as JSON first
    const parsedNotes = JSON.parse(notes);
    return parsedNotes.notes || '';
  } catch (e) {
    // If not valid JSON, try to extract using regex
    const notesMatch = notes.match(/notes"?:\s*"?([^",}]+)"?/i);
    return notesMatch ? notesMatch[1] : '';
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
