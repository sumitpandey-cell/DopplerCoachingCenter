'use client';

import React, { createContext, useContext, useState } from 'react';

interface NavigationContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <NavigationContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </NavigationContext.Provider>
  );
}; 