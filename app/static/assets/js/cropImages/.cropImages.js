import openImageCropModal from './utils/images/modals.js';
import { showAlert, formatFileSize } from './utils/images/utilityFunctions.js';

let cropper = null;
let selectedFile = null;
let previewUpdateTimeout = null;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // File input change handler
    const fileInput = document.getElementById('imageFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleFileSelect(file);
            }
        });
    }

    // Drag and drop handlers
    const dropZone = document.querySelector('.file-drop-zone');
    if (dropZone) {
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
    }

    // Handle active tab persistence
    const url = new URL(window.location.href);
    const tab = url.searchParams.get('tab');
    if (tab) {
        const activeTab = document.querySelector(`.nav-link[data-bs-target="#${tab}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            const activeTabContent = document.querySelector(`.tab-pane[data-bs-target="#${tab}"]`);
            if (activeTabContent) {
                activeTabContent.classList.add('show', 'active');
            }
        }
    }
});

// Handle file selection and validation
function handleFileSelect(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showAlert('Please select a valid image file.', 'danger');
        return;
    }

    // Validate file size (20MB = 20 * 1024 * 1024 bytes)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
        showAlert('File size must be less than 20MB.', 'danger');
        return;
    }

    selectedFile = file;
    
    // Show file info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').style.display = 'block';

    // Create image to check dimensions and load into cropper
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Check minimum dimensions
            if (this.width < 500 || this.height < 500) {
                showAlert('Image must be at least 500x500 pixels. This image is ' + this.width + 'x' + this.height + ' pixels.', 'danger');
                clearSelectedFile();
                return;
            }

            // Initialize cropper with the loaded image
            initializeCropper(e.target.result);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Initialize cropper with enhanced real-time preview
function initializeCropper(imageSrc) {
    document.getElementById('fileUploadSection').style.display = 'none';
    document.getElementById('cropSection').style.display = 'block';
    
    const cropImage = document.getElementById('cropImage');
    
    // Destroy existing cropper if it exists
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }

    // Clear any existing image src
    cropImage.src = '';
    
    // Detect if device is mobile/touch
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                    ('ontouchstart' in window) || 
                    (navigator.maxTouchPoints > 0);

    // Set the new image source and initialize cropper when loaded
    cropImage.onload = function() {
        cropper = new Cropper(cropImage, {
            aspectRatio: 1,
            viewMode: 2,
            guides: true,
            center: true,
            highlight: false,
            background: false,
            autoCrop: true,
            autoCropArea: 0.8,
            dragMode: 'move',
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            responsive: true,
            restore: false,
            checkCrossOrigin: false,
            checkOrientation: false,
            modal: true,
            
            // Enhanced zoom settings
            zoomable: true,
            zoomOnTouch: isMobile,
            zoomOnWheel: !isMobile,
            wheelZoomRatio: 0.1,
            
            // Crop box settings
            minCropBoxWidth: 100,
            minCropBoxHeight: 100,
            
            ready() {
                console.log('Cropper initialized successfully');
                document.getElementById('cropAndUpload').disabled = false;
                
                // Initial preview update
                updatePreview();
                
                // Add mobile-specific controls if needed
                if (isMobile) {
                    addMobileControls();
                }
                
                // Add enhanced touch support
                addTouchSupport();
            },
            
            // Real-time preview updates with throttling
            crop(event) {
                // Clear existing timeout
                if (previewUpdateTimeout) {
                    clearTimeout(previewUpdateTimeout);
                }
                
                // Throttle preview updates for better performance
                previewUpdateTimeout = setTimeout(() => {
                    updatePreview();
                }, 50); // Reduced timeout for more responsive updates
            },

            // Handle zoom events
            zoom() {
                if (previewUpdateTimeout) {
                    clearTimeout(previewUpdateTimeout);
                }
                previewUpdateTimeout = setTimeout(() => {
                    updatePreview();
                }, 50);
            }
        });
    };
    
    // Set the image source to trigger onload
    cropImage.src = imageSrc;
}


// Add mobile-specific zoom and pan controls
function addMobileControls() {
    // Remove existing controls
    const existingControls = document.querySelector('.mobile-crop-controls');
    if (existingControls) {
        existingControls.remove();
    }

    const controls = document.createElement('div');
    controls.className = 'mobile-crop-controls mt-3 text-center';
    controls.innerHTML = `
        <div class="btn-group mb-2" role="group">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="zoomImage(-0.1)" title="Zoom Out">
                <i class="bi bi-zoom-out"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="resetCrop()" title="Reset">
                <i class="bi bi-arrows-move"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="zoomImage(0.1)" title="Zoom In">
                <i class="bi bi-zoom-in"></i>
            </button>
        </div>
    `;

    const previewContainer = document.querySelector('#cropSection .col-md-4');
    if (previewContainer) {
        previewContainer.appendChild(controls);
    }
}

// Enhanced zoom function
function zoomImage(ratio) {
    if (cropper) {
        cropper.zoom(ratio);
    }
}

// Reset crop to center
function resetCrop() {
    if (cropper) {
        cropper.reset();
        // Update preview after reset
        setTimeout(updatePreview, 100);
    }
}

// Rotate image function
function rotateImage(degrees) {
    if (cropper) {
        cropper.rotate(degrees);
        // Update preview after rotation
        setTimeout(updatePreview, 100);
    }
}

// Clear selected file
function clearSelectedFile() {
    selectedFile = null;
    const fileInput = document.getElementById('imageFileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    document.getElementById('fileInfo').style.display = 'none';
    
    // Properly destroy cropper
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    
    // Clear timeouts
    if (previewUpdateTimeout) {
        clearTimeout(previewUpdateTimeout);
        previewUpdateTimeout = null;
    }
    
    // Clear the crop image source
    const cropImage = document.getElementById('cropImage');
    if (cropImage) {
        cropImage.src = '';
        cropImage.onload = null;
    }
    
    // Clear preview
    const preview = document.getElementById('cropPreview');
    if (preview) {
        preview.innerHTML = '';
    }
    
    // Remove mobile controls
    const controlsContainer = document.querySelector('.mobile-crop-controls');
    if (controlsContainer) {
        controlsContainer.remove();
    }
}

// Crop and upload image
function cropAndUpload() {
    if (!cropper || !selectedFile) {
        showAlert('No image selected or cropper not initialized.', 'danger');
        return;
    }

    try {
        const canvas = cropper.getCroppedCanvas({
            width: 500,
            height: 500,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
            fillColor: '#fff'
        });

        if (!canvas) {
            showAlert('Failed to process the image. Please try again.', 'danger');
            return;
        }

        canvas.toBlob(function(blob) {
            if (!blob) {
                showAlert('Failed to create image blob. Please try again.', 'danger');
                return;
            }

            const formData = new FormData();
            formData.append('profile_pic', blob, 'profile_image.jpg');
            formData.append('form_type', 'profile');
            
            // Get CSRF token from meta tag or form
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
                             document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            if (csrfToken) {
                formData.append('csrfmiddlewaretoken', csrfToken);
            }

            // Show loading state
            const uploadBtn = document.getElementById('cropAndUpload');
            const originalText = uploadBtn.innerHTML;
            uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Uploading...';
            uploadBtn.disabled = true;

            // Get the current URL or construct the upload URL
            const uploadUrl = window.location.href;

            fetch(uploadUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showAlert('Profile image updated successfully!', 'success');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showAlert(data.error || 'An error occurred while uploading the image.', 'danger');
                }
            })
            .catch(error => {
                console.error('Upload error:', error);
                showAlert('An error occurred while uploading the image.', 'danger');
            })
            .finally(() => {
                uploadBtn.innerHTML = originalText;
                uploadBtn.disabled = false;
                const modal = bootstrap.Modal.getInstance(document.getElementById('imageCropModal'));
                if (modal) {
                    modal.hide();
                }
            });
        }, 'image/jpeg', 0.9);
    } catch (error) {
        console.error('Crop and upload error:', error);
        showAlert('Failed to process the image. Please try again.', 'danger');
    }
}

// Confirm delete profile picture
function confirmDeleteProfilePic() {
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
}

// Delete profile picture
function deleteProfilePic() {
    // Get CSRF token
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
                     document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    fetch(window.location.href, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: 'delete_profile_pic=true'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showAlert('Profile picture deleted successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showAlert(data.error || 'An error occurred while deleting the profile picture.', 'danger');
        }
    })
    .catch(error => {
        console.error('Delete error:', error);
        showAlert('An error occurred while deleting the profile picture.', 'danger');
    })
    .finally(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        if (modal) {
            modal.hide();
        }
    });
}

// Enhanced touch event handlers for better mobile experience
function addTouchSupport() {
    const cropContainer = document.querySelector('.cropper-container');
    if (!cropContainer || !cropper) return;

    let startDistance = 0;
    let isZooming = false;

    // Handle pinch-to-zoom on mobile
    cropContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            isZooming = true;
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            startDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
        }
    }, { passive: false });

    cropContainer.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2 && isZooming && cropper) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            if (startDistance > 0) {
                const ratio = currentDistance / startDistance;
                const zoomRatio = (ratio - 1) * 0.3; // Reduced sensitivity
                cropper.zoom(zoomRatio);
                startDistance = currentDistance;
            }
        }
    }, { passive: false });

    cropContainer.addEventListener('touchend', function(e) {
        if (e.touches.length < 2) {
            isZooming = false;
            startDistance = 0;
        }
    });

    // Prevent default gesture behaviors
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(eventType => {
        cropContainer.addEventListener(eventType, function(e) {
            e.preventDefault();
        });
    });
}
