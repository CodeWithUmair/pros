import formatDate from "@/components/helper";
import { ArrowDownFromLine, ArrowUpFromLine, DollarSign } from "lucide-react";
import React from "react";

type Props = {
    transactions: any[]; // Define your type based on the structure of transactions
};

const HistoryList = ({ transactions }: Props) => {
    if (transactions.length === 0) {
        return <p className="text-center">No transactions found.</p>;
    }

    return (
        <ul>
            {transactions && transactions.map((trx, index) => (
                <li key={index} className="border-b py-4 grid grid-rows-2 md:grid-rows-1 grid-cols-2 md:grid-cols-3">
                    <div className="flex items-center row-span-2 md:row-span-1 space-x-4">
                        <div>
                            {/* Displaying sender/recipient */}
                            <p className="flex flex-col gap-2">
                                <span className="text-grey2">{trx.tag === "sent" ? "To" : "From"}</span>
                                <span className="font-medium text-sm sm:text-base">{trx.tag === "sent" ? trx.recipientId.email : trx.senderId.email}</span>
                            </p>
                            <p className="text-[10px] sm:text-xs text-grey6">
                                {formatDate(trx.timestamp)}
                            </p>
                        </div>
                    </div>

                    {/* Displaying transaction status with colors */}
                    <div className="flex justify-end md:mx-auto self-center mb-3 col-start-2 row-start-1 row-span-1 md:row-span-1">
                        <div
                            className={`${trx.tag === "sent"
                                ? "bg-transparent border border-success text-success"
                                : trx.tag === "received"
                                    ? "bg-transparent border border-purple text-purple"
                                    : "bg-destructive/50 text-background"
                                } px-4 py-1 rounded-full w-fit text-sm sm:text-base flex items-center gap-2`}
                        >
                            {/* Display the appropriate icon based on the transaction tag */}
                            {trx.tag === "sent" && <ArrowUpFromLine className="w-4 h-4" />}  {/* Send icon */}
                            {trx.tag === "received" && <ArrowDownFromLine className="w-4 h-4" />} {/* Arrow Down (Received) */}
                            {trx.tag !== "sent" && trx.tag !== "received" && <DollarSign className="w-4 h-4" />} {/* Pending icon */}

                            {/* Display the status text */}
                            {trx.tag === "sent"
                                ? "Sent"
                                : trx.tag === "received"
                                    ? "Received"
                                    : "Pending"}
                        </div>
                    </div>

                    <div className="text-sm text-right self-center col-start-2 md:col-start-3 row-start-2 row-span-1 md:row-span-1">
                        {/* Displaying amount and fee */}
                        <p className="text-sm sm:text-base">
                            <span className="font-semibold">{trx.amount}</span> {trx.currency.symbol}
                        </p>
                        <p className="text-[10px] sm:text-xs text-grey6">Fee: {trx.fee} {trx.currency.symbol}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default HistoryList;
