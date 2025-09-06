import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../ui/dialog'
import Image from 'next/image'
import { Button } from '../ui/button'
import { useUser } from '@/context/user-context'

interface ErrorOrSuccessModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    type: 'success' | 'error'
    amount: number
    tokenSymbol: string
    recipientEmail: string
    message?: string // Optional error message for error case
    onAddBeneficiary?: () => void
}

export default function ErrorOrSuccessModal({
    open,
    onOpenChange,
    type,
    amount,
    tokenSymbol,
    recipientEmail,
    message,
    onAddBeneficiary,
}: ErrorOrSuccessModalProps) {
    const title = type === 'success' ? 'Successfully Sent' : 'Transaction Failed'
    const description = type === 'success'
        ? `${amount} ${tokenSymbol} was successfully sent to ${recipientEmail}.`
        : message || 'Something went wrong. Please try again.'

    const imageSrc = type === 'success' ? '/images/icons/check.svg' : '/images/icons/cross.svg'

    const { refetch } = useUser();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm text-center space-y-4">
                <Image
                    src={imageSrc}
                    width={128}
                    height={128}
                    alt={type === 'success' ? 'Success' : 'Error'}
                    className="mx-auto w-24 h-24 xl:w-32 xl:h-32"
                />

                <DialogTitle>{title}</DialogTitle>

                <DialogDescription className="text-sm text-grey6">
                    <strong>{description}</strong>
                </DialogDescription>

                <DialogFooter className="flex flex-col gap-2">
                    <Button variant='ghost' onClick={refetch}>
                        OK
                    </Button>
                    {/* {type === 'success' && onAddBeneficiary && (
                        <Button onClick={onAddBeneficiary}>Add This Address As A Beneficiary</Button>
                    )} */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
