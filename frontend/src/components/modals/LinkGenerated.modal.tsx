// components/LinkGenerated.tsx
"use client"

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { Link2, Twitter, Mail, QrCode, Facebook } from 'lucide-react'
import { FaDiscord, FaXTwitter } from 'react-icons/fa6'

interface LinkGeneratedProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    encryptedData: string
    amount: string
    tokenSymbol: string
    recipientEmail: string
    onCopy: () => void
}

export default function LinkGenerated({
    open,
    onOpenChange,
    encryptedData,
    amount,
    tokenSymbol,
    recipientEmail,
    onCopy,
}: LinkGeneratedProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md mx-auto rounded-lg bg-card p-6 text-center space-y-4">
                <Image
                    src="/images/icons/check.svg"
                    width={80}
                    height={80}
                    alt="Success"
                    className="mx-auto w-24 h-24 xl:w-32 xl:h-32"
                />

                <DialogTitle className="text-2xl font-semibold">
                    Link Successfully Generated
                </DialogTitle>

                <DialogDescription className="text-sm text-grey6">
                    You have requested{' '}
                    <strong className="font-medium">
                        ${amount} {tokenSymbol}
                    </strong>{' '}
                    from <strong>{recipientEmail}</strong>. The payment link has been
                    created and you can share it to receive your funds.
                </DialogDescription>

                <p className="text-sm text-start font-medium">Share Link Via</p>
                <div className="flex justify-between space-x-2 max-w-full items-center">
                    {[
                        { Icon: Link2, label: 'Copy link', onClick: onCopy },
                        {
                            Icon: FaXTwitter,
                            label: 'Share on Twitter',
                            onClick: () =>
                                window.open(
                                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                                        encryptedData
                                    )}`,
                                    '_blank'
                                ),
                        },
                        {
                            Icon: FaDiscord,
                            label: 'Share on Discord',
                            onClick: () => window.open('https://discord.com/channels/@me', '_blank'),
                        },
                        {
                            Icon: Mail,
                            label: 'Share by Email',
                            onClick: () =>
                                window.open(
                                    `mailto:${recipientEmail}?body=${encodeURIComponent(
                                        encryptedData
                                    )}`,
                                    '_blank'
                                ),
                        },
                        // { Icon: QrCode, label: 'Show QR code', onClick: () => { } },
                    ].map(({ Icon, label, onClick }, idx) => (
                        <Button
                            key={idx}
                            variant="outline"
                            size="lg"
                            onClick={onClick}
                            aria-label={label}
                            className="w-1/6 flex-1 rounded-xl"
                        >
                            <Icon size={20} />
                        </Button>
                    ))}
                </div>

                <DialogFooter className="flex flex-col gap-2">
                    <DialogClose asChild>
                        OK
                    </DialogClose>
                    {/* <Button onClick={onCopy}>Send Link On Email</Button> */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
