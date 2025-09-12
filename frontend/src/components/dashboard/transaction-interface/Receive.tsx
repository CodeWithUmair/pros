"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useUser } from "@/context/user-context"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import CryptoJS from "crypto-js"
import { ENCRYPTION_SECRET, FRONTEND_URL } from "@/config"
import { useState } from "react"
import Image from "next/image"
import LinkGenerated from "@/components/modals/LinkGenerated.modal"
import { NotifySuccess } from "@/components/helper/common"
import { useUserAuth } from "@/hooks/useUserAuth"
import { useRouter } from "next/navigation"

// Define the Zod schema for form validation (excluding recipientEmail)
const receiveFundsSchema = z.object({
    tokenAddress: z.string().min(1, { message: "Token address is required" }),
    amount: z.string().min(1, { message: "Amount is required" }).regex(/^\d*\.?\d+$/, { message: "Invalid amount format" }),
    description: z.string().min(1, { message: "Description is required" }),
    recipientEmail: z.string().email(),
})

type ReceiveFunds = z.infer<typeof receiveFundsSchema>

export default function Receive() {
    // Set up react-hook-form with Zod validation

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [encryptedData, setEncryptedData] = useState<string>("")
    const [previewData, setPreviewData] = useState<{
        amount: string
        tokenAddress: string
        recipientEmail: string
    } | null>(null);

    const isLoggedIn = useUserAuth();
    const router = useRouter();
    const { assets, user } = useUser();

    const form = useForm<ReceiveFunds>({
        resolver: zodResolver(receiveFundsSchema),
        mode: "onChange",
        defaultValues: {
            tokenAddress: "",
            amount: "",
            description: "",
            recipientEmail: user?.email || "",
        },
    })

    const { handleSubmit, formState: { errors, isValid, isSubmitting }, control } = form

    // Encrypt the form data and trigger the dialog with the success message
    const onSubmit = async (data: ReceiveFunds) => {
        if (!isLoggedIn) {
            router.push("/auth/login");
            return;
        }

        const recipientData = {
            tokenAddress: data.tokenAddress!,
            amount: data.amount!,
            recipientEmail: user.email,  // Use the logged-in user's email
            description: data.description!,
        }

        // Encrypt the data
        const encryptedData = CryptoJS.AES.encrypt(
            JSON.stringify(recipientData),
            ENCRYPTION_SECRET
        ).toString()

        // Set the encrypted data state
        const link = `${FRONTEND_URL}/?recipientData=${encodeURIComponent(encryptedData)}`;
        setEncryptedData(link);

        // Open the dialog with success message
        setEncryptedData(link)
        setPreviewData({
            amount: data.amount,
            tokenAddress: data.tokenAddress,
            recipientEmail: user.email,
        })
        setIsDialogOpen(true);
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(encryptedData)
        NotifySuccess("Link Copied!")
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="w-full border-b border-grey5 flex-col gap-6 md:gap-1 md:flex-row flex items-end justify-between">

                        <div className="w-full md:w-4/6">
                            {/* Amount */}
                            <FormField
                                control={control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>You Receive</FormLabel>
                                        <FormControl>
                                            <Input className="text-3xl md:text-4xl 3xl:text-5xl h-14 xl:h-16" type="number" placeholder="0000" {...field} />
                                        </FormControl>
                                        <FormMessage>{errors.amount?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="w-full md:w-2/6">
                            {/* Token Address */}
                            <FormField
                                control={control}
                                name="tokenAddress"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        {/* <FormLabel>Token</FormLabel> */}
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
                                                                    className="w-4 h-4 rounded-full"
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
                    </div>

                    {/* Recipient Email (Non-editable) */}
                    <FormItem className="cursor-not-allowed border-b border-grey5">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input
                                disabled
                                type="email"
                                placeholder={user?.email || 'Recipient Email'}
                                value={user?.email || ''} // Make it controlled by setting the value prop
                            />
                        </FormControl>
                    </FormItem>

                    {/* Description */}
                    <FormField
                        control={control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="border-b border-grey5">
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Description" {...field} />
                                </FormControl>
                                <FormMessage>{errors.description?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={!isValid || isSubmitting} className="w-full py-6 text-xl">Receive Funds</Button>
                </form>
            </Form>

            <LinkGenerated
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                encryptedData={encryptedData}
                amount={previewData?.amount || ""}
                tokenSymbol={
                    assets.find((a) => a.mint === previewData?.tokenAddress)?.symbol || ""
                }
                recipientEmail={previewData?.recipientEmail || ""}
                onCopy={handleCopy}
            />
        </>
    )
}
