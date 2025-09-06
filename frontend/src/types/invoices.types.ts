export interface LineItem {
    amount: number;
    currency: string;
    symbol: string;
}

export interface RecurringInvoice {
    _id: string;
    invoiceName: string;
    payeeEmail: string;
    description: string;
    lineItem: LineItem;
    recurrence: "weekly" | "monthly";
    isActive: boolean;
    nextExecutionDate: string;
    createdAt: string;
    lastExecutionDate?: string;
}

export interface Invoice extends RecurringInvoice {
    creatorId: {
        _id: string,
        name: string,
        email: string
    },
    status: string;
    createdAt: string;
    updatedAt: string;
}
