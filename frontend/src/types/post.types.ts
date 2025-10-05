export interface Post {
    id: string;
    content: string;
    image?: string;
    createdAt: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
        city?: string;
    };
    comments: {
        id: string;
        content: string;
        author: { id: string; name: string; avatar?: string };
    }[];
    likes: { id: string; userId: string }[];
}