"use client";

import { useState } from "react";
import type React from "react";
import Image from "next/image";
import { useUser } from "@/provider/user-provider";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RecurringInvoice } from "@/types/invoices.types";
import apiClient from "@/lib/axiosClient";
import { useRouter } from "next/navigation";
import { formatNextExecutionDate } from "@/lib/utils";
import StatusBadge from "@/components/layout/status-badge";

interface RecurringInvoicesTabProps {
  invoices: RecurringInvoice[];
  fetchInvoice: () => void;
}

const RecurringInvoicesTab: React.FC<RecurringInvoicesTabProps> = ({
  invoices,
  fetchInvoice,
}) => {
  const { getAssetInfo } = useUser();
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleEdit = (id: string) => {
    console.log("Ahmed Raza");
    router.push(`/invoices/edit-invoice?id=${id}`);
    console.log("Edit invoice", id);
  };

  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (invoiceToDelete) {
      // Perform actual deletion
      console.log("Deleting invoice", invoiceToDelete);
      try {
        setLoading(true);

        await apiClient.delete(`/recurring-invoice/${invoiceToDelete}`);
        fetchInvoice();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
      setInvoiceToDelete(null);
    }
  };

  return (
    <>
      {invoices.map((invoice) => {
        const imageSrc = getAssetInfo({
          tokenAddress: invoice.lineItem.currency,
        })?.image;

        const nextDate = formatNextExecutionDate(invoice.nextExecutionDate);
        const createdAt = formatNextExecutionDate(invoice.createdAt);
        const lastDate = formatNextExecutionDate(invoice?.lastExecutionDate);

        return (
          <div
            key={invoice._id}
            className="p-2 border-b last:border-b-none border-grey5 pb-5 overflow-hidden"
          >
            <div className="flex sm:items-center gap-5 sm:gap-0 flex-col w-full sm:flex-row justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl">{invoice.invoiceName}</h3>
                  <StatusBadge value={invoice.isActive ? "Active" : "Inactive"} />

                </div>
                <p className="text-sm text-grey6">To : {invoice.payeeEmail}</p>
                <p className="text-sm flex items-center mt-5 gap-2">
                  Frequency :{" "}
                  <StatusBadge value={invoice.recurrence} />
                </p>
                <p className="text-sm text-muted-foreground">
                  {invoice.description}
                </p>

                <p className="text-sm text-muted-foreground">
                  Next Execution : {nextDate}
                </p>
                {invoice?.lastExecutionDate ? (
                  <p className="text-sm text-muted-foreground">
                    Last Execution : {lastDate}
                  </p>
                ) : null}
                <p className="text-sm text-muted-foreground">
                  Created At : {createdAt}
                </p>
              </div>
              <div className="flex justify-end sm: items-center gap-2">
                <div className="flex items-center gap-2">
                  {imageSrc && (
                    <Image
                      src={imageSrc || "/placeholder.svg"}
                      alt={invoice.lineItem.symbol}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <span className="font-medium">{invoice.lineItem.symbol}</span>
                  {invoice.lineItem.amount}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(invoice._id)}>
                      Update
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(invoice._id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        );
      })}

      {/* Confirmation Modal */}
      <Dialog
        open={invoiceToDelete !== null}
        onOpenChange={(open) => !open && setInvoiceToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete this recurring invoice? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 mt-6">
            <Button variant="destructive" onClick={handleConfirmDelete} loading={loading}>
              Delete Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecurringInvoicesTab;
