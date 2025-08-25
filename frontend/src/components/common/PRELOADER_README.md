# Enhanced Preloader System

The portfolio now includes a comprehensive preloader system similar to the original Django project implementation.

## Features

1. **Initial App Load Preloader** - Shows the colorful spinner array during app initialization
2. **Route Transition Loading** - Shows a subtle loading bar during page navigation
3. **Manual Loading States** - Can be triggered programmatically for any operation
4. **Context-based Management** - Centralized loading state management

## Components

### Preloader Component
- `Preloader` - Main preloader with multiple colored spinners
- Supports both full-page and route transition modes
- Automatically handles initial app load and route changes

### Loading Context
- `LoadingProvider` - Context provider for managing loading states
- `useLoading` - Hook for accessing loading context
- `usePreloader` - Convenient hook for triggering loaders

### Higher-Order Components
- `WithLoading` - HOC for wrapping components with loading states
- `RouteTransition` - Handles route-based loading transitions

## Usage Examples

### Basic Usage
```tsx
import { usePreloader } from '../../hooks/usePreloader';

const MyComponent = () => {
  const { showLoader, hideLoader } = usePreloader();
  
  const handleAction = async () => {
    showLoader();
    try {
      await someAsyncOperation();
    } finally {
      hideLoader();
    }
  };
};
```

### With Loading HOC
```tsx
import { withLoading } from '../../components/hoc/WithLoading';

const MyComponent = ({ data, isLoading }) => {
  return <div>{data ? 'Loaded!' : 'No data'}</div>;
};

export default withLoading(MyComponent);
```

## CSS Classes

- `#preloader` - Main preloader container
- `.route-loading` - Route transition loading bar
- `.fade-out` - Fade-out animation

## Integration

The preloader is automatically integrated into the main App component and will:
- Show during initial app load for 800ms
- Display route transitions
- Respond to manual loading state triggers
- Use the same visual style as the original Django project
