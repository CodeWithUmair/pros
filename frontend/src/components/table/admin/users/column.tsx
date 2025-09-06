import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { UsersTableType } from '@/types/user.types';
import { MoreVertical } from 'lucide-react';

/** header template -> must return a function */
// eslint-disable-next-line react/display-name
const Th = (label: string) => () => (
    <Button className='bg-transparent text-grey6 shadow-none flex items-center justify-center mx-auto hover:bg-transparent'>{label}</Button>
);

export const columns: ColumnDef<UsersTableType>[] = [
    {
        accessorKey: 'name',
        header: Th('Name'),
        cell: ({ row }) => <div className="text-center">{row.original.name}</div>,
    },
    {
        accessorKey: 'email',
        header: Th('Email'),
        cell: ({ row }) => (
            <div className="text-center">{row.original.email}</div>
        ),
    },
    // {
    //     accessorKey: 'status',
    //     header: Th('Status'),
    //     cell: ({ row }) => (
    //         <StatusBadge value={(row.original.status as string).toLowerCase()} className='mx-auto' />
    //     ),
    // },
    {
        accessorKey: 'signup_date',
        header: Th('Signup Date'),
        // sort by ISO value if available; fallback to label
        sortingFn: (a, b) => {
            const av =
                a.original.signup_date?.value ?? a.original.signup_date?.label ?? '';
            const bv =
                b.original.signup_date?.value ?? b.original.signup_date?.label ?? '';
            return new Date(av as string).getTime() - new Date(bv as string).getTime();
        },
        cell: ({ row }) => {
            const sd = row.original.signup_date as any;
            const label =
                sd?.label ??
                (sd?.value
                    ? new Date(sd.value).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })
                    : '');
            return <div className="text-center">{label}</div>;
        },
    },
    {
        accessorKey: 'total_balance',
        header: Th('Total Balance (USDC)'),
        cell: ({ row }) => (
            <div className="text-center">
                {row.original.total_balance}
            </div>
        ),
    },
    {
        accessorKey: 'total_transaction',
        header: Th('Total Transactions'),
        cell: ({ row }) => (
            <div className="text-center">{row.original.total_transaction}</div>
        ),
    },
    {
        id: 'actions',
        header: Th('Action'),
        enableHiding: false,
        cell: () => (
            <Button variant="ghost" size="icon" className="mx-auto">
                <MoreVertical className="size-4" />
            </Button>
        ),
    },
];
