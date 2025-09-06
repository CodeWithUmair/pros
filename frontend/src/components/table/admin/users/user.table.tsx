'use client';

import * as React from 'react';

import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from '@tanstack/react-table';
import { columns } from './column';
import DataTableUI from '../../DataTableUI';
import { Card } from '@/components/ui/card';
import { useUsersTableData } from '@/hooks/api/useUsersTableData';

export default function UsersTable() {
    const { data, loading } = useUsersTableData();

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    );
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        initialState: {
            pagination: {
                pageSize: 25
            }
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection
        }
    });

    return (
        <Card className="w-full overflow-hidden">
            <DataTableUI table={table} columns={columns} isLoadingData={loading} />
        </Card>
    );
}
