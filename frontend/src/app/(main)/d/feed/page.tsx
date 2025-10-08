"use client";
import {
    useFeed,
    useCreatePost,
    useLikePost,
    useUnlikePost,
    useDeletePost,
    useCommentPost,
} from "@/hooks/usePosts";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageLoader from "@/components/layout/page-loader";
import { toast } from "react-hot-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getTimeAgo } from "@/lib/helpers";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function FeedPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
    const [commentText, setCommentText] = useState<Record<string, string>>({});
    const [content, setContent] = useState("");
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

    const { data: user } = useCurrentUser();
    const { data: feedPosts, isLoading } = useFeed();
    const { mutate: createPost, isPending } = useCreatePost();
    const { mutate: likePost } = useLikePost();
    const { mutate: unlikePost } = useUnlikePost();
    const { mutate: deletePost } = useDeletePost();
    const { mutate: commentPost } = useCommentPost();

    // Helpers
    const getPost = (postId: string) => posts.find((p) => p.id === postId);
    const updatePostInState = (postId: string, updatedFields: Partial<any>) => {
        setPosts((prev) =>
            prev.map((p) => (p.id === postId ? { ...p, ...updatedFields } : p))
        );
    };

    // Optimistic Like
    const handleLike = (postId: string, likes: any[]) => {
        const isLiked = likes.some((l) => l.userId === user?.id);
        const originalLikes = [...likes];

        const updatedLikes = isLiked
            ? originalLikes.filter((l) => l.userId !== user?.id)
            : [...originalLikes, { userId: user!.id }];

        updatePostInState(postId, { likes: updatedLikes });

        const mutation = isLiked ? unlikePost : likePost;
        mutation(postId, {
            onError: () => updatePostInState(postId, { likes: originalLikes }),
        });
    };

    // Optimistic Comment
    const handleComment = (postId: string, content: string) => {
        if (!content) return;

        const tempComment = {
            id: "temp-" + Date.now(),
            content,
            author: { id: user!.id, name: user!.name },
            createdAt: new Date().toISOString(),
        };

        // Prepend new comment for optimistic UI
        updatePostInState(postId, {
            comments: [tempComment, ...(getPost(postId)?.comments || [])],
        });

        setCommentText((prev) => ({ ...prev, [postId]: "" }));

        commentPost({ postId, content }, {
            onSuccess: (newComment) => {
                updatePostInState(postId, {
                    comments: getPost(postId)?.comments.map((c) =>
                        c.id === tempComment.id ? newComment : c
                    ),
                });
            },
            onError: () => {
                updatePostInState(postId, {
                    comments: getPost(postId)?.comments.filter((c) => c.id !== tempComment.id),
                });
            },
        });
    };

    // Sync feedPosts to local state whenever it changes
    useEffect(() => {
        if (feedPosts) {
            setPosts(feedPosts);
        }
    }, [feedPosts]);

    if (isLoading) return <PageLoader />;

    return (
        <div className="max-w-2xl mx-auto space-y-4 py-8">
            {/* Post composer */}
            <Card>
                <CardHeader>
                    <CardTitle>Create Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Input
                        placeholder="What's on your mind?"
                        value={content}
                        disabled={isPending}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <div className="w-full flex items-center justify-end">
                        <Button
                            disabled={!content.trim() || isPending}
                            loading={isPending}
                            onClick={() => {
                                createPost({ content }, { onSuccess: () => toast.success("Posted!") });
                                setContent("");
                            }}
                        >
                            Post
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Feed */}
            {posts.map((p) => (
                <Card key={p.id}>
                    <CardHeader className="flex flex-row items-center gap-3">
                        <div className="w-full flex items-start justify-between gap-4">

                            <div className="flex gap-3">
                                <Avatar className="w-10 h-10">
                                    {p.author.avatar ? (
                                        <AvatarImage src={p.author.avatar} alt={p.author.name} />
                                    ) : (
                                        <AvatarFallback>{p.author.name[0]}</AvatarFallback>
                                    )}
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{p.author.name}</p>
                                    <p className="text-xs text-muted-foreground">{getTimeAgo(p.createdAt)}</p>
                                </div>
                            </div>

                            {p.author.id === user?.id && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            asChild
                                            variant="ghostDestructive"
                                        >
                                            <Button
                                                variant="ghostDestructive"
                                                className="w-full"
                                                loading={deletingPostId === p.id}
                                                onClick={() => {
                                                    setDeletingPostId(p.id);
                                                    deletePost(p.id, {
                                                        onSuccess: () => setDeletingPostId(null),
                                                        onError: () => setDeletingPostId(null),
                                                    });
                                                }}
                                            >
                                                Delete this post
                                            </Button>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>

                    </CardHeader>

                    <CardContent>
                        <p>{p.content}</p>

                        {p.image && (
                            <img src={p.image} alt="" className="mt-3 rounded-lg max-h-64 object-cover" />
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLike(p.id, p.likes)}
                            >
                                ❤️ {p.likes?.length || 0}
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setOpenComments((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
                                }
                            >
                                💬 {p.comments?.length || 0}
                            </Button>
                        </div>

                        {/* Comments */}
                        {openComments[p.id] && (
                            <div className="mt-4 space-y-2">
                                {/* Comment input */}
                                <div className="flex gap-2 mb-3">
                                    <Input
                                        placeholder="Write a comment..."
                                        value={commentText[p.id] || ""}
                                        onChange={(e) =>
                                            setCommentText((prev) => ({ ...prev, [p.id]: e.target.value }))
                                        }
                                    />
                                    <Button onClick={() => handleComment(p.id, commentText[p.id] || "")}>
                                        Send
                                    </Button>
                                </div>

                                {/* Comments list with scroll and max height */}
                                <ScrollArea className="max-h-60 overflow-auto rounded-md border border-muted-foreground/20 p-2">
                                    {p.comments?.length > 0 ? (
                                        p.comments.map((c) => (
                                            <div key={c.id} className="text-sm border-b pb-1 my-2 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-10 h-10">
                                                        {c.author.avatar ? (
                                                            <AvatarImage src={c.author.avatar} alt={c.author.name} />
                                                        ) : (
                                                            <AvatarFallback>{c.author.name[0]}</AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                    <span className="font-semibold">{c.author.name}:</span>
                                                </div>
                                                <p>
                                                    {c.content}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No comments yet</p>
                                    )}
                                </ScrollArea>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
