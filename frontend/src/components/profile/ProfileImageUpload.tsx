import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useUploadProfileImage, useDeleteProfileImage } from '@/hooks/useProfile';

interface ProfileImageUploadProps {
    currentImageUrl: string | null;
    onUploadSuccess?: () => void;
}

/**
 * ProfileImageUpload component with cropping functionality
 * Replicates: authentication/templates/auth/profile/partials/modals/crop-images-modal.html
 * Based on: app/static/assets/javascript/images/ProfileImageCropper.js
 */
export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
    currentImageUrl,
    onUploadSuccess,
}) => {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string>('');
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5,
    });
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const [rotation, setRotation] = useState(0);
    const [scale, setScale] = useState(1);
    
    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const uploadMutation = useUploadProfileImage();
    const deleteMutation = useDeleteProfileImage();

    // Handle file selection
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (20MB max)
        if (file.size > 20 * 1024 * 1024) {
            alert('File size must be less than 20MB');
            return;
        }

        setSelectedFile(file);

        // Read file and create preview
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    // Handle crop completion
    const handleCropComplete = useCallback((crop: PixelCrop) => {
        setCompletedCrop(crop);
    }, []);

    // Create cropped image blob
    const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
        if (!imgRef.current || !completedCrop) return null;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return null;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Set canvas size to 500x500 (profile picture size)
        canvas.width = 500;
        canvas.height = 500;

        // Apply transformations
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // Draw cropped image
        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.restore();

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve(blob);
                },
                'image/jpeg',
                0.95
            );
        });
    }, [completedCrop, rotation, scale]);

    // Handle upload
    const handleUpload = async () => {
        if (!selectedFile || !completedCrop) return;

        try {
            const croppedBlob = await getCroppedImg();
            if (!croppedBlob) {
                alert('Failed to crop image');
                return;
            }

            // Create file from blob
            const croppedFile = new File([croppedBlob], selectedFile.name, {
                type: 'image/jpeg',
            });

            await uploadMutation.mutateAsync(croppedFile);
            
            // Close modal and reset
            setShowModal(false);
            setSelectedFile(null);
            setImageSrc('');
            setCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
            setRotation(0);
            setScale(1);
            
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (error: any) {
            alert(error.message || 'Failed to upload image');
        }
    };

    // Handle delete
    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync();
            setShowDeleteModal(false);
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (error: any) {
            alert(error.message || 'Failed to delete image');
        }
    };

    // Reset modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedFile(null);
        setImageSrc('');
        setCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
        setRotation(0);
        setScale(1);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            {/* Profile Photo Display */}
            <div className="mb-3">
                {currentImageUrl ? (
                    <img
                        src={currentImageUrl}
                        alt="Profile"
                        loading="lazy"
                        className="img-fluid rounded-circle mb-2"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                ) : (
                    <div
                        className="rounded-circle bg-light d-flex justify-content-center align-items-center mb-2"
                        style={{ width: '120px', height: '120px' }}
                    >
                        <i className="bi bi-person-circle" style={{ fontSize: '5rem', color: '#6c757d' }}></i>
                    </div>
                )}
                <div className="pt-2 text-center">
                    <button
                        type="button"
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => setShowModal(true)}
                        title={currentImageUrl ? 'Update Profile Photo' : 'Upload Profile Photo'}
                    >
                        <i className="bi bi-upload"></i> {currentImageUrl ? 'Update' : 'Upload'}
                    </button>
                    {currentImageUrl && (
                        <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => setShowDeleteModal(true)}
                            title="Delete Profile Photo"
                        >
                            <i className="bi bi-trash"></i> Delete
                        </button>
                    )}
                </div>
                <small className="text-muted d-block mt-2 text-center">
                    Min size: 500x500px, Max: 20MB
                </small>
            </div>

            {/* Upload Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Crop Profile Image</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                {!imageSrc ? (
                                    /* File Upload Section */
                                    <div>
                                        <div
                                            className="file-drop-zone border border-2 border-dashed rounded p-5 text-center"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <i className="bi bi-cloud-upload display-4 text-muted"></i>
                                            <p className="mb-2">Click to select an image</p>
                                            <small className="text-muted">JPG, PNG, GIF up to 20MB • Minimum 500x500px</small>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="d-none"
                                            onChange={handleFileSelect}
                                        />
                                    </div>
                                ) : (
                                    /* Crop Section */
                                    <div className="row">
                                        <div className="col-md-7">
                                            <ReactCrop
                                                crop={crop}
                                                onChange={(c) => setCrop(c)}
                                                onComplete={handleCropComplete}
                                                aspect={1}
                                                circularCrop
                                            >
                                                <img
                                                    ref={imgRef}
                                                    src={imageSrc}
                                                    alt="Crop preview"
                                                    style={{
                                                        maxWidth: '100%',
                                                        transform: `scale(${scale}) rotate(${rotation}deg)`,
                                                    }}
                                                />
                                            </ReactCrop>
                                        </div>
                                        <div className="col-md-5">
                                            <h6 className="text-center mb-3">Controls</h6>
                                            
                                            {/* Rotation */}
                                            <div className="mb-3">
                                                <label className="form-label">Rotation</label>
                                                <div className="btn-group w-100" role="group">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => setRotation(r => r - 90)}
                                                    >
                                                        <i className="bi bi-arrow-counterclockwise"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => setRotation(0)}
                                                    >
                                                        Reset
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => setRotation(r => r + 90)}
                                                    >
                                                        <i className="bi bi-arrow-clockwise"></i>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Zoom */}
                                            <div className="mb-3">
                                                <label className="form-label">Zoom: {scale.toFixed(1)}x</label>
                                                <input
                                                    type="range"
                                                    className="form-range"
                                                    min="0.5"
                                                    max="3"
                                                    step="0.1"
                                                    value={scale}
                                                    onChange={(e) => setScale(parseFloat(e.target.value))}
                                                />
                                            </div>

                                            {/* Reset */}
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary w-100"
                                                onClick={() => {
                                                    setCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
                                                    setRotation(0);
                                                    setScale(1);
                                                }}
                                            >
                                                <i className="bi bi-arrow-clockwise me-1"></i>
                                                Reset All
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                {imageSrc && (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleUpload}
                                        disabled={!completedCrop || uploadMutation.isPending}
                                    >
                                        {uploadMutation.isPending ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Uploading...
                                            </>
                                        ) : (
                                            'Crop & Upload'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Delete Profile Picture</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete your profile picture?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
