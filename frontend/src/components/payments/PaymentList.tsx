"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/axiosClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MoreVertical, Search, Loader2 } from "lucide-react"; // Importing the loader spinner
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "../ui/switch";
import StatusBadge from "../layout/status-badge";

interface Payee {
  email: string;
  amount: number;
  walletAddress: string;
}

interface RecurringPayment {
  _id: string;
  paymentName: string;
  stablecoin: string;
  sameAmountForAll: boolean;
  defaultAmount: number;
  payees: Payee[];
  recurrence: string;
  nextExecutionDate: string;
  isActive: boolean;
  createdAt: string;
  lastExecutionDate?: string;
}

const PaymentList = () => {
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [deleteloading, setSeleteLoading] = useState<boolean>(false); // Loading state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<Record<string, boolean>>({});
  const router = useRouter();

  // Fetch data on component mount
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true); // Set loading to true while fetching data
      try {
        const response = await apiClient.get("/recurring-payments");
        setPayments(response.data);
      } catch (error) {
        console.error("Error fetching payments", error);
      } finally {
        setLoading(false); // Set loading to false after the fetch completes
      }
    };

    fetchPayments();
  }, []);

  const handleEdit = (id: string) => {
    console.log("Edit payment", id);
    router.push(`/dashboard/payments/edit?id=${id}`);
  };

  const confirmDelete = async () => {
    setSeleteLoading(true);
    if (!deleteId) return;
    try {
      await apiClient.delete(`/recurring-payments/${deleteId}`);
      // remove it from state
      setPayments((all) => all.filter((p) => p._id !== deleteId));
    } catch (e) {
      console.error(e);
    } finally {
      setSeleteLoading(false);
      setIsDialogOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    console.log("Delete payment", id);
    setDeleteId(id);
    console.log(deleteId);
    setIsDialogOpen(true);
  };

  const handleSortChange = (id: string) => {
    // Handle sorting logic
    console.log("Sort payment", id);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredPayments = payments.filter((payment) =>
    payment.payees.some((payee) =>
      payee.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setIsToggling((prev) => ({ ...prev, [id]: true }));
      await apiClient.patch(`/recurring-payments/${id}/toggle`);

      // Update the payment status in the local state
      setPayments(
        payments.map((payment) =>
          payment._id === id
            ? { ...payment, isActive: !currentStatus }
            : payment
        )
      );
    } catch (err) {
      console.error("Error toggling payment status:", err);
      // You can add error notification here if you have a notification system
    } finally {
      setIsToggling((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
        {/* <Select onValueChange={handleSortChange}>
          <SelectTrigger className="w-32 text-base">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select> */}
        <div className="s"></div>

        <div className="relative">
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search By Email"
          />
          <Search className="absolute h-5 w-5 top-[25%] right-4" />
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin text-grey6" size={32} />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center text-lg text-muted-foreground">
          No payments found.
        </div>
      ) : (
        <Card>
          <CardContent className="px-4 sm:px-6 space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment._id} className="flex border-b border-grey5 pb-5 flex-col gap-6 sm:gap-0 sm:flex-row justify-between sm:items-center">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-xl font-semibold mr-2">
                      {payment.paymentName}
                    </h3>
                    <StatusBadge value={payment.isActive ? "Active" : "Inactive"} />
                  </div>
                  <p className="text-sm text-grey6 my-2">
                    Next Payment on{" "}
                    {new Date(payment.nextExecutionDate).toLocaleDateString()}
                  </p>

                  {payment?.lastExecutionDate && (
                    <p className="text-sm text-grey6 my-2">
                      Next Payment on{" "}
                      {new Date(
                        payment.nextExecutionDate
                      ).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm mt-5">
                    Frequency :{" "}
                    <StatusBadge value={payment.recurrence} />
                  </p>
                </div>

                <div className="flex justify-end items-center gap-3">
                  <Switch
                    id={`payment-status-${payment._id}`}
                    checked={payment.isActive}
                    disabled={isToggling[payment._id]}
                    onCheckedChange={() =>
                      handleToggleStatus(payment._id, payment.isActive)
                    }
                  />
                  {/* Dropdown menu for actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEdit(payment._id)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(payment._id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* <div className="mt-3 space-y-2">
                    {payment.payees.map((payee, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <p>{payee.email}</p>
                        <p>
                          {payee.amount} {payment.stablecoin}
                        </p>
                      </div>
                    ))}
                  </div> */}
              </div>


            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Are you sure?</DialogTitle>
            <DialogDescription className="text-center">
              This will permanently delete this recurring payment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="destructive"
              loading={deleteloading}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentList;
