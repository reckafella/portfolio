import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/utils/api";

// Types
export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    intro?: string;
    date: string;
    featured_image_url?: string;
    cover_image_url?: string;
    tags_list: string[];
    reading_time: string;
    view_count: number;
    comments_count: number;
    first_published_at: string;
    last_published_at: string;
    author: string;
    published: boolean;
    comments?: BlogComment[];
}

export interface BlogComment {
    id: number;
    content: string;
    created_at: string;
    author_name: string;
    author_email?: string;
}

export interface BlogStats {
    total_posts: number;
    total_views: number;
    total_comments: number;
    popular_tags: Array<{ name: string; count: number }>;
    recent_posts: BlogPost[];
}

export interface BlogFilters {
    search?: string;
    tag?: string;
    year?: number;
    month?: number;
    page?: number;
    page_size?: number;
    ordering?: string;
}

// Query keys
export const blogKeys = {
    all: ["blog"] as const,
    posts: () => [...blogKeys.all, "posts"] as const,
    post: (slug: string) => [...blogKeys.all, "post", slug] as const,
    comments: (slug: string) => [...blogKeys.all, "comments", slug] as const,
    stats: () => [...blogKeys.all, "stats"] as const,
    formConfig: () => [...blogKeys.all, "form-config"] as const,
    postFormConfig: () => [...blogKeys.all, "post-form-config"] as const,
};

// Blog post queries
export function useBlogPosts(filters: BlogFilters = {}) {
    return useQuery({
        queryKey: [...blogKeys.posts(), filters],
        queryFn: async () => {
            const params = new URLSearchParams();

            if (filters.search) params.append("search", filters.search);
            if (filters.tag) params.append("tag", filters.tag);
            if (filters.year) params.append("year", filters.year.toString());
            if (filters.month) params.append("month", filters.month.toString());
            if (filters.page) params.append("page", filters.page.toString());
            if (filters.page_size)
                params.append("page_size", filters.page_size.toString());
            if (filters.ordering) params.append("ordering", filters.ordering);

            const queryString = params.toString();
            const url = `/api/v1/blog/posts/${queryString ? `?${queryString}` : ""}`;

            const response = await apiRequest(url);
            return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}

export function useBlogPost(slug: string) {
    return useQuery({
        queryKey: blogKeys.post(slug),
        queryFn: async () => {
            const response = await apiRequest(`/api/v1/blog/article/${slug}/`);
            return response.json() as Promise<BlogPost>;
        },
        enabled: !slug.match("undefined") && !!slug,
        staleTime: 20 * 60 * 1000, // 20 minutes
    });
}

export function useBlogComments(blogSlug: string) {
    return useQuery({
        queryKey: blogKeys.comments(blogSlug),
        queryFn: async () => {
            const response = await apiRequest(
                `/api/v1/blog/article/${blogSlug}/comments/`,
            );
            return response.json() as Promise<BlogComment[]>;
        },
        enabled: !!blogSlug,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

export function useBlogStats() {
    return useQuery({
        queryKey: blogKeys.stats(),
        queryFn: async () => {
            const response = await apiRequest("/api/v1/blog/stats/");
            return response.json() as Promise<BlogStats>;
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
    });
}

export function useBlogFormConfig() {
    return useQuery({
        queryKey: blogKeys.formConfig(),
        queryFn: async () => {
            const response = await apiRequest(
                "/api/v1/blog/comments/form-config/",
            );
            return response.json();
        },
        staleTime: 60 * 60 * 1000, // 1 hour
        gcTime: 24 * 60 * 60 * 1000, // 24 hours
    });
}

export function useBlogPostFormConfig() {
    return useQuery({
        queryKey: blogKeys.postFormConfig(),
        queryFn: async () => {
            const response = await apiRequest("/api/v1/blog/post-form-config/");
            return response.json();
        },
        staleTime: 60 * 60 * 1000, // 1 hour
        gcTime: 24 * 60 * 60 * 1000, // 24 hours
    });
}

// Blog mutations
export function useCreateBlogPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: FormData) => {
            const response = await apiRequest("/api/v1/blog/article/create/", {
                method: "POST",
                body: data,
                headers: {
                    // Don't set Content-Type for FormData - browser will set it with boundary
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                const error = new Error("Blog post creation failed") as any;
                error.status = response.status;
                error.data = errorData;
                throw error;
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate blog posts list
            queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
            // Invalidate stats
            queryClient.invalidateQueries({ queryKey: blogKeys.stats() });
        },
    });
}

export function useUpdateBlogPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            slug,
            data,
        }: {
            slug: string;
            data: FormData;
        }) => {
            const response = await apiRequest(
                `/api/v1/blog/article/${slug}/update/`,
                {
                    method: "PUT",
                    body: data,
                    headers: {
                        // Don't set Content-Type for FormData - browser will set it with boundary
                    },
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                const error = new Error("Blog post update failed") as any;
                error.status = response.status;
                error.data = errorData;
                throw error;
            }

            return response.json();
        },
        onSuccess: (_, { slug }) => {
            // Invalidate the specific blog post
            queryClient.invalidateQueries({ queryKey: blogKeys.post(slug) });
            // Invalidate blog posts list
            queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
        },
    });
}

export function useDeleteBlogPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (slug: string) => {
            const response = await apiRequest(
                `/api/v1/blog/article/${slug}/delete/`,
                {
                    method: "DELETE",
                },
            );
            return response.ok;
        },
        onSuccess: (_, slug) => {
            // Remove the specific blog post from cache
            queryClient.removeQueries({ queryKey: blogKeys.post(slug) });
            // Invalidate blog posts list
            queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
            // Invalidate stats
            queryClient.invalidateQueries({ queryKey: blogKeys.stats() });
        },
    });
}
