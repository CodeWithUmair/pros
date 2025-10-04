// src/app/(main)/feed/page.tsx
"use client";

import { useFeed, useCreatePost } from "@/hooks/usePosts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export default function FeedPage() {
    const { data: posts, isLoading } = useFeed();
    const { mutate: createPost, isPending } = useCreatePost();
    const [content, setContent] = useState("");

    if (isLoading) return <p>Loading feed...</p>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 py-8">
            {/* Post composer */}
            <Card>
                <CardHeader>
                    <CardTitle>Create Post</CardTitle>
                </CardHeader>
                <CardContent>
                    <Input
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <Button
                        className="mt-3"
                        disabled={!content.trim() || isPending}
                        onClick={() => {
                            createPost({ content });
                            setContent("");
                        }}
                    >
                        Post
                    </Button>
                </CardContent>
            </Card>

            {/* Feed */}
            {posts?.map((p) => (
                <Card key={p.id}>
                    <CardHeader className="flex flex-row items-center gap-3">
                        <Avatar className="w-10 h-10" />
                        <div>
                            <p className="font-semibold">{p.author.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(p.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p>{p.content}</p>
                        {p.image && (
                            <img
                                src={p.image}
                                alt=""
                                className="mt-3 rounded-lg max-h-64 object-cover"
                            />
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
