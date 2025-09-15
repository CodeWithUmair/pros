"use client";

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowDownFromLine, ArrowUpFromLine } from 'lucide-react'
import React from 'react'
import { Send } from './Send'
import Receive from './Receive'
import { useUser } from '@/provider/user-provider'
import { useUserAuth } from '@/hooks/useUserAuth';

const TransactionInterface = () => {

  const { invoiceData } = useUser();
  const isLoggedIn = useUserAuth();

  return (
    <Card className="p-6 xl:col-span-4">
      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="send">
            <ArrowUpFromLine className="mr-2 h-4 w-4" />
            Send
          </TabsTrigger>
          <TabsTrigger value="receive" disabled={!isLoggedIn}>
            <ArrowDownFromLine className="mr-2 h-4 w-4" />
            Receive
          </TabsTrigger>
          {/* <TabsTrigger value="buy">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy
                    </TabsTrigger>
                    <TabsTrigger value="sell">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Sell
                    </TabsTrigger> */}
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <Send invoiceData={invoiceData} />
        </TabsContent>

        <TabsContent value="receive">
          <Receive />
        </TabsContent>

        {/* <TabsContent value="buy">
                    <div className="flex items-center justify-center h-64">
                        <p className="text-grey6">Buy functionality would go here</p>
                    </div>
                </TabsContent>

                <TabsContent value="sell">
                    <div className="flex items-center justify-center h-64">
                        <p className="text-grey6">Sell functionality would go here</p>
                    </div>
                </TabsContent> */}
      </Tabs>
    </Card>
  );
};

export default TransactionInterface;

export function ShareButton({ icon }: { icon: React.ReactNode }) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-md h-12 w-12 border-grey1"
    >
      {icon}
    </Button>
  );
}
