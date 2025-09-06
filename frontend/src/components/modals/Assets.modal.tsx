// AssetsModal.tsx
import React from 'react'
import { Dialog, DialogClose, DialogContent, DialogOverlay, DialogTitle } from '../ui/dialog'
import AssetItem, { AssetItemProps } from '../dashboard/balance-and-assets/AssetItem'

interface AssetsModalProps extends Pick<AssetItemProps, never> {
    open: boolean
    onOpenChange: (open: boolean) => void
    assets: AssetItemProps[]
}

const AssetsModal = ({ open, onOpenChange, assets }: AssetsModalProps) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogOverlay />
        <DialogContent>
            <DialogTitle>Assets</DialogTitle>

            <div className="space-y-2 mt-5">
                {assets.map((item, i) => (
                    <AssetItem key={i} {...item} />
                ))}
            </div>
            <DialogClose asChild>Close
            </DialogClose>
        </DialogContent>
    </Dialog>
)

export default AssetsModal
