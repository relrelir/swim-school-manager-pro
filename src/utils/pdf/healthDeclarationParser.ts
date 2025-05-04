
/**
 * Parse parent information from the notes field
 */
export const parseParentInfo = (notes: string | null): { parentName: string; parentId: string } => {
  if (!notes) return { parentName: '', parentId: '' };
  
  try {
    console.log("Parsing parent info from notes:", notes);
    
    // First check for a specific format pattern: "הורה/אפוטרופוס: NAME, ת.ז.: ID"
    const parentFormatMatch = notes.match(/הורה\/אפוטרופוס:\s*([^,]+),\s*ת\.ז\.:\s*([^\n]+)/);
    if (parentFormatMatch) {
      const result = {
        parentName: parentFormatMatch[1].trim(),
        parentId: parentFormatMatch[2].trim()
      };
      console.log("Successfully parsed parent info from formatted text:", result);
      return result;
    }
    
    // Try to parse as JSON
    try {
      const parsedNotes = JSON.parse(notes);
      const result = {
        parentName: parsedNotes.parentName || '',
        parentId: parsedNotes.parentId || ''
      };
      console.log("Successfully parsed notes as JSON:", result);
      return result;
    } catch (e) {
      console.log("Failed to parse notes as JSON, trying generic regex");
      
      // If not valid JSON, try to extract using generic regex
      const nameMatch = notes.match(/parentName"?:\s*"?([^",}]+)"?/i) || 
                        notes.match(/parent[_\s]*name"?:\s*"?([^",}]+)"?/i);
      const idMatch = notes.match(/parentId"?:\s*"?([^",}]+)"?/i) ||
                      notes.match(/parent[_\s]*id"?:\s*"?([^",}]+)"?/i);
      
      const result = {
        parentName: nameMatch ? nameMatch[1].trim() : '',
        parentId: idMatch ? idMatch[1].trim() : ''
      };
      
      console.log("Extracted parent info using regex:", result);
      return result;
    }
  } catch (error) {
    console.error("Error parsing parent info:", error);
    return { parentName: '', parentId: '' };
  }
};

/**
 * Parse medical notes from the notes field
 */
export const parseMedicalNotes = (notes: string | null): string => {
  if (!notes) return '';
  
  try {
    console.log("Parsing medical notes from:", notes);
    
    // First, remove any parent info formatted text to avoid including it in medical notes
    let cleanedNotes = notes;
    const parentInfoMatch = notes.match(/הורה\/אפוטרופוס:\s*[^,]+,\s*ת\.ז\.:\s*[^\n]+/);
    if (parentInfoMatch) {
      cleanedNotes = notes.replace(parentInfoMatch[0], '').trim();
      
      // If there are multiple newlines after removing parent info, trim them down
      cleanedNotes = cleanedNotes.replace(/^\n+/, '').trim();
    }
    
    // Try to parse as JSON first
    try {
      const parsedNotes = JSON.parse(cleanedNotes);
      const result = parsedNotes.notes || parsedNotes.medicalNotes || '';
      console.log("Successfully parsed medical notes as JSON:", result);
      return result;
    } catch (e) {
      // If it's not valid JSON but we've already removed parent info,
      // the remaining text might just be the medical notes
      if (parentInfoMatch && cleanedNotes) {
        console.log("Using cleaned text as medical notes:", cleanedNotes);
        return cleanedNotes;
      }
      
      console.log("Failed to parse medical notes as JSON, trying regex");
      
      // If not valid JSON, try to extract using regex
      const notesMatch = cleanedNotes.match(/notes"?:\s*"?([^",}]+)"?/i) || 
                         cleanedNotes.match(/medical[_\s]*notes"?:\s*"?([^",}]+)"?/i);
      
      const result = notesMatch ? notesMatch[1].trim() : '';
      console.log("Extracted medical notes using regex:", result);
      return result;
    }
  } catch (error) {
    console.error("Error parsing medical notes:", error);
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
