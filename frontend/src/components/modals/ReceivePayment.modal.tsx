import React from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogTitle } from '../ui/dialog'

const ReceivePayment = () => {
    return (
        <Dialog>
            <DialogOverlay />
            <DialogContent>
                <DialogTitle>Receive Payment</DialogTitle>
                <DialogDescription>
                    This is a description of the receive payment modal.
                </DialogDescription>
                <DialogClose>Close</DialogClose>
            </DialogContent>
        </Dialog>
    )
}

export default ReceivePayment