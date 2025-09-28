# Wagtail Timeout Fix Documentation

## Problem Description

You were experiencing HTTP 500 errors when saving Wagtail posts after editing for more than 1 minute. This issue was more prevalent in production (Render) than in local development.

## Root Causes Identified

1. **Aggressive Redis Socket Timeouts**: Redis connection timeouts were set to only 5 seconds, causing connection drops during long editing sessions
2. **Session Configuration Issues**: While `SESSION_SAVE_EVERY_REQUEST = True` was set, the Redis backend was timing out before sessions could be properly saved
3. **Missing Wagtail-specific Timeout Settings**: No specific timeout configurations for Wagtail admin operations
4. **Database Connection Timeouts**: No explicit database timeout settings for production environment

## Solutions Implemented

### 1. Redis Configuration Improvements

**File**: `portfolio/settings.py`

```python
# Before
"SOCKET_CONNECT_TIMEOUT": 5,
"SOCKET_TIMEOUT": 5,

# After
"SOCKET_CONNECT_TIMEOUT": 30,
"SOCKET_TIMEOUT": 60,
```

**Changes**:

- Increased connection timeout from 5 to 30 seconds
- Increased socket timeout from 5 to 60 seconds
- Increased max connections from 10 to 20
- Added additional keepalive options

### 2. Enhanced Session Configuration

**File**: `portfolio/settings.py`

```python
# Additional session settings for long editing sessions
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_ENGINE_TIMEOUT = 3600  # 1 hour timeout for session engine operations
```

### 3. Wagtail-Specific Timeout Settings

**File**: `portfolio/settings.py`

```python
# Wagtail-specific timeout and session settings
WAGTAILADMIN_TIMEOUT = 300  # 5 minutes timeout for admin operations
WAGTAILADMIN_SESSION_TIMEOUT = 3600  # 1 hour session timeout for admin
WAGTAILADMIN_AUTO_SAVE_INTERVAL = 30  # Auto-save every 30 seconds
```

### 4. Database Connection Timeouts

**File**: `portfolio/settings.py`

```python
"OPTIONS": {
    "connect_timeout": 30,
    "options": "-c statement_timeout=300000",  # 5 minutes
},
"CONN_MAX_AGE": 600,  # 10 minutes connection pooling
```

### 5. Session Keep-Alive JavaScript

**File**: `static/js/wagtail-session-keepalive.js`

- Automatically detects Wagtail admin pages
- Tracks user activity (mouse, keyboard, touch events)
- Sends keep-alive requests every 30 seconds when user is active
- Shows session warnings if connection issues are detected
- Handles page visibility changes (pauses when tab is hidden)

### 6. Wagtail Admin Template Override

**File**: `templates/wagtailadmin/base.html`

- Extends the default Wagtail admin base template
- Includes the session keep-alive script on all admin pages

## Testing the Solution

### Local Testing

1. **Start your development server**:

   ```bash
   python manage.py runserver
   ```

2. **Access Wagtail admin**:
   - Go to `/admin/` or `/cms/`
   - Open browser developer tools (F12)
   - Check console for "Wagtail Session Keep-Alive initialized" message

3. **Test long editing session**:
   - Create or edit a blog post
   - Leave the page open for more than 1 minute while making occasional edits
   - Try to save the post - it should work without HTTP 500 errors

4. **Monitor network requests**:
   - In developer tools, go to Network tab
   - Look for HEAD requests to `/admin/` every 30 seconds when active

### Production Testing

1. **Deploy the changes** to Render
2. **Test the same scenarios** as local testing
3. **Monitor logs** for any Redis or database connection errors
4. **Check session persistence** across long editing sessions

## Monitoring and Debugging

### Check Redis Connection

```python
# In Django shell
from django.core.cache import cache
cache.set('test_key', 'test_value', 30)
print(cache.get('test_key'))
```

### Check Session Status

```python
# In Django shell
from django.contrib.sessions.models import Session
print(f"Active sessions: {Session.objects.count()}")
```

### Browser Console Monitoring

The session keep-alive script logs important events:

- Initialization message
- Session warnings
- Connection errors

## Additional Recommendations

### 1. Monitor Production Logs

Set up logging to track:

- Redis connection errors
- Database timeout errors
- Session-related errors

### 2. Consider Auto-Save Feature

Implement auto-save functionality for Wagtail posts:

- Save drafts every 30 seconds
- Show auto-save status to users
- Handle conflicts between auto-save and manual save

### 3. Database Optimization

Consider:

- Adding database indexes for session-related queries
- Monitoring database performance during peak usage
- Setting up database connection pooling

### 4. Redis Monitoring

Monitor Redis:

- Memory usage
- Connection count
- Response times
- Error rates

## Rollback Plan

If issues occur, you can rollback by:

1. **Revert Redis timeouts** to original values (5 seconds)
2. **Remove Wagtail-specific settings**
3. **Remove the session keep-alive script**
4. **Revert database timeout settings**

## Environment Variables

Ensure these environment variables are set in production:

- `REDIS_URL`: Redis connection string
- `REDIS_PW`: Redis password
- `SUPABASE_DB_NAME`: Database name
- `SUPABASE_USER`: Database user
- `SUPABASE_DB_PW`: Database password
- `SUPABASE_HOST`: Database host
- `SUPABASE_PORT`: Database port

## Support

If you continue to experience issues:

1. Check browser console for JavaScript errors
2. Monitor server logs for Redis/database errors
3. Test with different browsers
4. Verify environment variables are correctly set
5. Check Render service status and logs

The solution addresses the most common causes of Wagtail timeout issues in production environments while maintaining compatibility with your existing setup.
