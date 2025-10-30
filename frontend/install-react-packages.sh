#!/bin/bash

# Install React-based packages to replace vanilla JS libraries
# Run this from the frontend directory: ./install-react-packages.sh

cd /home/rohn/GitHub/portfolio/frontend/
echo "🚀 Installing React-based packages..."
echo ""

# Core packages
echo "📦 Installing core packages..."
npm install aos react-bootstrap bootstrap@5.3.0 bootstrap-icons animate.css remixicon

# Animation and interaction packages
echo "📦 Installing animation packages..."
npm install react-typed react-countup react-intersection-observer

# Media and layout packages
echo "📦 Installing media packages..."
npm install swiper yet-another-react-lightbox react-masonry-css

# Image cropping for profile (already mentioned in previous docs)
echo "📦 Installing image cropping..."
npm install react-image-crop

# Type definitions
echo "📦 Installing TypeScript definitions..."
npm install --save-dev @types/aos

echo ""
echo "✅ All packages installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Restart your development server: npm start"
echo "2. The vanilla JS scripts have been removed from index.html"
echo "3. React equivalents are now imported in App.tsx"
echo ""
echo "📚 See MIGRATE_TO_REACT_PACKAGES.md for usage examples"
