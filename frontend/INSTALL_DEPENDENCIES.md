# Install Required Dependencies for Profile Image Upload

## React Image Crop Package

The profile image upload feature requires the `react-image-crop` package for cropping functionality.

## Installation

Run the following command in the `frontend` directory:

```bash
cd frontend
npm install react-image-crop
```

Or if you're using yarn:

```bash
cd frontend
yarn add react-image-crop
```

## Package Details

- **Package**: react-image-crop
- **Purpose**: Provides image cropping functionality with circular crop support
- **Features**:
  - Circular crop for profile pictures
  - Aspect ratio control (1:1 for square profile pictures)
  - Zoom and rotation support
  - Touch/mouse drag support
  - Responsive design

## After Installation

1. Restart your React development server:
   ```bash
   npm start
   ```

2. The profile image upload with cropping should now work!

## Verification

Navigate to `/profile` and click the "Upload" button. You should see:
- File selection dialog
- Image preview with crop area
- Rotation and zoom controls
- Crop & Upload button

---

**Note**: This package is already included in the ProfileImageUpload component implementation.
