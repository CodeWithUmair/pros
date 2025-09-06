"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCombobox } from "downshift";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AddPaymentForm, addPaymentSchema } from "@/lib/zodFormSchema";
import { Plus, X } from "lucide-react";
import { useUser } from "@/context/user-context";
import Image from "next/image";
import apiClient from "@/lib/axiosClient";
import { NotifyError, NotifySuccess } from "@/components/helper/common";
import { useAllEmails } from "@/hooks/useEmailSuggestions";
import { Switch } from "../ui/switch";

export const EditPaymentCard = ({ id, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"custom" | "equal">("custom");
  const [isActive, setIsActive] = useState<boolean>(
    initialData?.isActive ?? true
  );
  const [sameAmountForAll, setSameAmountForAll] = useState<boolean>(
    initialData?.sameAmountForAll
  );
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const { assets } = useUser();
  const currentPayees = initialData?.payees ?? [];
  const currentStablecoin = initialData?.stablecoin ?? "";

  const [selectedPayee, setSelectedPayee] = useState({
    email: "",
    amount: 0,
  });

  const [allSelectedPayee, setAllSelectedPayee] = useState<Array<{ email: string; amount: number }>>([]);

  const totalAmount = allSelectedPayee.reduce((acc, payee) => acc + payee.amount, 0);

  const form = useForm<AddPaymentForm>({
    resolver: zodResolver(addPaymentSchema),
    defaultValues: {
      paymentName: initialData?.paymentName || "",
      token: initialData?.stablecoin || "",
      payees: [],
      recurrence: initialData?.recurrence || "weekly",
    },
    mode: "onChange",
  });
  const { control, handleSubmit, watch, resetField } = form;
  const { fields, append } = useFieldArray({ name: "payees", control });

  const { token } = watch();
  const { emails } = useAllEmails();
  const [inputItems, setInputItems] = useState<string[]>(emails);

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
  } = useCombobox({
    items: inputItems,
    itemToString: (item) => item ?? "",
    // When the user types:
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        emails.filter((e) =>
          e.toLowerCase().includes(inputValue?.toLowerCase() ?? "")
        )
      );
      // Set the typed value in the selectedPayee state
      setSelectedPayee((prev) => ({
        ...prev,
        email: inputValue ?? "", // Set the email value in selectedPayee state
      }));

      // If you want to clear the inputItems array (e.g., after typing), you can do so like this:
      if (!inputValue) {
        setInputItems([]); // Clear inputItems when inputValue is empty
      }
    },
    // When they select an item:
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        // Set the selected email to selectedPayee state
        setSelectedPayee((prev) => ({
          ...prev,
          email: selectedItem, // Update email in selectedPayee state
        }));

        // Clear inputItems when an item is selected
        setInputItems([]);
      }
    },
  });

  const handleModeChange = (checked: boolean) => {
    // Switch between "custom" and "equal" based on the checked state
    setMode(checked ? "equal" : "custom");
  };

  const remove = (index: number) => {
    // Remove the payee from the array by filtering out the item at the given index
    setAllSelectedPayee((prev) => prev.filter((_, i) => i !== index));
  };

  // Update the selected payee state when the input fields change
  const handlePayeeEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPayee((prev) => ({
      ...prev,
      email: e.target.value,
    }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Parse the number and ensure it's greater than or equal to 0.00001
    const parsedValue = parseFloat(value);

    // If parsedValue is not a valid number or is less than 0.00001, do not update
    if (!isNaN(parsedValue) && parsedValue >= 0.00001) {
      setSelectedPayee((prev) => ({
        ...prev,
        amount: parsedValue,
      }));
    } else if (value === "") {
      // Allow empty input and set to 0 or leave it as is
      setSelectedPayee((prev) => ({
        ...prev,
        amount: 0,
      }));
    }
  };

  useEffect(() => {
    if (!initialData) return;

    // for (let i = fields.length - 1; i >= 0; i--) {
    //   remove(i);
    // }

    // setMode(initialData.sameAmountForAll ? "equal" : "custom");

    // initialData.payees.forEach((payee) =>
    //   append({ email: payee.email, amount: payee.amount })
    // );
  }, [initialData, fields]);

  const onAddPayee = () => {
    const { email, amount } = selectedPayee; // Access the email and amount from selectedPayee state
    // console.log("🚀 ~ onAddPayee ~ email:", email);
    // console.log("🚀 ~ onAddPayee ~ amount:", amount);

    // Check if required selectedPayees are filled out
    if (!token) {
      NotifyError("Please select a currency token.");
      return;
    }

    // Check if required selectedPayees are filled out
    if (!email) {
      NotifyError("Please add an email");
      return;
    }

    // Check if required selectedPayees are filled out
    if (!amount) {
      NotifyError("Amount is required");
      return;
    }

    // Check if the email is in the approved list
    if (!emails.includes(email)) {
      NotifyError("That email isn’t in the approved list.");
      return;
    }

    // Check for duplicate payee
    if (allSelectedPayee.some((p) => p.email === email)) {
      NotifyError("Payee already exists.");
      return;
    }

    // Insert at index 0 so it shows at the top
    const newFields = [{ email, amount: Number(amount) }, ...allSelectedPayee]; // Ensure amount is a number

    // if (mode === "equal") {
    //   newFields = allSelectedPayee.map((item) => ({
    //     ...item,
    //     amount: amount.toString(), // Convert amount to string
    //   }));
    // }

    // Update the allSelectedPayee state with the new list of payees
    setAllSelectedPayee(newFields as Array<{ email: string; amount: number }>);

    // Reset the selectedPayee state (clear input values)
    setSelectedPayee({ email: "", amount: 0 }); // Reset selectedPayee state
    setInputItems([])
  };

  // Totals
  // const totalCalc = useMemo(
  //   () => payees.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0),
  //   [payees]
  // );

  const recurrence = watch("recurrence"); // 'Weekly' or 'Monthly'

  const nextDate = useMemo(() => {
    const today = new Date();
    let next: Date;

    if (recurrence === "Weekly") {
      // find next Monday
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const offset = (8 - dayOfWeek) % 7 || 7; // days until next Monday (always at least 1)
      next = new Date(today);
      next.setDate(today.getDate() + offset);
    } else {
      // Monthly: first day of next month
      next = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    }

    return next.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [recurrence]);

  const onSubmit = async (data: AddPaymentForm) => {
    setError(null);
    setLoading(true);
    try {
      // 1️⃣ Map your form’s payees to the minimal DTO shape:
      const payeesPayload = fields.map((p) => ({
        email: p.email,
        amount: parseFloat(p.amount),
      }));

      // 2️⃣ Determine sameAmountForAll & defaultAmount:
      //    (Here we assume custom amounts, so sameAmountForAll = false)
      const sameAmountForAll = false;
      const defaultAmount = 0;

      // 3️⃣ Build the full payload:
      const payload = {
        stablecoin: token, // e.g. "USDC"
        sameAmountForAll,
        defaultAmount,
        payees: payeesPayload,
        recurrence: watch("recurrence").toLowerCase() as "weekly" | "monthly",
      };

      // 4️⃣ Call your API (adjust URL as needed):
      const resp = await apiClient.put(`/recurring-payments/${id}`, payload);

      console.log("✅ Created:", resp.data);
      // TODO: maybe reset form or navigate away
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const data = form.getValues();
    setError(null);

    // 1️⃣ Always check name & token
    if (!data.paymentName.trim()) {
      setError("Payment name is required");
      return;
    }
    if (!data.token) {
      setError("Please select a token");
      return;
    }

    // 2️⃣ Mode‑specific guards
    if (mode === "equal") {
      if (!data.totalAmount || Number(data.totalAmount) <= 0) {
        setError("Total amount must be > 0");
        return;
      }
      if (fields.length === 0) {
        setError("At least one payee is required");
        return;
      }
    } else {
      // custom mode
      if (fields.length === 0) {
        setError("At least one payee is required");
        return;
      }
      if (totalAmount <= 0) {
        setError("Sum of payee amounts must be > 0");
        return;
      }
    }

    // 3️⃣ Build payeesPayload correctly
    let paymentName: string;
    let sameAmountForAll: boolean;
    let defaultAmount: number;
    let payeesPayload: Array<{ email: string; amount: number }>;

    if (mode === "equal") {
      paymentName = data.paymentName;
      sameAmountForAll = true;
      defaultAmount = Number(data.totalAmount);
      // map every field's email to the SAME amount
      payeesPayload = fields.map((p) => ({
        email: p.email,
        amount: defaultAmount,
      }));
    } else {
      paymentName = data.paymentName;
      sameAmountForAll = false;
      defaultAmount = 0;
      // map each field entry to its own amount
      payeesPayload = fields.map((p) => ({
        email: p.email,
        amount: Number(p.amount),
      }));
    }

    // 4️⃣ Final payload
    const payload = {
      paymentName,
      stablecoin: asset?.symbol ?? data.token,
      sameAmountForAll,
      defaultAmount,
      payees: payeesPayload,
      recurrence: data.recurrence.toLowerCase() as "weekly" | "monthly",
    };

    console.log("▶️ Sending payload:", payload);

    // 5️⃣ API call
    setLoading(true);
    try {
      const resp = await apiClient.put(`/recurring-payments/${id}`, payload);
      console.log("✅ Created:", resp.data);
      NotifySuccess("Payment Updated Successfully");
      form.reset();
    } catch (err: any) {
      NotifyError("Error creating payment");
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const asset = assets?.find((a) => a.mint === token);

  const handleToggleStatus = async () => {
    try {
      setIsToggling(true);
      const newStatus = !isActive;
      await apiClient.patch(`/recurring-payments/${id}/toggle`);
      setIsActive(newStatus);
      NotifySuccess(
        `Payment ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      console.error("Error toggling payment status:", err);
      NotifyError("Failed to update payment status");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card>
      <CardContent className="px-2 sm:px-6">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Payment Name */}
            <FormField
              control={control}
              name="paymentName"
              render={({ field }) => (
                <FormItem className="border-b border-grey5">
                  <FormLabel>Payment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Payment 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4 items-center pt-2 border-t border-border/50">
              <span>Payment Status</span>
              <div className="flex items-center gap-2">
                <Switch
                  id="payment-status"
                  checked={isActive}
                  onCheckedChange={handleToggleStatus}
                  disabled={isToggling}
                />
                <label
                  htmlFor="payment-status"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {isActive ? "Active" : "Inactive"}
                </label>
              </div>
            </div>
            <div className="flex gap-4 items-center pt-2 border-t border-border/50">
              <span>Same Amount For All</span>
              <div className="flex items-center gap-2">
                <Switch
                  id="payment-status"
                  checked={mode === "equal"}
                  onCheckedChange={handleModeChange}
                // disabled={isToggling}
                />
                <label
                  htmlFor="payment-status"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {isActive ? "Active" : "Inactive"}
                </label>
              </div>
            </div>

            <div className="space-y-2 col-span-full row-start-2 mt-6">
              <FormLabel>Current Payees</FormLabel>
              {currentPayees
                .slice()
                .reverse()
                .map((p, i) => {
                  const asset = assets?.find(
                    (a) => a.symbol === currentStablecoin
                  );
                  return (
                    <div
                      key={i}
                      className="flex relative justify-between items-center p-2 border rounded flex-col sm:flex-row"
                    >
                      <span className="font-medium">{p.email}</span>
                      <div className="sm:flex items-center hidden space-x-4">
                        <span className="flex items-center gap-1">
                          {asset ? (
                            <>
                              <Image
                                src={asset.image}
                                alt={asset.symbol}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                              <strong>{asset.symbol}</strong>
                            </>
                          ) : (
                            <strong>{token}</strong>
                          )}{" "}
                          {p.amount}
                        </span>
                        <Button
                          type="button"
                          variant="ghostDestructive"
                          size="icon"
                          onClick={() => remove(i)}
                        >
                          <X />
                        </Button>
                      </div>

                      {/* This Button is show in mobile */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(i)}
                        className="absolute size-5 -top-3 -right-3 rounded-full sm:hidden block"
                      >
                        <X />
                      </Button>
                    </div>
                  );
                })}
            </div>

            {/* Div for Equal vs Custom */}
            <div
              className="space-y-4 border-2 p-4 border-dashed rounded-2xl"
            >
              {/* <div className="w-1/2 flex items-center justify-between gap-4">
                <FormLabel>Same amount for all</FormLabel>
                <Switch
                  className="cursor-pointer text-primary"
                  checked={mode === "equal"}
                  onCheckedChange={handleModeChange}
                />
              </div> */}

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 space-x-1 gap-8 md:gap-0 items-end">

                <div className="border-b border-grey5 md:col-span-2 lg:col-span-1">
                  <FormLabel>Amount</FormLabel>
                  <Input
                    type="number"
                    className="text-2xl"
                    placeholder="0.00"
                    value={selectedPayee.amount} // Bind amount value
                    onChange={handleAmountChange} // Update the amount state
                  />
                </div>

                <div className="col-span-full border-b md:mt-6 mr-5 border-grey5 lg:col-span-3">
                  <FormLabel>To Email</FormLabel>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="email@domain.com"
                      value={selectedPayee.email} // Bind email value
                      onChange={handlePayeeEmailChange} // Update the email state
                      {...getInputProps({
                        onKeyDown: (e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            onAddPayee();
                          }
                        },
                      })}
                    />
                    <ul
                      {...getMenuProps()}
                      className={`absolute z-10 w-full bg-card text-foreground border mt-1 max-h-40 overflow-auto ${!isOpen ? "hidden" : ""}`}
                    >
                      {isOpen &&
                        inputItems.map((item, index) => (
                          <li
                            key={item}
                            {...getItemProps({ item, index })}
                            className={`px-2 py-1 cursor-pointer ${highlightedIndex === index
                              ? "bg-muted"
                              : ""
                              }`}
                          >
                            {item}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={onAddPayee}
                >
                  <Plus />
                  Add Payee
                </Button>
              </div>

              <div className="space-y-3 mt-10">
                {[...allSelectedPayee]
                  .slice()
                  .reverse()
                  .map((p, i) => {
                    const asset = assets?.find((a) => a.mint === token);
                    return (
                      <div
                        key={i}
                        className="flex relative justify-between items-center p-2 border rounded flex-col sm:flex-row"
                      >
                        <span className="font-medium">{p.email}</span>
                        <div className="sm:flex items-center hidden space-x-4">
                          <span className="flex items-center gap-1">
                            {asset ? (
                              <>
                                <Image
                                  src={asset.image}
                                  alt={asset.symbol}
                                  width={20}
                                  height={20}
                                  className="rounded-full"
                                />
                                <strong>{asset.symbol}</strong>
                              </>
                            ) : (
                              <strong>{token}</strong>
                            )}{" "}
                            {p.amount}
                          </span>
                          <Button
                            type="button"
                            variant="ghostDestructive"
                            size="icon"
                            onClick={() => remove(i)}
                          >
                            <X />
                          </Button>
                        </div>

                        {/* This Button is show in mobile */}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => remove(i)}
                          className="absolute size-5 -top-3 -right-3 rounded-full sm:hidden block"
                        >
                          <X />
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </div>

            <FormField
              control={control}
              name="recurrence"
              render={({ field }) => (
                <FormItem className="border-b border-grey5">
                  <FormLabel>Recurrence</FormLabel>
                  <FormControl>
                    <Select defaultValue={initialData?.recurrence} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-40">
                        {/* you can provide a placeholder if you like */}
                        <SelectValue placeholder="Weekly" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            <div className="p-4 bg-muted rounded space-y-2">
              <div className="flex justify-between">
                <span>Next Payment On</span>
                <span className="font-medium">{nextDate}</span>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {/* Actions */}
            <div className="flex space-x-4">
              <Button
                type="button"
                onClick={handleCreate}
                loading={loading}
                className="w-full"
              // disabled={fields.length === 0}
              >
                Update Payment
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditPaymentCard;
