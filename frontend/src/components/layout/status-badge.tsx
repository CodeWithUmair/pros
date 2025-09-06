import { cn } from "@/lib/utils";

export default function StatusBadge({ value, className }: { value: string; className?: string }) {
    let styles = '';

    switch (value.toLowerCase()) {
        case 'active':
            styles = 'text-success border-success';
            break;
        case 'inactive':
            styles = 'text-destructive border-destructive';
            break;
        case 'weekly':
            styles = 'text-gold border-gold';
            break;
        case 'monthly':
            styles = 'text-purple border-purple';
            break;
        case 'paid':
            styles = 'text-success border-success';
            break;
        case 'pending':
            styles = 'text-[#F58505] border-[#F58505]';
            break;
        case 'solved':
            styles = 'text-grey6 border-grey6';
            break;
        case 'high':
            styles = 'text-white bg-destructive border-none';
            break;
        case 'medium':
            styles = 'text-white bg-[#EBA100] border-none';
            break;
        case 'low':
            styles = 'text-white bg-primaryOnly border-none';
            break;
        case 'in-progress':
            styles = 'text-[#1EC838] border-[#1EC838]';
            break;
        default:
            styles = 'text-primary border-primary';
    }

    return (
        <span
            className={cn(`max-w-fit bg-transparent text-xs rounded-full flex items-center justify-center border p-1 px-2 text-center capitalize ${className} ${styles}`)}
        >
            {value}
        </span>
    );
}
