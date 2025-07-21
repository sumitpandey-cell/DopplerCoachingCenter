'use client';

import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; data: T[] }) => React.ReactElement;
  className?: string;
  overscanCount?: number;
}

function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  overscanCount = 5,
}: VirtualizedListProps<T>) {
  const memoizedItems = useMemo(() => items, [items]);

  const ItemRenderer = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    return renderItem({ index, style, data: memoizedItems });
  };

  return (
    <div className={className}>
      <List
        height={height}
        itemCount={memoizedItems.length}
        itemSize={itemHeight}
        itemData={memoizedItems}
        overscanCount={overscanCount}
      >
        {ItemRenderer}
      </List>
    </div>
  );
}

export default VirtualizedList;