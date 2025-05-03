
/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * Now optimized for Alef font
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // With Alef font and RTL enabled, we can return text directly
  return text;
};

/**
 * Legacy helper function kept for backward compatibility
 */
export const reverseText = (text: string): string => {
  return text || '';
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 * with Alef font integration
 */
export const prepareRtlText = (text: string): string => {
  return text || '';
};

/**
 * Processes mixed content text to correctly display in RTL PDF context
 * This function handles the special LTR chunks (English text and numbers) in RTL context
 * 
 * @param text The text to process
 * @param isLtrContent Whether this content should be treated as left-to-right (English/numbers)
 * @returns Processed text with proper directional marks
 */
export const processTextDirection = (text: string | number, isLtrContent = false): string => {
  if (text === null || text === undefined) return '';
  
  // Convert to string if number
  const textStr = String(text);
  
  // If empty, just return
  if (!textStr.trim()) return textStr;
  
  // If marked as LTR content (English, numbers) add LTR mark and wrap with special chars
  if (isLtrContent) {
    // Add LTR mark (U+200E) before text
    return `\u200E${textStr}\u200E`;
  }
  
  // For Hebrew content check if it contains any numbers or Latin characters
  const containsLatinOrNumbers = /[A-Za-z0-9]/.test(textStr);
  
  // If mixed content, analyze and mark appropriately
  if (containsLatinOrNumbers) {
    // Split the content into Hebrew and non-Hebrew parts
    let processed = '';
    let currentWord = '';
    let isCurrentWordLatin = false;
    
    for (let i = 0; i < textStr.length; i++) {
      const char = textStr[i];
      const isLatinOrNumber = /[A-Za-z0-9]/.test(char);
      
      if (i === 0) {
        // First character
        currentWord = char;
        isCurrentWordLatin = isLatinOrNumber;
      } else if (isLatinOrNumber !== isCurrentWordLatin || char === ' ') {
        // Character type changed or space encountered
        if (isCurrentWordLatin) {
          processed += `\u200E${currentWord}\u200E`;
        } else {
          processed += currentWord;
        }
        currentWord = char;
        isCurrentWordLatin = isLatinOrNumber;
      } else {
        // Same character type, continue building current word
        currentWord += char;
      }
    }
    
    // Add the last word
    if (currentWord) {
      if (isCurrentWordLatin) {
        processed += `\u200E${currentWord}\u200E`;
      } else {
        processed += currentWord;
      }
    }
    
    return processed;
  }
  
  // Regular Hebrew text, no special handling needed
  return textStr;
};
