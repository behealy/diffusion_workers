import React from 'react';
import { useGenerationStore } from '@/hooks/useStores';
import { HistoryList } from './HistoryList';
import type { HistoryListItem } from './HistoryList';

export const HistoryListContainer: React.FC = () => {
  const generationHistory = useGenerationStore((state) => state.generationHistory);

  const handleItemPress = (item: HistoryListItem) => {
    // TODO: Implement item press handler - could navigate to detail view,
    // copy parameters, or use as input for next generation
    console.log('History item pressed:', item);
  };

  return (
    <HistoryList
      items={generationHistory}
      onItemPress={handleItemPress}
      isLoading={false}
      emptyMessage="No generation history yet"
    />
  );
};