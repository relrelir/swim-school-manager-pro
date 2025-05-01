
/**
 * Extracts parent information from the notes field
 */
export function parseParentInfo(notes: string | null): { parentName: string; parentId: string } {
  if (!notes) return { parentName: '', parentId: '' };
  
  const parentNameMatch = notes.match(/הורה\/אפוטרופוס: ([^,]+)/);
  const parentIdMatch = notes.match(/ת\.ז\.: ([^\n]+)/);
  
  return {
    parentName: parentNameMatch ? parentNameMatch[1].trim() : '',
    parentId: parentIdMatch ? parentIdMatch[1].trim() : '',
  };
}

/**
 * Extracts medical notes from the notes field
 */
export function parseMedicalNotes(notes: string | null): string {
  if (!notes) return '';
  
  // Remove parent info part from notes
  const cleanNotes = notes.replace(/הורה\/אפוטרופוס: [^,]+, ת\.ז\.: [^\n]+\n\n/g, '').trim();
  
  return cleanNotes;
}

/**
 * Gets health declaration content items
 */
export function getDeclarationItems(): string[] {
  return [
    'בני/בתי נמצא/ת בכושר ובמצב בריאותי תקין המאפשר השתתפות בפעילות.',
    'לא ידוע לי על מגבלות רפואיות המונעות מבני/בתי להשתתף בפעילות.',
    'לא ידוע לי על רגישויות, מחלות או בעיות רפואיות אחרות שעלולות להשפיע על השתתפותו/ה בפעילות.',
    'אני מתחייב/ת להודיע למדריכים על כל שינוי במצב הבריאותי של בני/בתי.',
  ];
}
