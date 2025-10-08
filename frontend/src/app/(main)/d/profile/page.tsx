'use client'

import { useCurrentUser, useUpdateUser, useUpdateAvatar } from '@/hooks/user/useUser'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export default function ProfilePage() {
    const { data: user, isFetching } = useCurrentUser()
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        name: '',
        bio: '',
        city: '',
        madhab: '',
        halalCareerPreference: false,
    })

    // Populate form when user data loads
    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                bio: user.bio || '',
                city: user.city || '',
                madhab: user.madhab || '',
                halalCareerPreference: user.halalCareerPreference ?? false,
            })
        }
    }, [user])

    const { mutate: updateUser, isPending: isUpdatingUser } = useUpdateUser()

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // ✅ Validate file type
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            alert("Only PNG or JPEG images are allowed.");
            return;
        }

        // Optional: validate file size (e.g., max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert("File size must be less than 5MB.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const { data } = await api.patch("/user/me/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        queryClient.invalidateQueries({ queryKey: ["me"] });
    };

    const handleSaveProfile = () => {
        updateUser(form)
    }

    if (isFetching) return <p>Loading profile...</p>

    return (
        <div className="max-w-lg mx-auto mt-10 space-y-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.avatar ?? ''} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <label className="text-sm text-muted-foreground">Change Avatar</label>
                    <input type="file" accept="image/png, image/jpeg" onChange={handleAvatarUpload} />
                </div>
            </div>

            <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Textarea
                placeholder="Bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
            <Input
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
                placeholder="Madhab"
                value={form.madhab}
                onChange={(e) => setForm({ ...form, madhab: e.target.value })}
            />

            <Button onClick={handleSaveProfile} loading={isUpdatingUser}>
                {isUpdatingUser ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
    )
}
