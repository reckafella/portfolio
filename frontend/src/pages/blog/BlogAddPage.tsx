import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateBlogPost } from "@/hooks/queries/blogQueries";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { AlertMessage } from "@/components/common/AlertMessage";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { usePageTitle } from "@/hooks/usePageTitle";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { DevicePreviewModal } from "@/components/blog/DevicePreviewModal";

interface BlogPostFormData {
    title: string;
    content: string;
    tags: string;
    published: boolean;
    cover_image?: File;
}

// Removed old PreviewModal - now using DevicePreviewModal

export function BlogAddPage() {
    const navigate = useNavigate();
    const { canCreateBlog } = useStaffPermissions();
    const createBlogPostMutation = useCreateBlogPost();
    usePageTitle("Create Blog Post");

    const [formData, setFormData] = useState<BlogPostFormData>({
        title: "",
        content: "",
        tags: "",
        published: false,
    });

    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Redirect if user doesn't have permission
    if (!canCreateBlog) {
        return (
            <div className="container my-5">
                <AlertMessage
                    type="danger"
                    message="You don't have permission to create blog posts."
                />
            </div>
        );
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: [] }));
        }
    };

    const handleContentChange = (content: string) => {
        setFormData((prev) => ({ ...prev, content }));

        // Clear error for content field
        if (errors.content) {
            setErrors((prev) => ({ ...prev, content: [] }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({ ...prev, cover_image: file }));

            // Create image preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setFormData((prev) => ({ ...prev, cover_image: undefined }));
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            const formDataToSubmit = new FormData();
            formDataToSubmit.append("title", formData.title);
            formDataToSubmit.append("content", formData.content);
            formDataToSubmit.append("tags", formData.tags);
            formDataToSubmit.append("published", formData.published.toString());

            if (formData.cover_image) {
                formDataToSubmit.append("cover_image", formData.cover_image);
            }

            const result =
                await createBlogPostMutation.mutateAsync(formDataToSubmit);

            // Navigate to the new post or blog list
            // The backend returns: { message: '...', post: { ...post data with slug } }
            const postSlug = result?.post?.slug;
            if (formData.published && postSlug) {
                navigate(`/blog/article/${postSlug}`);
            } else {
                navigate("/blog");
            }
        } catch (error: unknown) {
            // eslint-disable-next-line no-console
            console.error("Blog post creation error:", error);

            if (error && typeof error === "object") {
                const errorObj = error as {
                    status?: number;
                    data?: Record<string, string[]>;
                    response?: {
                        data?: {
                            error?: string;
                            non_field_errors?: string[];
                        };
                    };
                    message?: string;
                };

                // Check for validation errors (400 status with field-specific errors)
                if (
                    errorObj.status === 400 &&
                    errorObj.data &&
                    typeof errorObj.data === "object"
                ) {
                    // Handle validation errors from the backend
                    const validationErrors: Record<string, string[]> = {};
                    Object.keys(errorObj.data).forEach((key) => {
                        const value = errorObj?.data?.[key];
                        if (Array.isArray(value)) {
                            validationErrors[key] = value;
                        } else if (typeof value === "string") {
                            validationErrors[key] = [value];
                        }
                    });
                    setErrors(validationErrors);
                }
                // Check for duplicate title error or other API response errors
                else if (errorObj.response?.data) {
                    if (errorObj.response.data.error) {
                        // Check if it's a duplicate title error
                        if (
                            errorObj.response.data.error.includes("title") ||
                            errorObj.response.data.error.includes("slug")
                        ) {
                            setErrors({
                                title: [
                                    "A blog post with this title already exists. Please choose a different title.",
                                ],
                            });
                        } else {
                            setErrors({
                                general: [errorObj.response.data.error],
                            });
                        }
                    } else if (errorObj.response.data.non_field_errors) {
                        setErrors({
                            general: errorObj.response.data.non_field_errors,
                        });
                    } else {
                        setErrors({
                            general: [
                                "Failed to create blog post. Please try again.",
                            ],
                        });
                    }
                }
                // Check for network or other errors
                else if (errorObj.message) {
                    setErrors({ general: [errorObj.message] });
                } else {
                    setErrors({
                        general: [
                            "Failed to create blog post. Please try again.",
                        ],
                    });
                }
            } else {
                setErrors({
                    general: ["Failed to create blog post. Please try again."],
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <section className="blog-editor-page">
                <div className="container my-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="card">
                                <div className="card-header">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="mb-0">
                                                Create Blog Post
                                            </h2>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() =>
                                                    navigate("/blog")
                                                }
                                            >
                                                <i className="bi bi-arrow-left me-1"></i>
                                                Back to Blog
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary"
                                                onClick={() =>
                                                    setShowPreview(true)
                                                }
                                                disabled={
                                                    !formData.title ||
                                                    !formData.content
                                                }
                                            >
                                                <i className="bi bi-eye me-1"></i>
                                                Preview
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {errors.general &&
                                        errors.general.map((msg, idx) => (
                                            <AlertMessage
                                                key={idx}
                                                type="danger"
                                                message={msg}
                                            />
                                        ))}

                                    <form onSubmit={handleSubmit}>
                                        {/* Title */}
                                        <div className="mb-4">
                                            <label
                                                htmlFor="title"
                                                className="form-label"
                                            >
                                                Title{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control form-control-lg ${errors.title ? "is-invalid" : ""}`}
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Enter your blog post title..."
                                                style={{
                                                    fontSize: "1.5rem",
                                                    fontWeight: "600",
                                                }}
                                            />
                                            {errors.title && (
                                                <div className="invalid-feedback">
                                                    {errors.title.join(", ")}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Editor */}
                                        <div className="mb-4">
                                            <label className="form-label">
                                                Content{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>
                                            <RichTextEditor
                                                content={formData.content}
                                                onChange={handleContentChange}
                                                placeholder="Start writing your blog post content..."
                                                error={!!errors.content}
                                            />
                                            {errors.content && (
                                                <div className="text-danger small mt-2">
                                                    {errors.content.join(", ")}
                                                </div>
                                            )}
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                {/* Tags */}
                                                <div className="mb-3">
                                                    <label
                                                        htmlFor="tags"
                                                        className="form-label"
                                                    >
                                                        Tags
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.tags ? "is-invalid" : ""}`}
                                                        id="tags"
                                                        name="tags"
                                                        value={formData.tags}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder="technology, programming, web development"
                                                    />
                                                    {errors.tags && (
                                                        <div className="invalid-feedback">
                                                            {errors.tags.join(
                                                                ", ",
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="form-text">
                                                        Separate tags with
                                                        commas.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                {/* Cover Image */}
                                                <div className="mb-3">
                                                    <label
                                                        htmlFor="cover_image"
                                                        className="form-label"
                                                    >
                                                        Cover Image
                                                    </label>
                                                    <input
                                                        type="file"
                                                        className={`form-control ${errors.cover_image ? "is-invalid" : ""}`}
                                                        id="cover_image"
                                                        name="cover_image"
                                                        accept="image/*"
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                    />
                                                    {errors.cover_image && (
                                                        <div className="invalid-feedback">
                                                            {errors.cover_image.join(
                                                                ", ",
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="form-text">
                                                        Upload a cover image for
                                                        your blog post
                                                        (optional).
                                                    </div>
                                                </div>

                                                {/* Image Preview */}
                                                {imagePreview && (
                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            Preview
                                                        </label>
                                                        <div className="position-relative">
                                                            <img
                                                                src={
                                                                    imagePreview
                                                                }
                                                                alt="Cover preview"
                                                                className="img-fluid rounded"
                                                                style={{
                                                                    maxHeight:
                                                                        "200px",
                                                                    width: "100%",
                                                                    objectFit:
                                                                        "cover",
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                                                                onClick={() => {
                                                                    setImagePreview(
                                                                        null,
                                                                    );
                                                                    setFormData(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            cover_image:
                                                                                undefined,
                                                                        }),
                                                                    );
                                                                    const fileInput =
                                                                        document.getElementById(
                                                                            "cover_image",
                                                                        ) as HTMLInputElement;
                                                                    if (
                                                                        fileInput
                                                                    )
                                                                        fileInput.value =
                                                                            "";
                                                                }}
                                                            >
                                                                <i className="bi bi-x"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Published Status */}
                                        <div className="mb-4">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="switch"
                                                    id="published"
                                                    name="published"
                                                    checked={formData.published}
                                                    onChange={handleInputChange}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor="published"
                                                >
                                                    Publish this post
                                                    immediately
                                                </label>
                                            </div>
                                            <div className="form-text">
                                                {formData.published
                                                    ? "This post will be visible to all visitors."
                                                    : "This post will be saved as a draft."}
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="d-flex gap-2">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={
                                                    isSubmitting ||
                                                    !formData.title ||
                                                    !formData.content
                                                }
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <LoadingSpinner
                                                            size="sm"
                                                            className="me-2"
                                                        />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-check-lg me-1"></i>
                                                        Create Post
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() =>
                                                    navigate("/blog")
                                                }
                                                disabled={isSubmitting}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Device Preview Modal */}
            <DevicePreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title={formData.title}
                content={formData.content}
                coverImage={imagePreview}
                tags={
                    formData.tags
                        ? formData.tags
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter((tag) => tag)
                        : []
                }
                published={formData.published}
                author="Ethan Wanyoike"
                readingTime="5 min read"
                viewCount={0}
                publishedAt={new Date().toISOString()}
            />
        </>
    );
}
