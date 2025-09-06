import { z } from "zod"

// Only allow dollars with up to 2 decimal places
const dollarAmountRegex = /^(0|[1-9]\d*)(\.\d{1,2})?$/

const payeeSchema = z.object({
    email: z.string().email({ message: "Invalid email" }),
    amount: z.string().regex(dollarAmountRegex, { message: "Invalid amount (max 2 decimals)" }),
})

export const addPaymentSchema = z.object({
    paymentName: z.string().min(1, "Required"),
    token: z.string().min(1, "Select a token"),
    totalAmount: z.string().min(1, "Required").regex(dollarAmountRegex, { message: "Invalid amount (max 2 decimals)" }),
    payees: z.array(payeeSchema),
    recurrence: z.enum(["Daily", "Weekly", "Monthly"]),
})

export type AddPaymentForm = z.infer<typeof addPaymentSchema>

export const invoiceSchema = z.object({
    tokenAddress: z.string().min(1, 'Token address is required'),
    amount: z.number().min(0.000001, 'Amount must be greater than 0.000001'),
    payeeEmail: z.string().email('Invalid email format'),
    invoiceName: z
        .string()
        .min(1, "Invoice Name is required")
        .max(50, "Invoice Name must not exceed 50 characters"),
    description: z.string().min(1, 'Description is required'),
    recurrence: z.enum(['one-time', 'weekly', 'monthly']).optional(),
    ccEmails: z.array(z.string().email('Invalid email format')).optional(),
    bccEmails: z.array(z.string().email('Invalid email format')).optional(),
    isActive: z.boolean().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
