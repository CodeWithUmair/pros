"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name?: string;
    email?: string;
    walletAddress?: string;
  } | null;
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);

  function shortenWalletAddress(
    address: string | undefined,
    length: number = 3
  ): string {
    if (!address) {
      return "";
    }
    const prefix = address.startsWith("0x") ? "0x" : "";
    const mainAddress = prefix ? address.slice(2) : address;
    if (mainAddress.length <= length * 2) {
      return address;
    }
    return `${prefix}${mainAddress.slice(0, length)}...${mainAddress.slice(
      -length
    )}`;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            User Profile
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Name</p>
            <p>{user?.name || user?.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Email</p>

            <div className="flex items-center gap-2">
              <p className="flex-1">{user?.email}</p>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  const email = user?.email || "";
                  navigator.clipboard.writeText(email);
                  setCopiedEmail(true);
                  setTimeout(() => setCopiedEmail(false), 2000);
                }}
              >
                {copiedEmail ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Wallet Address</p>
            <div className="flex items-center gap-2">
              <p className="break-all flex-1">
                {shortenWalletAddress(user?.walletAddress, 8)}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  const walletAddress =
                    user?.walletAddress || "0x27e782372832903223";
                  navigator.clipboard.writeText(walletAddress);
                  setCopiedWallet(true);
                  setTimeout(() => setCopiedWallet(false), 2000);
                }}
              >
                {copiedWallet ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
