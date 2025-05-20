
// Get data from local storage or use initial data
export function getFromLocalStorage<T>(key: string, initialData: T[]): T[] {
  try {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      // Parse and handle date objects correctly
      const parsed = JSON.parse(storedData, (key, value) => {
        if (key === 'createdAt' || key === 'productionDate' || key === 'date' || key === 'submittedAt' || key === 'updatedAt') {
          return new Date(value);
        }
        return value;
      });
      return Array.isArray(parsed) ? parsed : initialData;
    }
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
  }
  return initialData;
}

// Save data to local storage
export function saveToLocalStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}
