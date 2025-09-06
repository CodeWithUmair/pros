"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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
import { useRouter } from 'next/navigation';
import { Switch } from "../ui/switch"

export const AddNewPaymentCard = () => {
  // const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"custom" | "equal">("custom");
  const [selectedPayee, setSelectedPayee] = useState({
    email: "",
    amount: 0,
  });

  const [allSelectedPayee, setAllSelectedPayee] = useState<Array<{ email: string; amount: number }>>([]);

  const router = useRouter()
  const { assets } = useUser();

  const form = useForm<AddPaymentForm>({
    resolver: zodResolver(addPaymentSchema),
    defaultValues: {
      paymentName: "",
      token: "",
      payees: [],
      recurrence: "Weekly",
    },
    mode: "onChange",
  });
  const { control, handleSubmit, watch } = form;

  const { payees, token } = watch();

  const { emails } = useAllEmails();
  const [inputItems, setInputItems] = useState<string[]>(emails);

  // Calculate total amount from allSelectedPayee array
  const totalAmount = allSelectedPayee.reduce((acc, payee) => acc + payee.amount, 0);

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

  // Update the selected payee state when the input fields change
  const handlePayeeEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPayee((prev) => ({
      ...prev,
      email: e.target.value,
    }));
  };

  const remove = (index: number) => {
    // Remove the payee from the array by filtering out the item at the given index
    setAllSelectedPayee((prev) => prev.filter((_, i) => i !== index));
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

  const onAddPayee = () => {
    const { email, amount } = selectedPayee; // Access the email and amount from selectedPayee state

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
      const payeesPayload = allSelectedPayee.map((p) => ({
        email: p.email,
        amount: p.amount
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
      const resp = await apiClient.post("/recurring-payments", payload);

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
      if (totalAmount <= 0) {
        setError("Total amount must be > 0");
        return;
      }
      if (allSelectedPayee.length === 0) {
        setError("At least one payee is required");
        return;
      }
    } else {
      // custom mode
      if (allSelectedPayee.length === 0) {
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
      defaultAmount = totalAmount;
      // map every field's email to the SAME amount
      payeesPayload = allSelectedPayee.map((p) => ({
        email: p.email,
        amount: defaultAmount,
      }));
    } else {
      paymentName = data.paymentName;
      sameAmountForAll = false;
      defaultAmount = 0;
      // map each field entry to its own amount
      payeesPayload = allSelectedPayee.map((p) => ({
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
      const resp = await apiClient.post("/recurring-payments", payload);
      console.log("✅ Created:", resp.data);
      NotifySuccess("Payment created successfully");
      router.push("/dashboard/payments");
      form.reset();
    } catch (err: any) {
      NotifyError("Error creating payment");
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const asset = assets?.find((a) => a.mint === token);

  return (
    <Card>
      <CardContent className="px-4 sm:px-6">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Payment Name */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-0 items-end">
              <FormField
                control={control}
                name="paymentName"
                render={({ field }) => (
                  <FormItem className="border-b w-full md:w-3/5 xl:w-4/5 border-grey5 mr-1">
                    <FormLabel>Payment Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="e.g. Payment 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="token"
                render={({ field }) => (
                  <FormItem className="border-b w-full md:w-2/5 mt-6 sm:mt-6 xl:w-1/5 border-grey5 col-span-1">
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
                  </FormItem>
                )}
              />
            </div>

            {/* Div for Equal vs Custom */}
            <div
              className="space-y-4 border-2 p-4 border-dashed rounded-2xl"
            >
              <div className="w-fit flex items-center justify-between gap-4">
                <FormLabel>Same amount for all</FormLabel>
                <Switch
                  className="cursor-pointer text-primary"
                  checked={mode === "equal"}
                  onCheckedChange={handleModeChange}
                />
              </div>

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
                          // onClick={() => remove(i)}
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
                <FormItem className="">
                  <FormLabel>Recurrence</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
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
                <span>Payment will be sent on</span>
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
                disabled={allSelectedPayee.length === 0}
              >
                Add Payment
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card >
  );
};

export default AddNewPaymentCard;
