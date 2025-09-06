import React from 'react'
import Image from 'next/image'

export type AssetItemProps = {
    icon: string
    name: string
    ticker: string
    amount: string
    value: string
}

export default function AssetItem({
    icon,
    name,
    ticker,
    amount,
    value,
}: AssetItemProps) {
    return (
        <div className="flex items-center justify-between border-b border-grey5 pb-4 last:border-b-0">
            <div className="flex items-center gap-3">
                <Image src={icon || "/placeholder.svg"} alt={name} width={32} height={32} className="rounded-full" />
                <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-xs text-grey6">{ticker}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-medium">{amount}</p>
                <p className="text-xs text-grey2">{value}</p>
            </div>
        </div>
    )
}
