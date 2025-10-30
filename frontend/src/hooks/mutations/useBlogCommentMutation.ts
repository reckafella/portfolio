import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogKeys } from "../queries/blogQueries";
import { apiRequest } from "@/utils/api";

interface CommentData {
    name: string;
    email: string;
    website?: string;
    comment: string;
    captcha_0: string;
    captcha_1: string;
}

interface CommentResponse {
    id: number;
    author_name: string;
    content: string;
    created_at: string;
}

export function useCreateBlogComment() {
    const queryClient = useQueryClient();

    return useMutation<
        CommentResponse,
        Error,
        { post_slug: string } & CommentData
    >({
        mutationFn: async ({ post_slug, ...data }) => {
            const response = await apiRequest(
                `/api/v1/blog/article/${post_slug}/comments/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error ||
                        errorData.message ||
                        "Failed to create comment",
                );
            }

            return response.json();
        },
        onSuccess: (_data, variables) => {
            // Invalidate comments for this blog post
            queryClient.invalidateQueries({
                queryKey: blogKeys.comments(variables.post_slug),
            });
            // Invalidate the blog post to update comment count
            queryClient.invalidateQueries({
                queryKey: blogKeys.post(variables.post_slug),
            });
        },
    });
}
