"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUser } from "@/provider/user-provider";
import apiClient from "@/lib/axiosClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ENCRYPTION_SECRET } from "@/config";
import CryptoJS from "crypto-js";
import ConfirmTransaction from "@/components/modals/ConfirmTransaction.modal";
import ErrorOrSuccessModal from "@/components/modals/ErrorOrSuccess.modal";
import { NotifyError, NotifySuccess } from "@/components/helper/common";
import { Asset, InvoiceData } from "@/types/user.types";
import { useUserAuth } from "@/hooks/useUserAuth";
import { demoAssets } from "./mock-data";
import CustomSelect from "@/components/ui/custom-select";

// Define the Zod schema for form validation
const sendFundsSchema = z.object({
  tokenAddress: z.string().min(1, { message: "Token address is required" }),
  amount: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .pipe(
      z
        .number()
        .min(0.000001, { message: "Amount must be ≥ 0.000001" })
        .max(Number.POSITIVE_INFINITY)
        .finite()
    ),
  recipientEmail: z.string().email({ message: "Invalid email address" }),
  description: z.string().min(1, { message: "Description is required" }),
});

type SendFunds = z.infer<typeof sendFundsSchema>;

export function Send({ invoiceData }: { invoiceData: InvoiceData | null }) {
  // Set up react-hook-form with Zod validation
  const params = useSearchParams();
  const {
    assets: assetsFromCtx = [],
    getAssetInfo,
    isPublicHome,
    pathname,
    refetch
  } = useUser();
  const assets: Asset[] = Array.isArray(assetsFromCtx)
    ? assetsFromCtx
    : demoAssets;

  const isLoggedIn = useUserAuth();
  const router = useRouter();

  const [previewData, setPreviewData] = useState<SendFunds | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [successOpen, setSuccessOpen] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [decryptedData, setDecryptedData] = useState<SendFunds | null>(null);
  // const [decryptedDatacounter, setDecryptedDataCounter] = useState(0);
  // console.log("🚀 ~ Send ~ decryptedData:", decryptedData)

  const [errorOpen, setErrorOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const initialAmount = decryptedData?.amount || invoiceData?.lineItem.amount;

  const initialValues = {
    amount: initialAmount || undefined,
    description: decryptedData?.description || invoiceData?.description || "",
    tokenAddress:
      decryptedData?.tokenAddress || invoiceData?.lineItem.currency || "",
    recipientEmail:
      decryptedData?.recipientEmail || invoiceData?.creatorId.email || "",
  };

  const form = useForm<SendFunds>({
    resolver: zodResolver(sendFundsSchema),
    mode: "onSubmit",
    defaultValues: initialValues,
    reValidateMode: "onChange",
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid, isSubmitting },
    control,
  } = form;

  const onPreview = (formData: SendFunds) => {
    console.log("🚀 ~ onPreview ~ formData:", formData)
    if (!isLoggedIn) {
      if (isPublicHome) {
        localStorage.setItem("pendingSendForm", JSON.stringify(formData));
      }
      router.push("/auth/login");
      return;
    }
    setPreviewData(formData);
    setConfirmOpen(true);
  };

  // on confirm → call API, then open success dialog
  const onConfirm = async () => {
    if (!previewData) return;
    const rawCipher = params.get("recipientData");

    const asset = getAssetInfo({ tokenAddress: previewData.tokenAddress });

    if (!asset) {
      NotifyError("Currency not found!!!");
      return;
    }
    setConfirmLoading(true);
    try {
      const amountSending = decryptedData?.amount || previewData.amount;

      if (amountSending == 0)
        throw new Error("Amount must be greater than zero");

      const payload = invoiceData?._id
        ? { invoiceId: invoiceData._id }
        : { ...previewData, amount: amountSending };

      await apiClient.post("/wallet/send-funds", payload);
      reset();
      const successMessage = `${asset.symbol} of ${amountSending} sent successfully to ${previewData.recipientEmail}`;
      NotifySuccess(successMessage);
      setConfirmOpen(false);
      setConfirmLoading(false);
      if (invoiceData?._id) router.push("/invoices?receive");
      if (rawCipher) router.push("/history");
      await refetch();
    } catch (err: any) {
      const errorMessage = `${err.response?.data?.message || err.message || "Something went wrong!!!"
        }`;
      NotifyError(errorMessage);
      // setErrorOpen(true)
      console.log(`Error: ${errorMessage}`);
    } finally {
      setConfirmLoading(false);
    }
  };

  // optional: handle “Add Beneficiary”
  const handleAddBeneficiary = async () => {
    if (!previewData) return;
    try {
      await apiClient.post("/beneficiaries", {
        email: previewData.recipientEmail,
        token: previewData.tokenAddress,
      });
      NotifySuccess("✅ Beneficiary added");
    } catch (e) {
      console.error(e);
      alert("Failed to add beneficiary");
    } finally {
      setSuccessOpen(false);
    }
  };

  useEffect(() => {
    if (pathname.startsWith("/")) {
      const raw = localStorage.getItem("pendingSendForm");
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          reset({
            tokenAddress: saved.tokenAddress || "",
            amount: saved.amount || "",
            recipientEmail: saved.recipientEmail || "",
            description: saved.description || "",
          });
          localStorage.removeItem("pendingSendForm");
        } catch {
          console.error("Invalid saved form data");
        }
      }
    }
  }, [pathname, reset]);

  // Send.tsx (decryption)
  useEffect(() => {
    const rawCipher = params.get("recipientData") || "";
    if (!rawCipher) return;

    const cipherText = decodeURIComponent(rawCipher);
    let decrypted = "{}";

    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_SECRET);
      decrypted = bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      NotifyError("Invalid Link");
      router.push("/");
      console.error("Decrypt error:", err);
    }

    const data = JSON.parse(decrypted) as Partial<SendFunds>;
    setDecryptedData(data);
    setValue("tokenAddress", data?.tokenAddress);
    setValue("amount", data?.amount);
    setValue("recipientEmail", data?.recipientEmail);
    setValue("description", data?.description);
  }, [params]);

  useEffect(() => {
    // Ensure form is reset when `data` is available
    if (invoiceData) {
      form.reset();

      const newData = {
        amount: invoiceData.lineItem.amount || 0,
        description: invoiceData.description || "",
        tokenAddress: invoiceData.lineItem.currency || "",
        recipientEmail: invoiceData.creatorId.email || "",
      };
      form.reset(newData);
    }
  }, [invoiceData, form]);

  useEffect(() => {
    // Ensure form is reset when `data` is available
    if (decryptedData) {
      const newData = {
        amount: parseFloat(String(decryptedData?.amount)),
        description: decryptedData?.description || "",
        tokenAddress: decryptedData?.tokenAddress || "",
        recipientEmail: decryptedData?.recipientEmail || "",
      };
      form.reset(newData);
    }
  }, [decryptedData, form]);

  const uniqueAssets = assets
    ? assets.filter(
      (a, index, self) => index === self.findIndex((b) => b.mint === a.mint)
    )
    : [];

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onPreview)}
        className="space-y-6 md:space-y-8"
      >
        <div className="w-full border-b border-grey5 flex-col gap-6 md:gap-1 md:flex-row flex items-end justify-between">
          <div className="w-full md:w-4/6">
            {/* Amount */}
            <FormField
              control={control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>You Send</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      className="text-3xl 3xl:text-5xl h-14 xl:h-16"
                      placeholder="0000"
                      {...field}
                    />
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
                  <FormControl>
                    <CustomSelect
                      assets={uniqueAssets}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage>{errors.tokenAddress?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Recipient Email */}
        <FormField
          control={control}
          name="recipientEmail"
          render={({ field }) => (
            <FormItem className="border-b border-grey5">
              <FormLabel>Recipient Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Recipient Email" {...field} />
              </FormControl>
              <FormMessage>{errors.recipientEmail?.message}</FormMessage>
            </FormItem>
          )}
        />

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

        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          // onClick={() => onPreview(form.getValues())}
          className="w-full py-6 text-xl"
        >
          {
            invoiceData?._id ? "Pay Invoice" : "Send"
          }
        </Button>
      </form>

      <ConfirmTransaction
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        amount={decryptedData?.amount || previewData?.amount || null}
        tokenSymbol={
          assets.find((a) => a.mint === previewData?.tokenAddress)?.symbol || ""
        }
        recipientEmail={previewData?.recipientEmail || ""}
        loading={confirmLoading}
        onConfirm={onConfirm}
      />

      <ErrorOrSuccessModal
        open={successOpen || errorOpen} // Use either successOpen or errorOpen
        onOpenChange={(open) => {
          setSuccessOpen(open);
          setErrorOpen(open);
        }}
        type={errorOpen ? "error" : "success"} // Determine the modal type based on the state
        amount={previewData?.amount}
        tokenSymbol={
          assets.find((a) => a.mint === previewData?.tokenAddress)?.symbol || ""
        }
        recipientEmail={previewData?.recipientEmail ?? ""}
        message={errorMessage} // Pass an error message if the type is 'error'
        onAddBeneficiary={handleAddBeneficiary}
      />
    </Form>
  );
}
