
/**
 * Returns the standard health declaration items text
 */
export const getDeclarationItems = (): string[] => {
  return [
    'אני מצהיר/ה כי אני/ילדי בריא/ה וכשיר/ה להשתתף בפעילויות הגופניות המתוכננות.',
    'אני מצהיר/ה כי אין לי/לילדי מגבלות רפואיות המונעות השתתפות בפעילות.',
    'במידה וישנן הגבלות רפואיות, פירטתי אותן בהערות הרפואיות.',
    'אני מתחייב/ת להודיע מיד למארגני הפעילות על כל שינוי במצב הבריאותי.',
    'אני מאשר/ת למארגני הפעילות לפנות לטיפול רפואי במקרה של פגיעה או מחלה.',
    'המידע הבריאותי שמסרתי הוא מדויק ומלא למיטב ידיעתי.'
  ];
};

/**
 * Returns the full health declaration text
 */
export const getFullDeclarationText = (): string => {
  return getDeclarationItems().join('\n\n');
};

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
    const nameMatch = notes.match(/parentName"?:\s*"?([^",}]+)"?/i) || 
                     notes.match(/הורה\/אפוטרופוס:\s*([^,]+)/);
    
    const idMatch = notes.match(/parentId"?:\s*"?([^",}]+)"?/i) || 
                   notes.match(/ת\.ז\.:\s*([^\n]+)/);
    
    const result = {
      parentName: nameMatch ? nameMatch[1].trim() : '',
      parentId: idMatch ? idMatch[1].trim() : ''
    };
    
    console.log("Extracted parent info using regex:", result);
    return result;
  }
};
