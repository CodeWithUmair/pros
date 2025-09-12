// InvoiceForm.tsx
'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormField,
} from "@/components/ui/form"; // ShadCN Form components
import { useMemo, useState } from "react";
import apiClient from "@/lib/axiosClient"; // Your axios client
import { Input } from '../ui/input';
import { NotifyError, NotifySuccess } from '../helper/common';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { InvoiceFormData, invoiceSchema } from '@/lib/zodFormSchema';
import Image from 'next/image';
import { useUser } from '@/context/user-context';
import EmailNotification from './EmailNotification';
import { useRouter } from 'next/navigation';

export default function InvoiceForm() {
    const [ccEmails, setCcEmails] = useState<string[]>([])
    const [bccEmails, setBccEmails] = useState<string[]>([])
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const { assets } = useUser();

    const form = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: { recurrence: "one-time" },
    })

    const { handleSubmit, watch, control, formState: { errors }, reset } = form

    const recurrence = watch("recurrence")

    const nextDate = useMemo(() => {
        const today = new Date()
        let next: Date

        if (recurrence === "weekly") {
            // find next Monday
            const dayOfWeek = today.getDay()           // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            const offset = (8 - dayOfWeek) % 7 || 7    // days until next Monday (always at least 1)
            next = new Date(today)
            next.setDate(today.getDate() + offset)
        } else {
            // Monthly: first day of next month
            next = new Date(today.getFullYear(), today.getMonth() + 1, 1)
        }

        return next.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        })
    }, [recurrence])

    const onSubmit = async (data: InvoiceFormData) => {
        setLoading(true);

        try {
            const formData = {
                ...data,
                recurrence: data.recurrence === 'one-time' ? undefined : data.recurrence,
                ccEmails: ccEmails.length ? ccEmails : undefined,
                bccEmails: bccEmails.length ? bccEmails : undefined,
            }

            // Send the payload to the appropriate API based on recurrence
            if (recurrence === "weekly" || recurrence === "monthly") {
                await apiClient.post("/recurring-invoice", formData) // Use recurring-invoice API
                NotifySuccess("Recurring Invoice added successfully");
                router.push(`/invoices`);

            } else {
                await apiClient.post("/invoice", formData) // Use regular invoice API
                NotifySuccess("Invoice added successfully");
                router.push(`/invoices`);
            }

            reset() // Reset form after successful submission
            setCcEmails([])
            setBccEmails([])
            router.push("/invoices");

        } catch (error: any) {
            // Extract API message safely
            const apiMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Something went wrong";

            NotifyError(apiMessage); // Pass to your UI notification
            console.error("API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <Card>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                            <FormField
                                name="invoiceName"
                                control={control}
                                render={({ field }) => (
                                    <FormItem className='border-b border-grey5'>
                                        <FormLabel>Invoice Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Name"
                                            />
                                        </FormControl>
                                        <FormMessage>{errors.invoiceName?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-end flex-col sm:flex-row w-full border-b border-grey5">
                                <FormField
                                    name="amount"
                                    control={control}
                                    render={({ field }) => (
                                        <FormItem className="w-full mb-5 sm:mb-0 sm:w-3/5 lg:w-4/5 sm:mr-2">
                                            <FormLabel>You Receive</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    placeholder="Amount"
                                                    onChange={(e) => {
                                                        // Convert the string value to a number before updating form state
                                                        field.onChange(Number(e.target.value));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage>{errors.amount?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    name="tokenAddress"
                                    control={control}
                                    render={({ field }) => (
                                        <FormItem className='w-full sm:w-2/5 lg:w-1/5'>
                                            {/* <FormLabel>Invoice Name</FormLabel> */}
                                            <FormControl>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Choose a token" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {assets?.map((asset) => (
                                                            <SelectItem key={asset.mint} value={asset.mint}>
                                                                <div className="flex items-center gap-2">
                                                                    <Image
                                                                        src={asset.image}
                                                                        alt={asset.symbol}
                                                                        className="w-5 h-5 rounded-full"
                                                                        width={20}
                                                                        height={20}
                                                                    />
                                                                    <span>{asset.symbol}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage>{errors.tokenAddress?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                name="payeeEmail"
                                control={control}
                                render={({ field }) => (
                                    <FormItem className='border-b border-grey5'>
                                        <FormLabel>Payee Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="abc@xyz.com"
                                            />
                                        </FormControl>
                                        <FormMessage>{errors.payeeEmail?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            {/* Email Notification */}
                            <EmailNotification
                                control={control}
                                ccEmails={ccEmails}
                                bccEmails={bccEmails}
                                setCcEmails={setCcEmails}
                                setBccEmails={setBccEmails}
                            />

                            {/* Recurrence */}
                            <FormField
                                name="recurrence"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className=''>
                                        <FormLabel>Recurrence</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}>
                                                <SelectTrigger className='w-48'>
                                                    <SelectValue placeholder="Select Recurrence" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="one-time">One Time Only</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.recurrence?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="description"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className='border-b border-grey5'>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Description" />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.description?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            {/* Conditionally render the Summary */}
                            {(recurrence === "weekly" || recurrence === "monthly") && (
                                <div className="p-4 border-input border-2 rounded-xl space-y-2">
                                    <div className="flex justify-between">
                                        <span>Next Payment On</span>
                                        <span className="font-medium">{nextDate}</span>
                                    </div>
                                </div>
                            )}

                            <br />

                            {/* Submit Button */}
                            <div className="mt-6">
                                <Button
                                    type="submit"
                                    loading={loading}
                                    disabled={loading}
                                    className='w-full'
                                >
                                    {loading ? 'Submitting...' : 'Add Invoice'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
