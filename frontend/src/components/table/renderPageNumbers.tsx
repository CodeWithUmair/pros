import React from 'react';
import { Button } from '@/components/ui/button';

export const renderPageNumbers = (
  currentPage: number,
  pageCount: number,
  setPageIndex: (pageIndex: number) => void
) => {
  const pages = [];

  if (pageCount <= 5) {
    // If pageCount is less than or equal to 5, show all page numbers
    for (let i = 0; i < pageCount; i++) {
      pages.push(
        <Button
          key={i}
          variant="outline2"
          size="icon"
          className={`size-8 rounded-md ${
            currentPage === i + 1
               ? 'bg-primaryOnly text-white'
              : 'hover:text-white'
          }`}
          onClick={() => setPageIndex(i)}
        >
          {i + 1}
        </Button>
      );
    }
  } else {
    // Always show the first page
    pages.push(
      <Button
        key={0}
        variant="outline2"
        size="icon"
        className={`size-8 rounded-md ${
          currentPage === 1
            ? 'bg-primaryOnly text-white'
            : 'hover:text-white'
        }`}
        onClick={() => setPageIndex(0)}
      >
        1
      </Button>
    );

    if (currentPage > 3) {
      pages.push(
        <span
          key="dots1"
          className="flex h-10 w-10 items-center justify-center rounded-md bg-background dark:bg-transparent text-foreground"
        >
          ...
        </span>
      );
    }

    // Show the middle pages correctly around the current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(pageCount - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant="outline2"
          size="icon"
          className={`size-8 rounded-md ${
            currentPage === i
              ? 'bg-primaryOnly text-white'
              : 'hover:text-white'
          }`}
          onClick={() => setPageIndex(i - 1)}
        >
          {i}
        </Button>
      );
    }

    if (currentPage < pageCount - 2) {
      pages.push(
        <span
          key="dots2"
          className="flex h-10 w-10 items-center justify-center rounded-md bg-background dark:bg-transparent text-foreground"
        >
          ...
        </span>
      );
    }

    // Always show the last page
    pages.push(
      <Button
        key={pageCount}
        variant="outline2"
        size="icon"
        className={`size-8 rounded-md ${
          currentPage === pageCount
             ? 'bg-primaryOnly text-white'
            : 'hover:text-white'
        }`}
        onClick={() => setPageIndex(pageCount - 1)}
      >
        {pageCount}
      </Button>
    );
  }

  return pages;
};
