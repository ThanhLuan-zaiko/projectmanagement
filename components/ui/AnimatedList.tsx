'use client';

import {
  type KeyboardEventHandler,
  type Key,
  type MouseEventHandler,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { motion, useInView } from 'motion/react';

const defaultItems = [
  'Item 1',
  'Item 2',
  'Item 3',
  'Item 4',
  'Item 5',
  'Item 6',
  'Item 7',
  'Item 8',
  'Item 9',
  'Item 10',
  'Item 11',
  'Item 12',
  'Item 13',
  'Item 14',
  'Item 15',
];

interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  wrapperClassName?: string;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

function AnimatedItem({
  children,
  delay = 0,
  index,
  wrapperClassName = '',
  onMouseEnter,
  onClick,
}: AnimatedItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: false });

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.72, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.72, opacity: 0 }}
      transition={{ duration: 0.22, delay }}
      className={wrapperClassName}
    >
      {children}
    </motion.div>
  );
}

interface RenderItemState {
  isSelected: boolean;
}

export interface AnimatedListProps<T = string> {
  items?: T[];
  onItemSelect?: (item: T, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  listClassName?: string;
  itemClassName?: string;
  itemWrapperClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  selectedIndex?: number;
  selectOnHover?: boolean;
  ariaLabel?: string;
  getItemKey?: (item: T, index: number) => Key;
  renderItem?: (item: T, index: number, state: RenderItemState) => ReactNode;
  onSelectedIndexChange?: (index: number) => void;
}

export default function AnimatedList<T = string>({
  items = defaultItems as T[],
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  listClassName = '',
  itemClassName = '',
  itemWrapperClassName = '',
  displayScrollbar = true,
  initialSelectedIndex = -1,
  selectedIndex,
  selectOnHover = true,
  ariaLabel = 'Animated list',
  getItemKey,
  renderItem,
  onSelectedIndexChange,
}: AnimatedListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(initialSelectedIndex);
  const [scrollToSelectionSmoothly, setScrollToSelectionSmoothly] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);
  const currentSelectedIndex = selectedIndex ?? internalSelectedIndex;

  const updateSelectedIndex = (index: number) => {
    if (selectedIndex === undefined) {
      setInternalSelectedIndex(index);
    }

    onSelectedIndexChange?.(index);
  };

  const updateGradientOpacity = (container: HTMLDivElement | null) => {
    if (!container) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);

    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };

  const handleItemMouseEnter = (index: number) => {
    if (!selectOnHover) {
      return;
    }

    updateSelectedIndex(index);
  };

  const handleItemClick = (item: T, index: number) => {
    updateSelectedIndex(index);
    onItemSelect?.(item, index);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!enableArrowNavigation || items.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setScrollToSelectionSmoothly(true);
      updateSelectedIndex(Math.min(currentSelectedIndex + 1, items.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setScrollToSelectionSmoothly(true);
      updateSelectedIndex(Math.max(currentSelectedIndex - 1, 0));
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      if (currentSelectedIndex < 0 || currentSelectedIndex >= items.length) {
        return;
      }

      event.preventDefault();
      onItemSelect?.(items[currentSelectedIndex], currentSelectedIndex);
    }
  };

  useEffect(() => {
    updateGradientOpacity(listRef.current);
  }, [items.length]);

  useEffect(() => {
    if (currentSelectedIndex < 0 || !listRef.current) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const container = listRef.current;

      if (!container) {
        return;
      }

      const selectedItem = container.querySelector(`[data-index="${currentSelectedIndex}"]`) as HTMLElement | null;

      if (!selectedItem) {
        return;
      }

      const extraMargin = 24;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;

      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({
          top: Math.max(itemTop - extraMargin, 0),
          behavior: scrollToSelectionSmoothly ? 'smooth' : 'auto',
        });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: scrollToSelectionSmoothly ? 'smooth' : 'auto',
        });
      }

      updateGradientOpacity(container);
      setScrollToSelectionSmoothly(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentSelectedIndex, scrollToSelectionSmoothly]);

  return (
    <div className={`relative w-full ${className}`}>
      <div
        id={listId}
        ref={listRef}
        tabIndex={enableArrowNavigation ? 0 : undefined}
        aria-label={ariaLabel}
        className={`max-h-[400px] overflow-y-auto p-4 focus:outline-none ${
          displayScrollbar
            ? '[&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-slate-950/80 [&::-webkit-scrollbar-thumb]:rounded-[999px] [&::-webkit-scrollbar-thumb]:bg-slate-700/80'
            : '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        } ${listClassName}`}
        onScroll={(event) => updateGradientOpacity(event.currentTarget)}
        onKeyDown={handleKeyDown}
        style={{
          scrollbarWidth: displayScrollbar ? 'thin' : 'none',
          scrollbarColor: displayScrollbar ? 'rgba(100, 116, 139, 0.8) rgba(2, 6, 23, 0.6)' : undefined,
        }}
      >
        {items.map((item, index) => {
          const isSelected = currentSelectedIndex === index;
          const key = getItemKey ? getItemKey(item, index) : index;

          return (
            <AnimatedItem
              key={key}
              delay={Math.min(index * 0.03, 0.18)}
              index={index}
              wrapperClassName={itemWrapperClassName || 'mb-4'}
              onMouseEnter={() => handleItemMouseEnter(index)}
              onClick={() => handleItemClick(item, index)}
            >
              {renderItem ? (
                renderItem(item, index, { isSelected })
              ) : (
                <div
                  className={`rounded-2xl bg-white/[0.04] p-4 transition-colors duration-200 ${
                    isSelected ? 'bg-white/[0.09]' : ''
                  } ${itemClassName}`}
                >
                  <p className="m-0 text-white">{String(item)}</p>
                </div>
              )}
            </AnimatedItem>
          );
        })}
      </div>

      {showGradients && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-0 h-12 bg-gradient-to-b from-slate-950 via-slate-950/85 to-transparent transition-opacity duration-300"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  );
}
