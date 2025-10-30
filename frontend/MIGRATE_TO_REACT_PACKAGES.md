# Migrate to React-Based Packages

## Current Vanilla JS Libraries → React Equivalents

### Libraries to Replace

| Current (Vanilla JS) | React Alternative | Purpose |
|---------------------|-------------------|---------|
| `bootstrap.bundle.min.js` | `react-bootstrap` | Bootstrap components |
| `aos.js` | `aos` | Scroll animations |
| `typed.umd.js` | `react-typed` | Typing animations |
| `glightbox.min.js` | `yet-another-react-lightbox` | Image lightbox |
| `swiper-bundle.min.js` | `swiper` (React) | Carousels/Sliders |
| `isotope.pkgd.min.js` | `react-masonry-css` | Masonry layouts |
| `purecounter_vanilla.js` | `react-countup` | Number animations |
| `waypoints.js` | `react-intersection-observer` | Scroll triggers |
| `imagesloaded.pkgd.min.js` | Built into React | Image loading |
| `validate.js` | `react-hook-form` + `zod` | Form validation |

## Installation

### Step 1: Install All Packages

```bash
cd frontend
npm install react-bootstrap bootstrap@5.3.0 bootstrap-icons animate.css remixicon aos react-typed yet-another-react-lightbox swiper react-masonry-css react-countup react-intersection-observer react-hook-form zod @hookform/resolvers
```

### Step 2: Install Type Definitions (TypeScript)

```bash
npm install --save-dev @types/aos
```

## Implementation

### 1. Update App.tsx

The imports and initialization are now in `App.tsx` instead of `index.html`.

### 2. Remove Scripts from index.html

Remove these lines from `index.html`:
```html
<!-- REMOVE THESE -->
<script src="/static/assets/vendor/aos/aos.js"></script>
<script src="/static/assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="/static/assets/vendor/validate-forms/validate.js"></script>
<script src="/static/assets/vendor/typed.js/typed.umd.js"></script>
<script src="/static/assets/vendor/purecounter/purecounter_vanilla.js"></script>
<script src="/static/assets/vendor/waypoints/noframework.waypoints.js"></script>
<script src="/static/assets/vendor/glightbox/js/glightbox.min.js"></script>
<script src="/static/assets/vendor/imagesloaded/imagesloaded.pkgd.min.js"></script>
<script src="/static/assets/vendor/isotope-layout/isotope.pkgd.min.js"></script>
<script src="/static/assets/vendor/swiper/swiper-bundle.min.js"></script>
```

### 3. Component Usage Examples

#### React Bootstrap
```tsx
import { Button, Modal, Card, Nav } from 'react-bootstrap';

function MyComponent() {
  return (
    <Button variant="primary">Click Me</Button>
  );
}
```

#### AOS (Animate On Scroll)
```tsx
import { useEffect } from 'react';

function MyComponent() {
  return (
    <div data-aos="fade-up" data-aos-duration="1000">
      Content with animation
    </div>
  );
}
```

#### React Typed
```tsx
import { ReactTyped } from 'react-typed';

function Hero() {
  return (
    <ReactTyped
      strings={['Developer', 'Designer', 'Creator']}
      typeSpeed={40}
      backSpeed={50}
      loop
    />
  );
}
```

#### Swiper (React)
```tsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

function Carousel() {
  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
    >
      <SwiperSlide>Slide 1</SwiperSlide>
      <SwiperSlide>Slide 2</SwiperSlide>
    </Swiper>
  );
}
```

#### React CountUp
```tsx
import CountUp from 'react-countup';

function Stats() {
  return (
    <CountUp end={100} duration={2.5} />
  );
}
```

#### React Intersection Observer
```tsx
import { useInView } from 'react-intersection-observer';

function LazyComponent() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div ref={ref}>
      {inView && <div>Content loaded!</div>}
    </div>
  );
}
```

#### Yet Another React Lightbox
```tsx
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

function Gallery() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Lightbox</button>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[
          { src: '/image1.jpg' },
          { src: '/image2.jpg' },
        ]}
      />
    </>
  );
}
```

## Benefits

### 1. Type Safety ✅
- Full TypeScript support
- Autocomplete in IDE
- Compile-time error checking

### 2. Better Performance ✅
- Tree shaking (only import what you use)
- React-optimized rendering
- No global namespace pollution

### 3. Easier Maintenance ✅
- npm manages versions
- Easy to update
- Better dependency tracking

### 4. Better Integration ✅
- Works with React lifecycle
- Can use hooks
- Proper cleanup on unmount

### 5. Testing ✅
- Can mock components
- Easier to test
- Better test coverage

## Migration Checklist

- [x] Install React packages
- [x] Update App.tsx with imports
- [ ] Remove vanilla JS scripts from index.html
- [ ] Update components to use React versions
- [ ] Test all functionality
- [ ] Remove unused vendor files from public/static

## Notes

- Bootstrap CSS is still loaded from CDN or vendor files (that's fine)
- AOS CSS needs to be imported in App.tsx
- Swiper CSS needs to be imported where used
- Some vendor CSS files can stay (glightbox, remixicon, etc.)

## Troubleshooting

### Issue: Bootstrap components not styled
**Solution**: Make sure Bootstrap CSS is imported:
```tsx
import 'bootstrap/dist/css/bootstrap.min.css';
```

### Issue: AOS animations not working
**Solution**: Initialize AOS in useEffect:
```tsx
useEffect(() => {
  AOS.init();
}, []);
```

### Issue: Swiper styles missing
**Solution**: Import Swiper CSS:
```tsx
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
```

---

**Status**: Ready to implement  
**Date**: October 30, 2025
