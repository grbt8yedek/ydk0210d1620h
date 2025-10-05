'use client'

import React, { memo } from 'react'
import dynamic from 'next/dynamic'

type RowRenderer<T> = (item: T, index: number) => React.ReactNode

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  height: number
  overscanCount?: number
  renderRow: RowRenderer<T>
}

// react-window'u dinamik ve yalnızca ihtiyaç olduğunda yükle
const FixedSizeList: any = dynamic(() => import('react-window').then(m => (m as any).FixedSizeList), {
  ssr: false,
  loading: () => null,
})

function VirtualListInner<T>({ items, itemHeight, height, overscanCount = 5, renderRow }: VirtualListProps<T>) {
  const enable = process.env.NEXT_PUBLIC_ENABLE_VIRTUAL_LIST === 'true'

  if (!enable || items.length < 500) {
    // Feature flag kapalıysa veya liste küçükse normal render
    return (
      <div style={{ maxHeight: height, overflowY: 'auto' }}>
        {items.map((item, index) => (
          <div key={index} style={{ height: itemHeight }}>
            {renderRow(item, index)}
          </div>
        ))}
      </div>
    )
  }

  // Büyük listelerde sanal liste
  return (
    <FixedSizeList
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      overscanCount={overscanCount}
      width={'100%'}
    >
      {({ index, style }: any) => (
        <div style={style}>
          {renderRow(items[index], index)}
        </div>
      )}
    </FixedSizeList>
  )
}

const VirtualList = memo(VirtualListInner) as typeof VirtualListInner
export default VirtualList
