
/**
 * Parse parent information from the notes field
 */
export const parseParentInfo = (notes: string | null): { parentName: string; parentId: string } => {
  if (!notes) return { parentName: '', parentId: '' };
  
  try {
    console.log("Parsing parent info from notes:", notes);
    
    // First try to parse as JSON
    try {
      const parsedNotes = JSON.parse(notes);
      if (parsedNotes.parentName || parsedNotes.parentId) {
        const result = {
          parentName: parsedNotes.parentName || '',
          parentId: parsedNotes.parentId || ''
        };
        console.log("Successfully parsed notes as JSON for parent info:", result);
        return result;
      }
    } catch (e) {
      console.log("Failed to parse notes as JSON for parent info, continuing with text parsing");
    }
    
    // If not valid JSON or doesn't contain parent info, try to extract using regex
    // Look for more formats of parent name and ID in Hebrew text
    const nameMatch = 
      notes.match(/parentName"?:\s*"?([^",}]+)"?/i) || 
      notes.match(/שם מלא:?\s*([^\n,]+)/i) || 
      notes.match(/שם הורה:?\s*([^\n,]+)/i) ||
      notes.match(/שם:?\s*([^\n,]+)/i);
      
    const idMatch = 
      notes.match(/parentId"?:\s*"?([^",}]+)"?/i) || 
      notes.match(/ת\.?ז\.?:?\s*([^\n,]+)/i) ||
      notes.match(/תעודת זהות:?\s*([^\n,]+)/i) ||
      notes.match(/מספר זהות:?\s*([^\n,]+)/i);
    
    const result = {
      parentName: nameMatch ? nameMatch[1].trim() : '',
      parentId: idMatch ? idMatch[1].trim() : ''
    };
    
    console.log("Extracted parent info using advanced text parsing:", result);
    return result;
  } catch (e) {
    console.error("Error parsing parent info:", e);
    return { parentName: '', parentId: '' };
  }
};

/**
 * Parse medical notes from the notes field
 */
export const parseMedicalNotes = (notes: string | null): string => {
  if (!notes) return 'אין הערות נוספות';
  
  try {
    console.log("Parsing medical notes from:", notes);
    
    // First try to parse as JSON
    try {
      const parsedNotes = JSON.parse(notes);
      if (parsedNotes.notes || parsedNotes.medicalNotes) {
        const result = parsedNotes.notes || parsedNotes.medicalNotes || '';
        console.log("Successfully parsed medical notes as JSON:", result);
        return result || 'אין הערות נוספות';
      }
    } catch (e) {
      console.log("Failed to parse medical notes as JSON, continuing with text parsing");
    }
    
    // If not valid JSON or doesn't contain notes, try other extraction methods
    // First remove any parent info text that might be in the notes
    let cleanedNotes = notes;
    
    // Remove parent information patterns if present
    cleanedNotes = cleanedNotes
      .replace(/שם מלא:?\s*[^\n,]+,?\s*/gi, '')
      .replace(/שם הורה:?\s*[^\n,]+,?\s*/gi, '')
      .replace(/שם:?\s*[^\n,]+,?\s*/gi, '')
      .replace(/ת\.?ז\.?:?\s*[^\n,]+,?\s*/gi, '')
      .replace(/תעודת זהות:?\s*[^\n,]+,?\s*/gi, '')
      .replace(/מספר זהות:?\s*[^\n,]+,?\s*/gi, '')
      .replace(/parentName"?:\s*"?[^",}]+,?\s*/gi, '')
      .replace(/parentId"?:\s*"?[^",}]+,?\s*/gi, '')
      .replace(/הורה\/אפוטרופוס:\s*[^,]+,\s*ת\.ז\.:\s*[^\n]+\s*/gi, '')
      .trim();
      
    // Extract medical notes using regex if still in JSON-like format
    const notesMatch = cleanedNotes.match(/notes"?:\s*"?([^",}]+)"?/i) || 
                      cleanedNotes.match(/medicalNotes"?:\s*"?([^",}]+)"?/i) ||
                      cleanedNotes.match(/הערות:?\s*([^\n]+)/i);
    
    if (notesMatch) {
      return notesMatch[1].trim() || 'אין הערות נוספות';
    }
    
    // Check if there's any text mentioning specific medical conditions
    if (cleanedNotes.match(/אלרגיה|רגישות|תרופות|מגבל|טיפול|רפוא|בריאות/i)) {
      console.log("Found medical-related content:", cleanedNotes);
      return cleanedNotes;
    }
    
    // If notes field has content after removing parent info, return it
    if (cleanedNotes && cleanedNotes !== notes) {
      console.log("Extracted medical notes using text cleaning:", cleanedNotes);
      return cleanedNotes || 'אין הערות נוספות';
    }
    
    // Last resort: if the notes don't match known patterns for parent info,
    // assume they're medical notes
    if (!notes.includes('parentName') && 
        !notes.includes('parentId') && 
        !notes.includes('שם') && 
        !notes.includes('ת.ז')) {
      console.log("Using entire notes field as medical notes:", notes);
      return notes;
    }
    
    console.log("No medical notes found in text, returning default");
    return 'אין הערות נוספות';
  } catch (e) {
    console.error("Error parsing medical notes:", e);
    return 'אין הערות נוספות';
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
