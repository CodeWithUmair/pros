import React from 'react';
import {
  ColumnDef,
  flexRender,
  Table as ReactTableType
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useMediaQuery } from 'usehooks-ts';
import Pagination from './Pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import Image from 'next/image';
import LoadingSpinner from '../layout/loading-spinner';
import HorizontalScrollContainer from './HorizontalScrollContainer';
import { renderPageNumbers } from './renderPageNumbers';

interface DataTableUIProps<TData> {
  table: ReactTableType<TData>;
  columns: ColumnDef<TData, unknown>[];
  isLoadingData?: boolean;
  userInTable?: boolean;
}

function DataTableUI<TData>({
  table,
  columns,
  userInTable = false,
  isLoadingData
}: DataTableUIProps<TData>) {
  const isSmallerScreen = useMediaQuery('(max-width: 1200px)');

  return (
    <div className="space-y-8 rounded-md">
      {isSmallerScreen ? (
        <HorizontalScrollContainer>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index, headers) => {
                    const isLast = index === headers.length - 1;
                    return (
                      <TableHead
                        key={header.id}
                        className={`font-medium ${
                          // isLast ? 'flex items-center justify-end' : 'text-left'
                          ''
                          }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoadingData ? (
                // 1. Loading state
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-40 text-center">
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                // 2. Data rows
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={`${userInTable ? 'rounded-lg' : ''}`}
                  >
                    {row.getVisibleCells().map((cell, index, cells) => (
                      <TableCell
                        key={cell.id}
                        className="font-bold text-foreground"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                // 3. No data state
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-40 text-center">
                    <div className="flex w-full flex-col items-center justify-center gap-5">
                      <Image
                        src="/images/no_records_found.svg"
                        alt="No data available"
                        width={200}
                        height={200}
                        quality={100}
                        className="mx-auto"
                      />
                      <p className="text-lg font-semibold">No Records Found!</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </HorizontalScrollContainer>
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index, headers) => {
                  const isLast = index === headers.length - 1;
                  return (
                    <TableHead
                      key={header.id}
                      className={`font-medium ${
                        // isLast ? 'flex items-center justify-end' : 'text-left'
                        ''
                        }`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoadingData ? (
              // 1. Loading state
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <LoadingSpinner />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              // 2. Data rows
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={`${userInTable ? 'rounded-lg' : ''}`}
                >
                  {row.getVisibleCells().map((cell, index, cells) => {
                    const isLast = index === cells.length - 1
                    return (
                      <TableCell
                        key={cell.id}
                        className="font-bold text-foreground"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              // 3. No data state
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex w-full flex-col items-center justify-center gap-5">
                    <Image
                      src="/images/no_records_found.svg"
                      alt="No data available"
                      width={200}
                      height={200}
                      quality={100}
                      className="mx-auto"
                    />
                    <p className="text-lg font-semibold">No Records Found!</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      {/* Page Size Selector */}
      {table.getRowModel().rows.length > 24 && (
        <div className="flex justify-between ml-5">
          <div>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-48 border">
                <SelectValue placeholder="Select page size" className='text-sm xl:text-base 3xl:text-base' />
              </SelectTrigger>
              <SelectContent>
                {[25, 50, 75, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    Show {pageSize} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      {table.getPageCount() > 1 && (
        <Pagination
          pageCount={table.getPageCount()}
          currentPage={table.getState().pagination.pageIndex + 1}
          setPageIndex={table.setPageIndex}
          getCanPreviousPage={table.getCanPreviousPage}
          getCanNextPage={table.getCanNextPage}
          nextPage={table.nextPage}
          previousPage={table.previousPage}
          renderPageNumbers={renderPageNumbers}
        />
      )}
    </div>
  );
}

export default DataTableUI;
