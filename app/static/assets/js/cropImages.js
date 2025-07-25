let cropper = null;
let selectedFile = null;

// Open image crop modal
function openImageCropModal() {
    const modal = new bootstrap.Modal(document.getElementById('imageCropModal'));
    modal.show();
    resetModal();
}

// Reset modal to initial state
function resetModal() {
    document.getElementById('fileUploadSection').style.display = 'block';
    document.getElementById('cropSection').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('cropAndUpload').disabled = true;
    clearSelectedFile();
}

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

    // Create image to check dimensions
    const img = new Image();
    img.onload = function() {
        // Check minimum dimensions
        if (this.width < 500 || this.height < 500) {
            showAlert('Image must be at least 500x500 pixels. This image is ' + this.width + 'x' + this.height + ' pixels.', 'danger');
            clearSelectedFile();
            return;
        }

        // Initialize cropper
        initializeCropper(this.src);
    };

    const reader = new FileReader();
    reader.onload = function(e) {
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Initialize cropper with mobile-friendly settings
function initializeCropper(imageSrc) {
    document.getElementById('fileUploadSection').style.display = 'none';
    document.getElementById('cropSection').style.display = 'block';
    
    const cropImage = document.getElementById('cropImage');
    
    // Destroy existing cropper if it exists
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }

    // Clear any existing image src and wait for DOM update
    cropImage.src = '';
    
    // Set the new image source
    cropImage.onload = function() {
        // Detect if device is mobile/touch
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                        ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0);

        cropper = new Cropper(cropImage, {
            aspectRatio: 1,
            viewMode: 2, // Changed to viewMode 2 to prevent duplication
            guides: true,
            center: true,
            highlight: false, // Disable highlight to reduce visual clutter
            background: false, // Disable background grid
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
            modal: false, // Disable modal overlay to prevent duplication
            preview: [], // Disable automatic preview to handle it manually
            
            // Mobile-friendly zoom settings
            zoomable: true,
            zoomOnTouch: isMobile,
            zoomOnWheel: !isMobile,
            wheelZoomRatio: 0.1,
            touchDragZoom: isMobile,
            
            // Mobile-friendly crop box settings
            minCropBoxWidth: 100,
            minCropBoxHeight: 100,
            
            ready: function() {
                document.getElementById('cropAndUpload').disabled = false;
                
                // Initial preview update
                updatePreview();
                
                // Add mobile-specific controls
                if (isMobile) {
                    addMobileControls();
                }
            },
            
            // Enhanced crop events for better mobile experience
            crop: function(event) {
                // Update preview in real-time with throttling
                clearTimeout(this.previewTimeout);
                this.previewTimeout = setTimeout(updatePreview, 100);
            }
        });
    };
    
    cropImage.src = imageSrc;
}

// Add mobile-specific zoom and pan controls
function addMobileControls() {
    const controlsContainer = document.querySelector('.mobile-crop-controls');
    if (controlsContainer) {
        controlsContainer.remove(); // Remove existing controls
    }

    const controls = document.createElement('div');
    controls.className = 'mobile-crop-controls mt-3 text-center';
    controls.innerHTML = `
        <div class="btn-group mb-2" role="group">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="zoomImage(-0.1)">
                <i class="bi bi-zoom-out"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="resetCrop()">
                <i class="bi bi-arrows-move"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="zoomImage(0.1)">
                <i class="bi bi-zoom-in"></i>
            </button>
        </div>
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="rotateImage(-90)">
                <i class="bi bi-arrow-counterclockwise"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="rotateImage(90)">
                <i class="bi bi-arrow-clockwise"></i>
            </button>
        </div>
    `;

    const previewContainer = document.querySelector('.col-md-4');
    if (previewContainer) {
        previewContainer.appendChild(controls);
    }
}

// Enhanced zoom function for mobile
function zoomImage(ratio) {
    if (cropper) {
        cropper.zoom(ratio);
    }
}

// Reset crop to center
function resetCrop() {
    if (cropper) {
        cropper.reset();
    }
}

// Rotate image
function rotateImage(degrees) {
    if (cropper) {
        cropper.rotate(degrees);
    }
}

