'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { useSendConnection } from '@/hooks/user/useUser'

export default function UserProfilePage() {
    const { id } = useParams()

    const { data: profile, isLoading } = useQuery({
        queryKey: ['user', id],
        queryFn: async () => {
            const { data } = await api.get(`/user/${id}`)
            return data
        },
    })
    const { mutate, isPending } = useSendConnection()

    if (isPending) return <p>Loading...</p>

    return (
        <div className="max-w-lg mx-auto mt-10 text-center">
            <img
                src={profile.avatar ?? '/default-avatar.png'}
                alt={profile.name}
                className="w-24 h-24 rounded-full mx-auto"
            />
            <h2 className="text-xl font-semibold mt-2">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">{profile.bio}</p>

            <Button onClick={() => mutate(id as string)}>
                {isPending ? "Sending..." : "Add Friend"}
            </Button>
        </div>
    )
}
