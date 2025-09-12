// InvoiceForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form"; // ShadCN Form components
import { useEffect, useMemo, useState } from "react";
import apiClient from "@/lib/axiosClient"; // Your axios client
import { Input } from "../ui/input";
import { NotifyError, NotifySuccess } from "../helper/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { type InvoiceFormData, invoiceSchema } from "@/lib/zodFormSchema";
import Image from "next/image";
import { useUser } from "@/context/user-context";
import { Switch } from "../ui/switch";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditInvoiceForm({ id }) {
  const [dataloading, setDataLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  const { assets } = useUser();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { recurrence: "weekly" },
  });
  const router = useRouter();
  const {
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
    setValue,
  } = form;

  const getUserDetailById = async () => {
    try {
      setDataLoading(true);
      const response = await apiClient.get(`/recurring-invoice/${id}`);
      const data = response.data;
      setInvoiceData(data);

      console.log("Data.invoiceName 😁😁😁😁😁", data.invoiceName);
      // Set form values from API response
      setValue("invoiceName", data.invoiceName);
      setValue("amount", data.lineItem.amount);
      setValue("tokenAddress", data.lineItem.currency);
      setValue("payeeEmail", data.payeeEmail);
      setValue("recurrence", data.recurrence);
      setValue("description", data.description);
      setValue("isActive", data.isActive);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      NotifyError("Failed to load invoice details");
    } finally {
      setDataLoading(false)
    }
  };

  useEffect(() => {
    if (id) {
      getUserDetailById();
    }
  }, [id]);

  const recurrence = watch("recurrence");

  const nextDate = useMemo(() => {
    if (!invoiceData) return "";

    const nextExecution = new Date(invoiceData.nextExecutionDate);

    return nextExecution.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [invoiceData]);

  const onSubmit = async (data: InvoiceFormData) => {
    setUpdateLoading(true);

    try {
      const formData = {
        amount: data.amount,
        payeeEmail: data.payeeEmail,
        tokenAddress: data.tokenAddress,
        description: data.description,
        recurrence: data.recurrence,
        isActive: data.isActive,
        invoiceName: data.invoiceName,
      };

      // Update the invoice using PUT request
      await apiClient.put(`/recurring-invoice/${id}`, formData);
      NotifySuccess("Invoice updated successfully");
      router.push(`/invoices?recurring`);
    } catch (error) {
      NotifyError("Error while updating invoice");
      console.error(error);
    } finally {
      setUpdateLoading(false);
    }
  };
    if (dataloading) {
    return <Loader2 className="animate-spin h-6 w-6 mx-auto mt-28" />
  }

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
                  <FormItem className="border-b border-grey5">
                    <FormLabel>Invoice Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Name" />
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
                    <FormItem className="w-full sm:w-2/5 lg:w-1/5">
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
                                    src={asset.image || "/placeholder.svg"}
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
                  <FormItem className="border-b border-grey5">
                    <FormLabel>Payee Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="abc@xyz.com" />
                    </FormControl>
                    <FormMessage>{errors.payeeEmail?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* Recurrence */}
              <FormField
                name="recurrence"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="border-b border-grey5">
                    <FormLabel>Recurrence</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Recurrence" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.recurrence?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="border-b border-grey5">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Description" />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.description?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                name="isActive"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between border-b border-grey5 pb-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <FormMessage>
                        {form.formState.errors.isActive?.message}
                      </FormMessage>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Display Next Payment Date */}
              {invoiceData && (
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
                  loading={updateLoading}
                  disabled={updateLoading}
                  className="w-full"
                >
                  {updateLoading ? "Updating..." : "Update Invoice"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