// Update preview manually (for better mobile performance)
function updatePreview() {
    if (!cropper) return;
    
    try {
        const canvas = cropper.getCroppedCanvas({
            width: 150,
            height: 150,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
        const preview = document.getElementById('cropPreview');
        if (preview && canvas) {
            preview.innerHTML = '';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.borderRadius = '50%';
            preview.appendChild(canvas);
        }
    } catch (error) {
        console.warn('Preview update failed:', error);
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
    
    // Properly destroy cropper and clear image
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    
    // Clear the crop image source
    const cropImage = document.getElementById('cropImage');
    if (cropImage) {
        cropImage.src = '';
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
    if (!cropper || !selectedFile) return;

    const canvas = cropper.getCroppedCanvas({
        width: 500,
        height: 500,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });

    canvas.toBlob(function(blob) {
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
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('Profile image updated successfully!', 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                showAlert(data.error || 'An error occurred while uploading the image.', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
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
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Profile picture deleted successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showAlert(data.error || 'An error occurred while deleting the profile picture.', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('An error occurred while deleting the profile picture.', 'danger');
    })
    .finally(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        if (modal) {
            modal.hide();
        }
    });
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the modal body or main content
    const modalBody = document.querySelector('#imageCropModal .modal-body, #deleteConfirmModal .modal-body');
    if (modalBody) {
        modalBody.insertBefore(alertDiv, modalBody.firstChild);
    } else {
        // Fallback: insert at top of main content
        const mainContent = document.querySelector('.section.profile');
        if (mainContent) {
            mainContent.insertBefore(alertDiv, mainContent.firstChild);
        }
    }
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Touch event handlers for better mobile experience
function addTouchSupport() {
    const cropContainer = document.querySelector('.cropper-container');
    if (!cropContainer) return;

    let startDistance = 0;
    let startScale = 1;

    // Handle pinch-to-zoom on mobile
    cropContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2 && cropper) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            startDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            startScale = cropper.getImageData().scaleX;
        }
    }, { passive: false });

    cropContainer.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2 && cropper) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            if (startDistance > 0) {
                const scale = (currentDistance / startDistance) * startScale;
                const ratio = scale / startScale;
                cropper.zoom(ratio - 1);
                startScale = scale;
            }
        }
    }, { passive: false });

    cropContainer.addEventListener('touchend', function(e) {
        if (e.touches.length < 2) {
            startDistance = 0;
            startScale = 1;
        }
    });
}

// Initialize touch support when cropper is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add touch support after a short delay to ensure DOM is ready
    setTimeout(addTouchSupport, 100);
});

