import React, { createContext, useContext, useState, useMemo } from 'react';

interface SourceStat {
  total: number;
  eps: number;
}

interface DataSourceContextValue {
  activeSourceIds: Set<string>;
  sourceStats: Record<string, SourceStat>;
  toggleSource: (id: string) => void;
  updateStats: (id: string, stats: SourceStat) => void;
}

const DataSourceContext = createContext<DataSourceContextValue | undefined>(undefined);

export const DataSourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSourceIds, setActiveSourceIds] = useState<Set<string>>(new Set());
  const [sourceStats, setSourceStats] = useState<Record<string, SourceStat>>({});

  const toggleSource = (id: string) => {
    setActiveSourceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const updateStats = (id: string, stats: SourceStat) => {
    setSourceStats(prev => ({
      ...prev,
      [id]: stats,
    }));
  };

  const value = useMemo(() => ({
    activeSourceIds,
    sourceStats,
    toggleSource,
    updateStats,
  }), [activeSourceIds, sourceStats]);

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  );
};

export const useDataSource = () => {
  const context = useContext(DataSourceContext);
  if (context === undefined) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
};
