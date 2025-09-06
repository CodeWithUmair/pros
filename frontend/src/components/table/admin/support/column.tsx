import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { SupportTableType } from '@/types/user.types';
import StatusBadge from '@/components/layout/status-badge';
import { MoreVertical } from 'lucide-react';

/** header template -> must return a function */
// eslint-disable-next-line react/display-name
const Th = (label: string) => () => (
  <Button className="bg-transparent text-grey6 shadow-none flex items-center justify-center mx-auto hover:bg-transparent">
    {label}
  </Button>
);

/** helpers */
const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

const priorityClass = (p: SupportTableType['priority']) => {
  switch (p) {
    case 'High':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    case 'Medium':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'Low':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    default:
      return 'bg-muted text-foreground/70';
  }
};

export const columns: ColumnDef<SupportTableType>[] = [
  {
    accessorKey: 'username',
    header: Th('Name'),
    cell: ({ row }) => <div className="text-center font-medium">{row.original.username}</div>,
  },
  {
    accessorKey: 'email',
    header: Th('Email'),
    cell: ({ row }) => <div className="text-center text-muted-foreground">{row.original.email}</div>,
  },
  {
    accessorKey: 'status',
    header: Th('Status'),
    cell: ({ row }) => (
      <StatusBadge value={normalize(row.original.status)} className="mx-auto" />
    ),
  },
  {
    accessorKey: 'priority',
    header: Th('Priority'),
    cell: ({ row }) => {
      return (
        <StatusBadge value={normalize(row.original.priority)} className="mx-auto" />
      )
    },
  },
  {
    accessorKey: 'last_activity',
    header: Th('Last Activity'),
    sortingFn: (a, b) => {
      const av =
        a.original.last_activity?.value ?? a.original.last_activity?.label ?? '';
      const bv =
        b.original.last_activity?.value ?? b.original.last_activity?.label ?? '';
      return new Date(av as string).getTime() - new Date(bv as string).getTime();
    },
    cell: ({ row }) => {
      const la: any = row.original.last_activity;
      const label =
        la?.label ??
        (la?.value
          ? new Date(la.value).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
          : '');
      return <div className="text-center">{label}</div>;
    },
  },
  {
    accessorKey: 'description',
    header: Th('Description'),
    cell: ({ row }) => (
      <div className="text-center text-foreground/80 line-clamp-2 max-w-[22ch] mx-auto">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: 'Assignee', // note: capital A per your type
    header: Th('Assignee'),
    cell: ({ row }) => <div className="text-center">{row.original.Assignee}</div>,
  },
  {
    id: 'actions',
    header: Th('Action'),
    enableHiding: false,
    enableSorting: false,
    cell: () => (
      <Button variant="ghost" size="icon" className="mx-auto">
        <MoreVertical className="size-4" />
      </Button>
    ),
  },
];
