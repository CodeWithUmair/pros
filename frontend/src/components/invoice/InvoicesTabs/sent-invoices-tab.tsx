"use client"

import type React from "react"
import Image from "next/image"
import { useUser } from "@/context/user-context"
import type { Invoice } from "@/types/invoices.types"
import StatusBadge from "@/components/layout/status-badge"

interface SentInvoicesTabProps {
  invoices: Invoice[]
}

const SentInvoicesTab: React.FC<SentInvoicesTabProps> = ({ invoices }) => {
  const { getAssetInfo } = useUser()

  return (
    <>
      {invoices.map((invoice) => {
        // Get image dynamically based on token address (currency)
        const imageSrc = getAssetInfo({ tokenAddress: invoice.lineItem.currency })?.image

        return (
          <div key={invoice._id} className="p-2 border-b last:border-b-none border-grey5 pb-5 overflow-hidden">
            <div className="flex sm:items-center gap-5 sm:gap-0 flex-col w-full sm:flex-row justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{invoice.invoiceName}</h3>
                  <StatusBadge value={invoice.status} />
                </div>
                <div className="flex text-sm items-end gap-1">
                  <p>To:</p>
                  <p className="text-sm text-muted-foreground">{invoice.payeeEmail}</p>
                </div>
                <p className="text-sm">{invoice.description}</p>
              </div>

              {/* Token Image and Amount */}
              <div className="flex justify-end sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  {imageSrc && (
                    <Image
                      src={imageSrc || "/placeholder.svg"}
                      alt={invoice.lineItem.symbol}
                      width={24}
                      height={24}
                      className="rounded-full"
                      layout="intrinsic"
                    />
                  )}
                  <span className="font-medium">{invoice.lineItem.symbol}</span>
                  {invoice.lineItem.amount}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default SentInvoicesTab
