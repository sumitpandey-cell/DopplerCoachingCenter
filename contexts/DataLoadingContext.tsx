"use client";
import React, { createContext, useContext, useState } from 'react';

const DataLoadingContext = createContext<{
  isDataLoading: boolean;
  setIsDataLoading: (v: boolean) => void;
  refreshKey: number;
  triggerRefresh: () => void;
}>({
  isDataLoading: false,
  setIsDataLoading: () => {},
  refreshKey: 0,
  triggerRefresh: () => {},
});

export const useDataLoading = () => useContext(DataLoadingContext);

export function DataLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <DataLoadingContext.Provider value={{ isDataLoading, setIsDataLoading, refreshKey, triggerRefresh }}>
      {children}
    </DataLoadingContext.Provider>
  );
} 