/*let cropper = null;
let selectedFile = null;

// Open image crop modal
function openImageCropModal() {
    const modal = new bootstrap.Modal(document.getElementById('imageCropModal'));
    modal.show();
    resetModal();
}

// Reset modal to initial state
function resetModal() {
    document.getElementById('fileUploadSection').style.display = 'block';
    document.getElementById('cropSection').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('cropAndUpload').disabled = true;
    clearSelectedFile();
}

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

    // Create image to check dimensions
    const img = new Image();
    img.onload = function() {
        // Check minimum dimensions
        if (this.width < 500 || this.height < 500) {
            showAlert('Image must be at least 500x500 pixels. This image is ' + this.width + 'x' + this.height + ' pixels.', 'danger');
            clearSelectedFile();
            return;
        }

        // Initialize cropper
        initializeCropper(this.src);
    };

    const reader = new FileReader();
    reader.onload = function(e) {
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Initialize cropper with mobile-friendly settings
function initializeCropper(imageSrc) {
    document.getElementById('fileUploadSection').style.display = 'none';
    document.getElementById('cropSection').style.display = 'block';
    
    const cropImage = document.getElementById('cropImage');
    cropImage.src = imageSrc;

    // Destroy existing cropper if it exists
    if (cropper) {
        cropper.destroy();
    }

    // Detect if device is mobile/touch
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                    ('ontouchstart' in window) || 
                    (navigator.maxTouchPoints > 0);

    cropper = new Cropper(cropImage, {
        aspectRatio: 1,
        viewMode: 1,
        guides: true,
        center: true,
        highlight: true,
        background: true,
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
        preview: '#cropPreview',
        
        // Mobile-friendly zoom settings
        zoomable: true,
        zoomOnTouch: isMobile,
        zoomOnWheel: !isMobile, // Disable wheel zoom on mobile
        wheelZoomRatio: 0.1,
        touchDragZoom: isMobile,
        
        // Mobile-friendly crop box settings
        minCropBoxWidth: 50,
        minCropBoxHeight: 50,
        
        ready: function() {
            document.getElementById('cropAndUpload').disabled = false;
            
            // Add mobile-specific controls
            if (isMobile) {
                addMobileControls();
            }
        },
        
        // Enhanced crop events for better mobile experience
        crop: function(event) {
            // Update preview in real-time
            updatePreview();
        }
    });
}

// Add mobile-specific zoom and pan controls
function addMobileControls() {
    const controlsContainer = document.querySelector('.mobile-crop-controls');
    if (controlsContainer) {
        controlsContainer.remove(); // Remove existing controls
    }

    const controls = document.createElement('div');
    controls.className = 'mobile-crop-controls mt-3 text-center';
    controls.innerHTML = `
        <div class="btn-group mb-2" role="group">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="zoomImage(-0.1)">
                <i class="bi bi-zoom-out"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="resetCrop()">
                <i class="bi bi-arrows-move"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="zoomImage(0.1)">
                <i class="bi bi-zoom-in"></i>
            </button>
        </div>
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="rotateImage(-90)">
                <i class="bi bi-arrow-counterclockwise"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="rotateImage(90)">
                <i class="bi bi-arrow-clockwise"></i>
            </button>
        </div>
    `;

    const previewContainer = document.querySelector('.col-md-4');
    if (previewContainer) {
        previewContainer.appendChild(controls);
    }
}

// Enhanced zoom function for mobile
function zoomImage(ratio) {
    if (cropper) {
        cropper.zoom(ratio);
    }
}

// Reset crop to center
function resetCrop() {
    if (cropper) {
        cropper.reset();
    }
}

// Rotate image
function rotateImage(degrees) {
    if (cropper) {
        cropper.rotate(degrees);
    }
}

// Update preview manually (for better mobile performance)
function updatePreview() {
    if (!cropper) return;
    
    const canvas = cropper.getCroppedCanvas({
        width: 150,
        height: 150,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });
    
    const preview = document.getElementById('cropPreview');
    preview.innerHTML = '';
    preview.appendChild(canvas);
}

// Clear selected file
function clearSelectedFile() {
    selectedFile = null;
    const fileInput = document.getElementById('imageFileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    document.getElementById('fileInfo').style.display = 'none';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    
    // Remove mobile controls
    const controlsContainer = document.querySelector('.mobile-crop-controls');
    if (controlsContainer) {
        controlsContainer.remove();
    }
}

// Crop and upload image
function cropAndUpload() {
    if (!cropper || !selectedFile) return;

    const canvas = cropper.getCroppedCanvas({
        width: 500,
        height: 500,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });

    canvas.toBlob(function(blob) {
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
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('Profile image updated successfully!', 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                showAlert(data.error || 'An error occurred while uploading the image.', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
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
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Profile picture deleted successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showAlert(data.error || 'An error occurred while deleting the profile picture.', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('An error occurred while deleting the profile picture.', 'danger');
    })
    .finally(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        if (modal) {
            modal.hide();
        }
    });
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the modal body or main content
    const modalBody = document.querySelector('#imageCropModal .modal-body, #deleteConfirmModal .modal-body');
    if (modalBody) {
        modalBody.insertBefore(alertDiv, modalBody.firstChild);
    } else {
        // Fallback: insert at top of main content
        const mainContent = document.querySelector('.section.profile');
        if (mainContent) {
            mainContent.insertBefore(alertDiv, mainContent.firstChild);
        }
    }
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Touch event handlers for better mobile experience
function addTouchSupport() {
    const cropContainer = document.querySelector('.cropper-container');
    if (!cropContainer) return;

    let startDistance = 0;
    let startScale = 1;

    // Handle pinch-to-zoom on mobile
    cropContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2 && cropper) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            startDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            startScale = cropper.getImageData().scaleX;
        }
    }, { passive: false });

    cropContainer.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2 && cropper) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            if (startDistance > 0) {
                const scale = (currentDistance / startDistance) * startScale;
                const ratio = scale / startScale;
                cropper.zoom(ratio - 1);
                startScale = scale;
            }
        }
    }, { passive: false });

    cropContainer.addEventListener('touchend', function(e) {
        if (e.touches.length < 2) {
            startDistance = 0;
            startScale = 1;
        }
    });
}

// Initialize touch support when cropper is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add touch support after a short delay to ensure DOM is ready
    setTimeout(addTouchSupport, 100);
});*/

