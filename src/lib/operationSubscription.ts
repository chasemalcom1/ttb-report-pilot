
import { useEffect } from 'react';

// Event system for operation updates
type OperationUpdateListener = () => void;

class OperationEventManager {
  private listeners: OperationUpdateListener[] = [];
  
  subscribe(listener: OperationUpdateListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  notify() {
    console.log('Notifying operation update listeners:', this.listeners.length);
    this.listeners.forEach(listener => listener());
  }
}

export const operationEventManager = new OperationEventManager();

// Hook to subscribe to operation updates
export const useOperationUpdates = (callback: () => void) => {
  useEffect(() => {
    const unsubscribe = operationEventManager.subscribe(callback);
    return unsubscribe;
  }, [callback]);
};
