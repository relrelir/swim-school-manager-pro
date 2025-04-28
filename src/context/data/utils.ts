
// Helper function to generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Helper to load data from localStorage
export const loadData = <T,>(key: string, defaultValue: T): T => {
  try {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : defaultValue;
  } catch (error) {
    console.error(`Error loading data from localStorage for key ${key}:`, error);
    return defaultValue;
  }
};

// Helper to save data to localStorage
export const saveData = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data to localStorage for key ${key}:`, error);
  }
};
