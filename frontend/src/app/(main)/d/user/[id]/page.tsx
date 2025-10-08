'use client'

import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useUserById } from '@/hooks/user/useUser'
import { useSendConnection, useRespondConnection } from '@/hooks/user/useConnections'
import { useQueryClient } from '@tanstack/react-query'

export default function UserProfilePage() {
    const { id } = useParams()
    const userId = Array.isArray(id) ? id[0] : id

    const queryClient = useQueryClient()

    const { data: profile, isLoading } = useUserById(userId)
    const { mutate: sendConnection, isPending: isSending } = useSendConnection()
    const { mutate: respondConnection, isPending: isResponding } = useRespondConnection()

    if (isLoading) return <p>Loading profile...</p>

    const connectionStatus = profile?.connectionStatus || "NONE"

    const handleSendRequest = () => {
        if (connectionStatus === "NONE" && userId) {
            sendConnection(userId, {
                onSuccess: () => {
                    // ✅ Optimistically update the cache so UI updates immediately
                    queryClient.setQueryData(['user', userId], (oldData: any) => {
                        if (!oldData) return oldData
                        return { ...oldData, connectionStatus: "PENDING_SENT" }
                    })

                    // ✅ Optionally, re-fetch user profile for accurate status
                    queryClient.invalidateQueries({ queryKey: ['user', userId] })
                },
            })
        }
    }

    const handleAccept = () => {
        if (!profile?.pendingConnectionId) return
        respondConnection(
            { connectionId: profile.pendingConnectionId, accept: true },
            {
                onSuccess: () => {
                    queryClient.setQueryData(['user', userId], (oldData: any) => {
                        if (!oldData) return oldData
                        return { ...oldData, connectionStatus: "ACCEPTED" }
                    })
                    queryClient.invalidateQueries({ queryKey: ['user', userId] })
                },
            }
        )
    }

    const handleReject = () => {
        if (!profile?.pendingConnectionId) return
        respondConnection(
            { connectionId: profile.pendingConnectionId, accept: false },
            {
                onSuccess: () => {
                    queryClient.setQueryData(['user', userId], (oldData: any) => {
                        if (!oldData) return oldData
                        return { ...oldData, connectionStatus: "REJECTED" }
                    })
                    queryClient.invalidateQueries({ queryKey: ['user', userId] })
                },
            }
        )
    }

    return (
        <div className="max-w-lg mx-auto mt-10 text-center space-y-4">
            <img
                src={profile?.avatar ?? '/default-avatar.png'}
                alt={profile?.name}
                className="w-24 h-24 rounded-full mx-auto"
            />
            <h2 className="text-xl font-semibold">{profile?.name}</h2>
            <p className="text-sm text-muted-foreground">{profile?.bio}</p>

            {/* Connection actions */}
            {connectionStatus === "NONE" && (
                <Button onClick={handleSendRequest} disabled={isSending}>
                    {isSending ? "Sending..." : "Add Friend"}
                </Button>
            )}

            {connectionStatus === "PENDING_SENT" && (
                <Button disabled>Pending...</Button>
            )}

            {connectionStatus === "PENDING_RECEIVED" && (
                <div className="flex justify-center gap-2">
                    <Button onClick={handleAccept} disabled={isResponding}>
                        {isResponding ? "Processing..." : "Accept"}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isResponding}
                    >
                        {isResponding ? "Processing..." : "Reject"}
                    </Button>
                </div>
            )}

            {connectionStatus === "ACCEPTED" && <Button disabled>Friend</Button>}
            {connectionStatus === "REJECTED" && <Button disabled>Rejected</Button>}
        </div>
    )
}
