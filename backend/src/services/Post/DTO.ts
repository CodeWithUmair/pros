export interface CreatePostDTO {
    content: string;
    image?: string;
    authorId: string;
}

export interface CreateCommentDTO {
    postId: string;
    content: string;
    authorId: string;
}
