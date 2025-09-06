// app/invoice/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

// Define form data
type FormData = {
    recipient: string;
    currency: string;
    amount: number;
};

export default function Invoice() {
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);
    const [modalData, setModalData] = useState<FormData | null>(null);

    const { register, control, handleSubmit, reset } = useForm<FormData>({
        defaultValues: { recipient: "", currency: "USDC", amount: 0 },
    });

    // Populate form from query params
    useEffect(() => {
        const recipient = searchParams.get("recipient") || "";
        const currency = (searchParams.get("currency") as string) || "USDC";
        const amountParam = searchParams.get("amount") || "0";
        const amount = Number(amountParam);

        reset({ recipient, currency, amount });
    }, [searchParams, reset]);

    // Handle 'Next' click: validate via API, then open modal
    const onNext = async (data: FormData) => {
        try {
            const res = await fetch("/api/validate-transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (res.ok && json.valid) {
                setModalData(data);
                setOpen(true);
            } else {
                alert(json.error || "Transaction validation failed");
            }
        } catch (err) {
            console.error(err);
            alert("Unable to validate transaction. Please try again.");
        }
    };

    // TODO: replace with real wallet context or API
    const senderAddress = "0xYourSenderAddressHere";
    const senderBalance = 1000; // placeholder

    const charges = 0.0;
    const total = modalData ? modalData.amount + charges : 0;

    const handlePayNow = () => {
        if (!modalData) return;
        // TODO: integrate payment API call here
        console.log("Pay Now with:", modalData);
        setOpen(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
            <form
                onSubmit={handleSubmit(onNext)}
                className="w-[750px] bg-background p-8 rounded-lg shadow"
            >
                <h2 className="text-2xl font-semibold mb-6">Invoice Details</h2>
                <div className="space-y-5">
                    {/* Recipient */}
                    <div>
                        <Label htmlFor="recipient">Recipient</Label>
                        <Input
                            id="recipient"
                            placeholder="Email or Solana Wallet"
                            {...register("recipient")}
                        />
                    </div>

                    {/* Currency */}
                    <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Controller
                            control={control}
                            name="currency"
                            render={({ field }) => (
                                <Select {...field}>
                                    <SelectTrigger id="currency">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["USDC", "USDT", "PYUSD"].map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="any"
                            {...register("amount", { valueAsNumber: true })}
                        />
                    </div>

                    {/* Next */}
                    <Button type="submit" className="w-full mt-4">
                        Next
                    </Button>
                </div>
            </form>

            {/* Confirmation Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Please review the details before proceeding.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <p>
                            <strong>From:</strong> {senderAddress}
                        </p>
                        <p>
                            <strong>To:</strong> {modalData?.recipient}
                        </p>
                        <p>
                            <strong>Balance:</strong> {senderBalance}
                        </p>
                        <p>
                            <strong>Amount:</strong> {modalData?.amount}
                        </p>
                        <p>
                            <strong>Charges:</strong> {charges.toFixed(2)}
                        </p>
                        <p>
                            <strong>Total:</strong> {total}
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handlePayNow}>Pay Now</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
