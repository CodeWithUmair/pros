"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import type { Control } from "react-hook-form"
import type { InvoiceFormData } from "@/lib/zodFormSchema"

interface EmailNotificationProps {
    control: Control<InvoiceFormData>
    ccEmails: string[]
    bccEmails: string[]
    setCcEmails: (emails: string[]) => void
    setBccEmails: (emails: string[]) => void
}

export default function EmailNotification({
    ccEmails,
    bccEmails,
    setCcEmails,
    setBccEmails,
}: EmailNotificationProps) {
    const [email, setEmail] = useState("")
    const [mailType, setMailType] = useState<"cc" | "bcc">("cc")

    const handleAddEmail = () => {
        if (!email || !email.includes("@")) return

        if (mailType === "cc") {
            if (!ccEmails.includes(email)) {
                setCcEmails([...ccEmails, email])
            }
        } else {
            if (!bccEmails.includes(email)) {
                setBccEmails([...bccEmails, email])
            }
        }

        setEmail("")
    }

    const removeEmail = (emailToRemove: string, type: "cc" | "bcc") => {
        if (type === "cc") {
            setCcEmails(ccEmails.filter((email) => email !== emailToRemove))
        } else {
            setBccEmails(bccEmails.filter((email) => email !== emailToRemove))
        }
    }

    return (
        <div className="space-y-4 border-dashed border-2 rounded-lg p-4">
            <h3 className="font-medium text-grey6 text-lg">Notify Emails</h3>

            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 sm:mr-2">
                    <Input type="email" className="border-b rounded-none" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                </div>

                <Select value={mailType} onValueChange={(value: "cc" | "bcc") => setMailType(value)}>
                    <SelectTrigger className="w-24">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cc">CC</SelectItem>
                        <SelectItem value="bcc">BCC</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button type="button" onClick={handleAddEmail}>
                Add Email
            </Button>

            <div className="space-y-2 mt-4">
                {[...ccEmails, ...bccEmails].map((emailItem, index) => (
                    <div key={index} className="flex justify-between items-center py-2 px-3 border-b">
                        <span>{emailItem}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm bg-grey3 text-black px-2 py-1 rounded">
                                {ccEmails.includes(emailItem) ? "CC" : "BCC"}
                            </span>
                            <button
                                type="button"
                                onClick={() => removeEmail(emailItem, ccEmails.includes(emailItem) ? "cc" : "bcc")}
                                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
