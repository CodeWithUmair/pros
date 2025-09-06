'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon
} from '@radix-ui/react-icons';
import { useMediaQuery } from 'usehooks-ts';

interface PaginationProps {
  pageCount: number;
  currentPage: number;
  setPageIndex: (index: number) => void;
  getCanPreviousPage: () => boolean;
  getCanNextPage: () => boolean;
  nextPage: () => void;
  previousPage: () => void;
  renderPageNumbers: (
    currentPage: number,
    pageCount: number,
    setPageIndex: (index: number) => void,
    pageIndex: number
  ) => React.ReactNode;
}

const Pagination: React.FC<PaginationProps> = ({
  pageCount,
  currentPage,
  setPageIndex,
  getCanPreviousPage,
  getCanNextPage,
  nextPage,
  previousPage,
  renderPageNumbers
}) => {
  
  const [isSmallerScreen, setIsSmallerScreen] = React.useState(false);
  const matches = useMediaQuery('(max-width: 1200px)');

  React.useEffect(() => {
    setIsSmallerScreen(matches);
  }, [matches]);

  if (pageCount <= 1) return null; // If there's only one page, no need to show pagination

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <div className="flex items-center space-x-2 text-xs text-black md:text-sm">
        <Button
          aria-label="Go to first page"
          variant="outline2"
          size="icon"
          className="group flex size-8 rounded-md p-0 hover:bg-accent"
          onClick={() => setPageIndex(0)}
          disabled={!getCanPreviousPage()}
          style={{
            display: isSmallerScreen ? 'none' : 'visible'
          }}
        >
          <DoubleArrowLeftIcon
            className="size-4 group-hover:text-foreground"
            aria-hidden="true"
          />
        </Button>
        <Button
          aria-label="Go to previous page"
          variant="outline2"
          size="icon"
          className="group w-fit gap-1 rounded-md px-2 hover:bg-accent md:px-4"
          onClick={previousPage}
          disabled={!getCanPreviousPage()}
        >
          <ChevronLeftIcon
            className="size-4 group-hover:text-foreground"
            aria-hidden="true"
          />
          {!isSmallerScreen && 'Back'}
        </Button>

        {/* Display page numbers */}
        {renderPageNumbers(currentPage, pageCount, setPageIndex, currentPage)}

        <Button
          aria-label="Go to next page"
          variant="outline2"
          size="icon"
          className="group size-8 w-fit gap-1 rounded-md px-2 hover:bg-accent md:px-4"
          onClick={nextPage}
          disabled={!getCanNextPage()}
        >
          {!isSmallerScreen && 'Next'}

          <ChevronRightIcon
            className="size-4 group-hover:text-foreground"
            aria-hidden="true"
          />
        </Button>
        <Button
          aria-label="Go to last page"
          variant="outline2"
          size="icon"
          className="group flex size-8 rounded-md hover:bg-accent"
          onClick={() => setPageIndex(pageCount - 1)}
          disabled={!getCanNextPage()}
          style={{
            display: isSmallerScreen ? 'none' : 'visible'
          }}
        >
          <DoubleArrowRightIcon
            className="size-4 group-hover:text-foreground"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
