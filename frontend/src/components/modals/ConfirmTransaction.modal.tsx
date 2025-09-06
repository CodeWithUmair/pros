// components/ConfirmTransaction.tsx
"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../ui/dialog'
import { AlertDialogHeader, AlertDialogFooter } from '../ui/alert-dialog'
import { Button } from '../ui/button'

interface ConfirmTransactionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  tokenSymbol: string
  recipientEmail: string
  loading: boolean
  onConfirm: () => void
}

export default function ConfirmTransaction({
  open,
  onOpenChange,
  amount,
  tokenSymbol,
  recipientEmail,
  loading,
  onConfirm,
}: ConfirmTransactionProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center space-y-4">
        <AlertDialogHeader>
          <DialogTitle>Confirm Your Transaction</DialogTitle>
        </AlertDialogHeader>
        <DialogDescription className="my-5 text-sm text-grey6">
          You are about to send{' '}
          <strong>
            {amount} {tokenSymbol}
          </strong>{' '}
          to <strong>{recipientEmail}</strong>.
        </DialogDescription>
        <AlertDialogFooter className="flex justify-end space-x-2">
          <Button className='w-full' loading={loading} onClick={onConfirm}>
            Confirm
          </Button>
          <DialogClose asChild>
            Cancel
          </DialogClose>
        </AlertDialogFooter>
      </DialogContent>
    </Dialog>
  )
}
