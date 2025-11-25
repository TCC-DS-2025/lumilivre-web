import { useState, useEffect, type RefObject } from 'react';

interface DynamicPageSizeOptions {
  rowHeight?: number;
  headerHeight?: number;
  footerHeight?: number;
  minRows?: number;
}

export function useDynamicPageSize(
  containerRef: RefObject<HTMLElement | null>,
  options: DynamicPageSizeOptions = {},
) {
  const {
    rowHeight = 53,
    headerHeight = 48,
    footerHeight = 56,
    minRows = 5,
  } = options;

  const [itemsPerPage, setItemsPerPage] = useState(0);

  useEffect(() => {
    const calculatePageSize = () => {
      if (!containerRef.current) return;

      const containerHeight = containerRef.current.clientHeight;
      if (containerHeight === 0) return;

      const availableHeightForRows =
        containerHeight - headerHeight - footerHeight;

      const calculatedRows = Math.floor(availableHeightForRows / rowHeight);

      setItemsPerPage(Math.max(minRows, calculatedRows));
    };

    // calculo
    calculatePageSize();

    const observer = new ResizeObserver(() => {
      calculatePageSize();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [containerRef, rowHeight, headerHeight, footerHeight, minRows]);

  return itemsPerPage;
}
