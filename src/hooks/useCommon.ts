import { useState } from 'react';

// Ortak loading state hook'u - tekrarlayan kod'u önlemek için
export function useLoading(initialState: boolean = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  
  return {
    isLoading,
    setIsLoading,
    startLoading,
    stopLoading
  };
}

// Ortak error state hook'u
export function useError() {
  const [error, setError] = useState<string>('');
  
  const setErrorMessage = (message: string) => setError(message);
  const clearError = () => setError('');
  
  return {
    error,
    setError,
    setErrorMessage,
    clearError
  };
}

// Ortak async operation hook'u
export function useAsyncOperation() {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const { error, setErrorMessage, clearError } = useError();
  
  const execute = async (operation: () => Promise<any>) => {
    try {
      startLoading();
      clearError();
      const result = await operation();
      return result;
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Bir hata oluştu');
      throw err;
    } finally {
      stopLoading();
    }
  };
  
  return {
    isLoading,
    error,
    execute,
    clearError
  };
}
