import { ProjectFormData } from "./types";

export const createDataForSubmission = (
    data: ProjectFormData,
): Record<string, string | number | boolean | File | File[]> => {
    const submitData: Record<
        string,
        string | number | boolean | File | File[]
    > = {
        title: data.title,
        description: data.description,
        project_type: data.project_type,
        category: data.category,
        client: data.client,
    };

    if (data.project_url) {
        submitData.project_url = data.project_url;
    }

    // Add new images as array
    if (data.images.length > 0) {
        submitData.images = data.images;
    }

    // Add youtube URLs as newline-separated string (backend expects "one per line")
    const validYoutubeUrls = data.youtube_urls.filter((url) => url.trim());
    if (validYoutubeUrls.length > 0) {
        submitData.youtube_urls = validYoutubeUrls.join("\n");
    }

    // Add deletion support for images
    if (data.images_to_delete && data.images_to_delete.length > 0) {
        submitData.delete_images = data.images_to_delete
            .map((id) => String(id))
            .join(",");
    }

    // Add deletion support for videos
    if (data.videos_to_delete && data.videos_to_delete.length > 0) {
        submitData.delete_videos = data.videos_to_delete
            .map((id) => String(id))
            .join(",");
    }

    return submitData;
};
