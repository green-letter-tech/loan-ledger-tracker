import { createContext, useContext, type ReactNode } from 'react';

import type { LoanRepository } from '@lendledger/core';

const AppContext = createContext<LoanRepository | null>(null);

interface AppProviderProps {
  repository: LoanRepository;
  children: ReactNode;
}

export function AppProvider({ repository, children }: AppProviderProps) {
  return <AppContext.Provider value={repository}>{children}</AppContext.Provider>;
}

export function useRepository(): LoanRepository {
  const repository = useContext(AppContext);
  if (!repository) {
    throw new Error('useRepository must be used within AppProvider');
  }
  return repository;
}
