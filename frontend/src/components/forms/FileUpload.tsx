import { FormValue } from "@/types/unifiedForms";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatFileSize } from "@/utils/unifiedFormApis";
import { MAX_IMAGES, IMAGE_MIME_TYPES } from "@/types/unifiedForms";
import { Modal } from "react-bootstrap";

export const FileUpload: React.FC<{
    fieldName: string;
    value: FormValue;
    onFileChange: (
        _fieldName: string,
        _files: FileList | File[] | null,
        _multiple: boolean,
    ) => void;
    fileBaseProps: Record<string, unknown>;
    accept?: string;
    multiple?: boolean;
    max_size?: number;
}> = ({
    fieldName,
    value,
    onFileChange,
    fileBaseProps,
    accept,
    multiple,
    max_size,
}) => {
    const fileValue = value as File | File[] | string;
    const selectedFiles = Array.isArray(fileValue)
        ? fileValue
        : fileValue instanceof File
          ? [fileValue]
          : [];

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                onFileChange(fieldName, files, multiple ?? false);
            }
        },
        [fieldName, multiple, onFileChange],
    );

    return (
        <div className="file-upload-container">
            <div
                className="drag-drop-area border-2 border-dashed rounded p-4 text-center"
                style={{
                    borderColor: "var(--default-color)",
                    backgroundColor: "var(--card-background-color)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "var(--accent-color)";
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "var(--default-color)";
                }}
                onDrop={handleDrop}
                onClick={() => document.getElementById(fieldName)?.click()}
            >
                <i className="bi bi-cloud-arrow-up fs-1 text-muted mb-2"></i>
                <p className="mb-1">
                    <strong>Drop files here or click to browse</strong>
                </p>
                <p className="small text-muted mb-0">
                    {accept && `Accepts: ${accept}`}
                    {max_size && ` • Max ${formatFileSize(max_size)} per file`}
                    {multiple && " • Multiple files allowed"}
                </p>
            </div>

            <input type="file" {...fileBaseProps} style={{ display: "none" }} />

            {selectedFiles.length > 0 && (
                <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                            <strong>{selectedFiles.length}</strong> file
                            {selectedFiles.length !== 1 ? "s" : ""} selected
                        </small>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                                onFileChange(fieldName, null, multiple ?? false)
                            }
                        >
                            <i className="bi bi-trash me-1"></i>Clear All
                        </button>
                    </div>

                    <div className="list-group">
                        {selectedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-file-earmark me-2"></i>
                                    <div>
                                        <div className="fw-medium">
                                            {file.name}
                                        </div>
                                        <small className="text-muted">
                                            {formatFileSize(file.size)}
                                        </small>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => {
                                        const newFiles = selectedFiles.filter(
                                            (_, i) => i !== index,
                                        );
                                        onFileChange(
                                            fieldName,
                                            newFiles,
                                            multiple ?? false,
                                        );
                                    }}
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const ImageUpload: React.FC<{
    fieldName: string;
    value: FormValue;
    onFileChange: (
        _fieldName: string,
        _files: FileList | File[] | null,
        _multiple: boolean,
    ) => void;
    fileBaseProps: Record<string, unknown>;
    accept?: string;
    multiple?: boolean;
    max_size?: number;
}> = ({
    fieldName,
    value,
    onFileChange,
    fileBaseProps,
    accept: _accept,
    multiple,
    max_size,
}) => {
    const imageValue = value as File | File[] | string;
    const selectedImages = useMemo(
        () =>
            Array.isArray(imageValue)
                ? imageValue
                : imageValue instanceof File
                  ? [imageValue]
                  : [],
        [imageValue],
    );
    const isAtLimit = useMemo(
        () => selectedImages.length >= MAX_IMAGES,
        [selectedImages],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();

            if (isAtLimit) {
                alert(
                    `You have already reached the maximum of ${MAX_IMAGES} images.`,
                );
                return;
            }

            const files = Array.from(e.dataTransfer.files).filter((file) =>
                IMAGE_MIME_TYPES.includes(file.type),
            );

            if (files.length > 0) {
                if (multiple) {
                    const newFiles = [...selectedImages, ...files];
                    if (newFiles.length > MAX_IMAGES) {
                        alert(
                            `You can only upload up to ${MAX_IMAGES} images. Please select fewer images.`,
                        );
                        onFileChange(
                            fieldName,
                            newFiles.slice(0, MAX_IMAGES),
                            multiple,
                        );
                    } else {
                        onFileChange(fieldName, newFiles, multiple);
                    }
                } else {
                    onFileChange(fieldName, files, multiple ?? false);
                }
            }
        },
        [fieldName, multiple, onFileChange, selectedImages, isAtLimit],
    );

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            if (isAtLimit) {
                alert(
                    `You have already reached the maximum of ${MAX_IMAGES} images.`,
                );
                e.target.value = "";
                return;
            }

            const fileArray = Array.from(files).filter((file) =>
                IMAGE_MIME_TYPES.includes(file.type),
            );

            if (multiple) {
                const newFiles = [...selectedImages, ...fileArray];
                if (newFiles.length > MAX_IMAGES) {
                    alert(
                        `You can only upload up to ${MAX_IMAGES} images. Please select fewer images.`,
                    );
                    onFileChange(
                        fieldName,
                        newFiles.slice(0, MAX_IMAGES),
                        multiple,
                    );
                } else {
                    onFileChange(fieldName, newFiles, multiple);
                }
            } else {
                onFileChange(fieldName, fileArray, multiple ?? false);
            }
        },
        [fieldName, multiple, onFileChange, selectedImages, isAtLimit],
    );

    return (
        <div className="image-upload-container">
            <div
                className="drag-drop-area border-2 border-dashed rounded p-4 text-center"
                style={{
                    borderColor: isAtLimit
                        ? "var(--text-error-color)"
                        : "var(--default-color)",
                    backgroundColor: isAtLimit
                        ? "var(--text-error-color)"
                        : "var(--card-background-color)",
                    cursor: isAtLimit ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    opacity: isAtLimit ? 0.6 : 1,
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!isAtLimit) {
                        e.currentTarget.style.borderColor =
                            "var(--text-success-color)";
                    }
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = isAtLimit
                        ? "var(--text-error-color)"
                        : "var(--default-color)";
                }}
                onDrop={handleDrop}
                onClick={() => {
                    if (isAtLimit) {
                        alert(
                            `You have already reached the maximum of ${MAX_IMAGES} images.`,
                        );
                        return;
                    }
                    document.getElementById(fieldName)?.click();
                }}
            >
                <i className="bi bi-cloud-arrow-up fs-1 text-muted mb-2"></i>
                <p className="mb-1">
                    <strong>Drop images here or click to browse</strong>
                </p>
                <p className="small text-muted mb-0">
                    Supports: JPG, PNG, GIF, WebP, BMP, SVG
                    {max_size && ` • Max ${formatFileSize(max_size)} per file`}
                    {multiple && ` • Up to ${MAX_IMAGES} images allowed`}
                    {selectedImages.length > 0 &&
                        ` • ${selectedImages.length}/${MAX_IMAGES} selected`}
                </p>
            </div>

            <input
                type="file"
                {...fileBaseProps}
                onChange={handleFileInputChange}
                style={{ display: "none" }}
            />

            {selectedImages.length > 0 && (
                <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                            <strong>{selectedImages.length}</strong> image
                            {selectedImages.length !== 1 ? "s" : ""} selected
                        </small>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                                onFileChange(fieldName, null, multiple ?? false)
                            }
                        >
                            <i className="bi bi-trash me-1"></i>Clear All
                        </button>
                    </div>

                    <div className="row g-2">
                        {selectedImages.map((file, index) => (
                            <ImagePreview
                                key={index}
                                file={file}
                                index={index}
                                onRemove={() => {
                                    const newFiles = selectedImages.filter(
                                        (_, i) => i !== index,
                                    );
                                    onFileChange(
                                        fieldName,
                                        newFiles,
                                        multiple ?? false,
                                    );
                                }}
                                max_size={max_size}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const ImagePreview: React.FC<{
    file: File;
    index: number;
    onRemove: () => void;
    max_size?: number;
}> = ({ file, index, onRemove, max_size }) => {
    const imageUrl = URL.createObjectURL(file);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        return () => URL.revokeObjectURL(imageUrl);
    }, [imageUrl]);

    return (
        <div className="col-6 col-md-4 col-lg-3">
            <div className="card position-relative">
                <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                    style={{
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        padding: "0",
                        zIndex: 10,
                    }}
                    onClick={onRemove}
                >
                    <i className="bi bi-x-lg" style={{ fontSize: "10px" }}></i>
                </button>

                <img
                    src={imageUrl}
                    alt={`Preview ${index + 1}`}
                    className="card-img-top"
                    style={{
                        height: "120px",
                        objectFit: "cover",
                        cursor: "pointer",
                    }}
                    onClick={() => setShowModal(true)}
                />

                <div className="card-body p-2">
                    <small
                        className="card-text text-truncate d-block"
                        title={file.name}
                    >
                        {file.name}
                    </small>
                    <small className="text-muted">
                        {formatFileSize(file.size)}
                    </small>

                    <div className="mt-1">
                        <div className="progress" style={{ height: "4px" }}>
                            <div
                                className={`progress-bar ${file.size > (max_size || 5 * 1024 * 1024) ? "bg-danger" : "bg-success"}`}
                                role="progressbar"
                                style={{ width: "100%" }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* React Bootstrap Modal */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>{file.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <img
                        src={imageUrl}
                        className="img-fluid"
                        style={{ maxHeight: "70vh" }}
                        alt={file.name}
                    />
                    <p className="mt-2 text-muted">
                        {formatFileSize(file.size)}
                    </p>
                </Modal.Body>
            </Modal>
        </div>
    );
};