/* // profile-image-crop.js
let cropper = null;
let selectedFile = null;
let touchStartDistance = 0;
let currentScale = 1;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeImageCrop();
    handleActiveTabPersistence();
});

// Initialize image crop functionality
function initializeImageCrop() {
    const fileInput = document.getElementById('imageFileInput');
    const dropZone = document.querySelector('.file-drop-zone');
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleFileSelect(file);
            }
        });
    }

    if (dropZone) {
        setupDragAndDrop(dropZone);
    }
}

// Setup drag and drop functionality
function setupDragAndDrop(dropZone) {
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

// Open image crop modal
function openImageCropModal() {
    const modal = new bootstrap.Modal(document.getElementById('imageCropModal'));
    modal.show();
    resetModal();
}

// Reset modal to initial state
function resetModal() {
    document.getElementById('fileUploadSection').style.display = 'block';
    document.getElementById('cropSection').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('cropAndUpload').disabled = true;
    clearSelectedFile();
}

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

    // Create image to check dimensions
    const img = new Image();
    img.onload = function() {
        // Check minimum dimensions
        if (this.width < 500 || this.height < 500) {
            showAlert('Image must be at least 500x500 pixels. This image is ' + this.width + 'x' + this.height + ' pixels.', 'danger');
            clearSelectedFile();
            return;
        }

        // Initialize cropper
        initializeCropper(this.src);
    };

    const reader = new FileReader();
    reader.onload = function(e) {
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Initialize cropper with mobile-friendly options
function initializeCropper(imageSrc) {
    document.getElementById('fileUploadSection').style.display = 'none';
    document.getElementById('cropSection').style.display = 'block';
    
    const cropImage = document.getElementById('cropImage');
    cropImage.src = imageSrc;

    // Destroy existing cropper if it exists
    if (cropper) {
        cropper.destroy();
    }

    cropper = new Cropper(cropImage, {
        aspectRatio: 1,
        viewMode: 1,
        guides: true,
        center: true,
        highlight: true,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        preview: '#cropPreview',
        responsive: true,
        restore: false,
        checkCrossOrigin: false,
        checkOrientation: true,
        modal: true,
        guides: true,
        center: true,
        highlight: true,
        background: true,
        autoCrop: true,
        autoCropArea: 0.8,
        movable: true,
        rotatable: true,
        scalable: true,
        zoomable: true,
        zoomOnTouch: true,
        zoomOnWheel: true,
        wheelZoomRatio: 0.1,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        ready: function() {
            document.getElementById('cropAndUpload').disabled = false;
            setupMobileControls();
        },
        cropstart: function (e) {
            // Handle crop start event
        },
        cropmove: function(e) {
        },
        cropend: function(e) {
        }
    });

    // Add mobile-specific event listeners
    setupMobileTouchEvents(cropImage);
}

// Setup mobile touch events for better mobile experience
function setupMobileTouchEvents(element) {
    let initialDistance = 0;
    let initialScale = 1;

    element.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
            initialScale = cropper.getImageData().scaleX;
        }
    }, { passive: false });

    element.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2 && cropper) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
            
            if (initialDistance > 0) {
                const scale = (currentDistance / initialDistance) * initialScale;
                const minScale = 0.1;
                const maxScale = 3;
                const clampedScale = Math.min(Math.max(scale, minScale), maxScale);
                cropper.scale(clampedScale / cropper.getImageData().scaleX);
            }
        }
    }, { passive: false });

    element.addEventListener('touchend', function(e) {
        if (e.touches.length < 2) {
            initialDistance = 0;
        }
    });
}

// Setup mobile-friendly controls
function setupMobileControls() {
    const cropSection = document.getElementById('cropSection');
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile && cropSection) {
        // Add mobile-specific controls
        const mobileControls = document.createElement('div');
        mobileControls.className = 'mobile-controls mt-3 text-center';
        mobileControls.innerHTML = `
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="zoomImage(-0.1)">
                    <i class="bi bi-dash"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="resetZoom()">
                    <i class="bi bi-arrows-fullscreen"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="zoomImage(0.1)">
                    <i class="bi bi-plus"></i>
                </button>
            </div>
            <div class="btn-group ms-2" role="group">
                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="rotateImage(-90)">
                    <i class="bi bi-arrow-counterclockwise"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="rotateImage(90)">
                    <i class="bi bi-arrow-clockwise"></i>
                </button>
            </div>
        `;
        
        // Insert after the row containing cropper and preview
        const row = cropSection.querySelector('.row');
        if (row && !cropSection.querySelector('.mobile-controls')) {
            row.parentNode.insertBefore(mobileControls, row.nextSibling);
        }
    }
}

// Zoom image (mobile-friendly)
function zoomImage(ratio) {
    if (cropper) {
        cropper.zoom(ratio);
    }
}

// Reset zoom
function resetZoom() {
    if (cropper) {
        cropper.reset();
    }
}

// Rotate image
function rotateImage(degrees) {
    if (cropper) {
        cropper.rotate(degrees);
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
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    // Remove mobile controls if they exist
    const mobileControls = document.querySelector('.mobile-controls');
    if (mobileControls) {
        mobileControls.remove();
    }
}

// Crop and upload image
function cropAndUpload() {
    if (!cropper || !selectedFile) return;

    const canvas = cropper.getCroppedCanvas({
        width: 500,
        height: 500,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });

    canvas.toBlob(function(blob) {
        // Get CSRF token dynamically
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
                         document.querySelector('meta[name=csrf-token]')?.getAttribute('content');

        const formData = new FormData();
        formData.append('profile_pic', blob, 'profile_image.jpg');
        formData.append('form_type', 'profile');
        formData.append('csrfmiddlewaretoken', csrfToken);

        // Show loading state
        const uploadBtn = document.getElementById('cropAndUpload');
        const originalText = uploadBtn.innerHTML;
        uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Uploading...';
        uploadBtn.disabled = true;

        // Get the current URL for the upload endpoint
        const uploadUrl = window.location.pathname;

        fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('Profile image updated successfully!', 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                showAlert(data.error || 'An error occurred while uploading the image.', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
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
}

// Confirm delete profile picture
function confirmDeleteProfilePic() {
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
}

// Delete profile picture
function deleteProfilePic() {
    // Get CSRF token dynamically
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
                     document.querySelector('meta[name=csrf-token]')?.getAttribute('content');

    fetch(window.location.pathname, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: 'delete_profile_pic=true'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Profile picture deleted successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showAlert(data.error || 'An error occurred while deleting the profile picture.', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('An error occurred while deleting the profile picture.', 'danger');
    })
    .finally(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        if (modal) {
            modal.hide();
        }
    });
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the modal body or main content
    const modalBody = document.querySelector('#imageCropModal .modal-body, #deleteConfirmModal .modal-body');
    if (modalBody) {
        modalBody.insertBefore(alertDiv, modalBody.firstChild);
    } else {
        // Fallback: insert at top of main content
        const mainContent = document.querySelector('.section.profile');
        if (mainContent) {
            mainContent.insertBefore(alertDiv, mainContent.firstChild);
        }
    }
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Handle active tab persistence
function handleActiveTabPersistence() {
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
}

// Handle responsive behavior
window.addEventListener('resize', function() {
    if (cropper) {
        // Refresh cropper on window resize
        setTimeout(() => {
            cropper.resize();
        }, 100);
    }
});

// Prevent zoom on double tap for better mobile UX
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

let lastTouchEnd = 0;
 */
