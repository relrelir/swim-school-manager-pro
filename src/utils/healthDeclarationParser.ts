
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
