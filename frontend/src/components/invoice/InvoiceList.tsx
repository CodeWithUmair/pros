"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Search, Loader2, RefreshCcw, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { Invoice, RecurringInvoice } from "@/types/invoices.types";
import SentInvoicesTab from "./InvoicesTabs/sent-invoices-tab";
import ReceivedInvoicesTab from "./InvoicesTabs/received-invoices-tab";
import RecurringInvoicesTab from "./InvoicesTabs/recurring-invoices-tab";

const InvoiceList = () => {
  const [sentInvoices, setSentInvoices] = useState<Invoice[]>([]);
  const [receiveInvoices, setReceiveInvoices] = useState<Invoice[]>([]);
  const [recurringInvoices, setRecurringInvoices] = useState<
    RecurringInvoice[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [sendResponse, receiveResponse, recurringResponse] =
        await Promise.all([
          apiClient.get("/invoice"),
          apiClient.get("/invoice/receive"),
          apiClient.get("/recurring-invoice"),
        ]);

      // Update to handle the correct response structure
      setSentInvoices(sendResponse.data);
      setReceiveInvoices(receiveResponse.data);
      setRecurringInvoices(recurringResponse.data.data); // Note the nested data property
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching invoices", error);
      setError("Error fetching data");
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSortChange = (value: string) => {
    // Handle sorting logic
    console.log("Sort invoice", value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleRefresh = () => {
    fetchInvoices();
  };

  // Filter invoices based on search query
  const filteredSendInvoices = sentInvoices.filter((invoice) =>
    invoice.payeeEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReceiveInvoices = receiveInvoices.filter((invoice) =>
    invoice.payeeEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecurringInvoices = recurringInvoices.filter((invoice) =>
    invoice.payeeEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select onValueChange={handleSortChange}>
            <SelectTrigger className="w-32 text-base">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="primaryOutline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh invoices"
          >
            <RefreshCcw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        <div className="relative">
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search By Email"
          />
          <Search className="absolute top-[20%] right-5" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading invoices...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <p className="text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      ) : filteredRecurringInvoices.length === 0 &&
        filteredSendInvoices.length === 0 &&
        filteredReceiveInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No invoices found</p>
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-4">
            <Tabs defaultValue="send" className="w-full">
              <TabsList className="grid sm:grid-cols-2 md:grid-cols-3 mb-6">
                <TabsTrigger value="send">Send</TabsTrigger>
                <TabsTrigger value="receive">Receive</TabsTrigger>
                <TabsTrigger value="recurrunce">Recurrunce Invoice</TabsTrigger>
              </TabsList>

              <Separator className="block md:hidden" />

              <TabsContent value="send" className="space-y-6">
                <SentInvoicesTab invoices={filteredSendInvoices} />
              </TabsContent>

              <TabsContent value="receive">
                <ReceivedInvoicesTab invoices={filteredReceiveInvoices} />
              </TabsContent>

              <TabsContent value="recurrunce">
                <RecurringInvoicesTab
                  invoices={filteredRecurringInvoices}
                  fetchInvoice={fetchInvoices}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvoiceList;
