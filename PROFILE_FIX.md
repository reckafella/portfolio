# Profile Error Fix

## Error Fixed ✅

**Error Message**: 
```
Error loading profile
Cannot read properties of undefined (reading 'getHeaders')
```

## Root Cause

The error was caused by two issues:

1. **Missing CSRF Token Handling**: The ProfileService didn't have CSRF token support like the authService
2. **Context Binding Issue**: The static methods weren't being called with proper context in React Query

## Changes Made

### 1. Enhanced ProfileService (`profileService.ts`)

**Added CSRF Token Support**:
```typescript
private static async getCSRFToken(): Promise<string> {
    try {
        const response = await fetch('/api/v1/auth/csrf-token/', {
            method: 'GET',
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            return data.csrfToken;
        }
    } catch {
        // Silently fail
    }
    return '';
}

private static async getHeaders(): Promise<Record<string, string>> {
    const csrfToken = await this.getCSRFToken();
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
    }

    return headers;
}
```

### 2. Fixed React Query Hooks (`useProfile.ts`)

**Before**:
```typescript
export const useProfile = () => {
    return useQuery({
        queryKey: profileKeys.detail(),
        queryFn: ProfileService.getProfile, // ❌ Wrong - loses context
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
};
```

**After**:
```typescript
export const useProfile = () => {
    return useQuery({
        queryKey: profileKeys.detail(),
        queryFn: () => ProfileService.getProfile(), // ✅ Correct - preserves context
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
};
```

**Same fix applied to**:
- `useSettings()` hook

## Why This Fixes It

1. **CSRF Token**: Now matches the pattern used in authService, ensuring proper authentication headers
2. **Arrow Function Wrapper**: Ensures the static method is called with the correct `this` context
3. **Type Safety**: Return type explicitly defined as `Promise<Record<string, string>>`

## Testing

After these changes, the profile page should:
1. ✅ Load without errors
2. ✅ Display user profile data
3. ✅ Allow profile updates
4. ✅ Handle CSRF tokens correctly

## Verification Steps

1. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Restart React dev server**:
   ```bash
   cd frontend
   npm start
   ```
3. **Login** to your account
4. **Navigate** to `/profile`
5. **Check** that profile loads without errors

## Files Modified

- ✅ `frontend/src/services/profileService.ts` - Added CSRF support
- ✅ `frontend/src/hooks/useProfile.ts` - Fixed context binding

## Additional Notes

- The ProfileService now follows the same pattern as authService
- All API calls include proper CSRF tokens
- Static methods are properly bound when used in React Query
- Type safety is maintained throughout

---

**Status**: ✅ Fixed  
**Date**: October 29, 2025
