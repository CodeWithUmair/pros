"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Button } from "./button";
import { Asset } from "@/types/user.types";

interface CustomSelectProps {
    data: Asset[];
    value: string;
    onChange: (value: string) => void;
}

export default function CustomSelect({ data, value, onChange }: CustomSelectProps) {
    const [open, setOpen] = useState(false);
    const selected = data.find((a) => a.id === value);

    return (
        <div className="relative w-full">
            {/* Trigger */}
            <Button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center hover:bg-transparent justify-between rounded-md bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring text-muted-foreground hover:text-foreground text-sm xl:text-base 3xl:text-lg"
            >
                {selected ? (
                    <div className="flex items-center gap-2">
                        <Image
                            src={selected.image}
                            alt={selected.symbol}
                            width={20}
                            height={20}
                            className="rounded-full"
                        />
                        <span>{selected.symbol}</span>
                    </div>
                ) : (
                    <span >Choose a token</span>
                )}
                <ChevronDown className="size-6" />
            </Button>

            {/* Dropdown */}
            {open && (
                <ul className="absolute z-50 mt-1 w-full rounded-md border bg-card shadow-md max-h-60 overflow-y-auto">
                    {data.map((asset) => (
                        <li
                            key={asset.id}
                            onClick={() => {
                                onChange(asset.id);
                                setOpen(false);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted cursor-pointer"
                        >
                            <Image
                                src={asset.image}
                                alt={asset.symbol}
                                width={20}
                                height={20}
                                className="rounded-full"
                            />
                            <span>{asset.symbol}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
