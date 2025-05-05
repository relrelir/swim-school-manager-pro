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
    
    // CRITICAL FIX: Extract parent information with much more robust pattern matching
    
    // Check if the entire notes is a simple Hebrew name pattern (like "יצחק הראל")
    // This is the most common case for many forms - just the parent's name
    if (/^[\u0590-\u05FF\s\u0027\u0022\u05F3\u05F4א-ת]+\s+[\u0590-\u05FF\s\u0027\u0022\u05F3\u05F4א-ת]+$/i.test(notes)) {
      console.log("Direct Hebrew name pattern detected:", notes);
      return {
        parentName: notes.trim(),
        parentId: ''
      };
    }
    
    // Common pattern: "שם הורה/אפוטרופוס: יצחק הראל"
    const parentLabeledMatch = notes.match(/(?:שם|שם\s*מלא|שם\s*(?:הורה|ההורה|אפוטרופוס)|parent\s*name)[\s:]*([^\n\r\.,;]*)/i);
    
    // Check for labeled patterns like "הורה: יצחק הראל"
    const simpleLabeledMatch = notes.match(/(?:הורה|אפוטרופוס|אחראי|חותם)[\s:]+([^\n\r\.,;]*)/i);
    
    // For structured formats
    const nameMatch = notes.match(/(?:שם[\s_]*(?:הורה|מלא|ההורה|אפוטרופוס)|parentName|parentname|parent[\s_]*name)[\s:="]+["']?([^",\}\r\n;]+)["']?/i) || 
                     notes.match(/["'](?:שם[\s_]*(?:הורה|מלא|ההורה|אפוטרופוס)|parentName|parentname|parent[\s_]*name)["'][\s:="]+["']?([^",\}\r\n;]+)["']?/i);
    
    // For parent ID, look for various Hebrew and English patterns
    const idMatch = notes.match(/(?:תעודת[\s_]*זהות|ת\.?ז\.?|מספר[\s_]*זהות|parentId|parentid|parent[\s_]*id)[\s:="]+["']?([^",\}\r\n;]+)["']?/i) || 
                    notes.match(/["'](?:תעודת[\s_]*זהות|ת\.?ז\.?|מספר[\s_]*זהות|parentId|parentid|parent[\s_]*id)["'][\s:="]+["']?([^",\}\r\n;]+)["']?/i);
    
    // CRITICAL FIX: Try multiple approaches to find the parent name
    let parentName = '';
    
    // Try each match pattern in priority order
    if (parentLabeledMatch && parentLabeledMatch[1].trim()) {
      parentName = parentLabeledMatch[1].trim();
      console.log("Found parent name from labeled match:", parentName);
    } 
    else if (simpleLabeledMatch && simpleLabeledMatch[1].trim()) {
      parentName = simpleLabeledMatch[1].trim();
      console.log("Found parent name from simple labeled match:", parentName);
    }
    else if (nameMatch && nameMatch[1].trim()) {
      parentName = nameMatch[1].trim();
      console.log("Found parent name from structured match:", parentName);
    }
    // Special case: The notes itself might be just the name
    // If we have a short string that looks like a Hebrew name and no other patterns matched
    else if (notes.length < 30 && /[\u0590-\u05FF\s\u0027\u0022\u05F3\u05F4א-ת]/.test(notes)) {
      // Look for something that looks like a Hebrew name (sequences of Hebrew characters)
      const nameCandidates = notes.match(/[\u0590-\u05FF\s\u0027\u0022\u05F3\u05F4א-ת]{2,}(?:\s+[\u0590-\u05FF\s\u0027\u0022\u05F3\u05F4א-ת]{2,})+/g);
      if (nameCandidates && nameCandidates.length > 0) {
        // Take the longest match as it's likely the full name
        const longestName = nameCandidates.reduce((longest, current) => 
          current.length > longest.length ? current : longest, '');
        parentName = longestName.trim();
        console.log("Found parent name from Hebrew text pattern:", parentName);
      } else {
        // If no multi-word Hebrew sequence, the whole text might be the name
        parentName = notes.trim();
        console.log("Using entire notes as parent name (fallback):", parentName);
      }
    }
    
    const result = {
      parentName: parentName,
      parentId: idMatch ? idMatch[1].trim() : ''
    };
    
    console.log("Final extracted parent info:", result);
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
export const parseMedicalNotes = (text: string | null): string => {
  if (!text) return '';
  
  try {
    console.log("Parsing medical notes from:", text);
    // Try to parse as JSON first
    try {
      const parsedNotes = JSON.parse(text);
      
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
    const notesMatch = text.match(/(?:notes|medicalNotes|medical[\s_]*notes|הערות[\s_]*רפואיות|הערות)[\s:="]+["']?([^"\}\r\n]+)["']?/i) || 
                      text.match(/["'](?:notes|medicalNotes|medical[\s_]*notes|הערות[\s_]*רפואיות|הערות)["'][\s:="]+["']?([^"\}\r\n]+)["']?/i);
    
    if (notesMatch && notesMatch[1].trim()) {
      const result = notesMatch[1].trim();
      console.log("Extracted medical notes using regex:", result);
      return result;
    }
    
    // CRITICAL FIX: Check for specific medical phrase pattern like "אני קוף"
    const medicalPhraseMatch = text.match(/אני\s+([^"\{\}\r\n]+)/i);
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
    let remainingText = text;
    parentPatterns.forEach(pattern => {
      remainingText = remainingText.replace(pattern, ' ');
    });
    
    // Clean up JSON syntax remnants and extra spaces
    remainingText = remainingText
      .replace(/[\{\}",]|\s*:\s*['"]?|['"]?\s*[,:]?\s*[\{\}]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
      
    // If we have substantial remaining text after removing parent info, it might be medical notes
    if (remainingText && remainingText.length > 5 && remainingText !== text) {
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
