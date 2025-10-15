/**
 * Cross-tab synchronization service
 * Uses BroadcastChannel API (modern browsers) with localStorage events as fallback
 */

import { User } from './authService';

// Message types for cross-tab communication
export type TabSyncMessageType = 
  | 'AUTH_LOGIN' 
  | 'AUTH_LOGOUT' 
  | 'AUTH_SIGNUP' 
  | 'THEME_CHANGE'
  | 'EDIT_START'
  | 'EDIT_END'
  | 'CONTENT_UPDATED';

export interface TabSyncMessage {
  type: TabSyncMessageType;
  payload: {
    user?: User | null;
    theme?: 'light' | 'dark';
    // Edit state tracking
    editType?: 'about' | 'blog' | 'project';
    editSection?: string; // For about page sections or slug for blog/project
    editUser?: string; // Username of the person editing
    // Content update tracking
    contentType?: 'about' | 'blog' | 'project';
    contentId?: string; // Slug or identifier
    timestamp: number;
  };
}

export type TabSyncListener = (_message: TabSyncMessage) => void;

class TabSyncService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<TabSyncListener> = new Set();
  private readonly CHANNEL_NAME = 'portfolio-tab-sync';
  private storageListenerActive = false;

  constructor() {
    this.initializeBroadcastChannel();
    this.initializeStorageListener();
  }

  /**
   * Initialize BroadcastChannel for modern browsers
   */
  private initializeBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(this.CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<TabSyncMessage>) => {
          this.notifyListeners(event.data);
        };
      } catch (error) {
        // BroadcastChannel not available, using storage events as fallback
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') console.warn('BroadcastChannel not available:', error);
        this.channel = null;
      }
    }
  }

  /**
   * Initialize storage event listener as fallback
   */
  private initializeStorageListener() {
    if (this.storageListenerActive) return;

    window.addEventListener('storage', (event: StorageEvent) => {
      // Storage events only fire in other tabs, not the originating tab
      if (!event.key) return;

      // Handle auth changes
      if (event.key === 'auth_token') {
        if (event.newValue) {
          // Login or signup detected
          const userStr = localStorage.getItem('user');
          const user = userStr ? JSON.parse(userStr) : null;
          this.notifyListeners({
            type: 'AUTH_LOGIN',
            payload: { user, timestamp: Date.now() }
          });
        } else if (event.oldValue && !event.newValue) {
          // Logout detected
          this.notifyListeners({
            type: 'AUTH_LOGOUT',
            payload: { user: null, timestamp: Date.now() }
          });
        }
      }

      // Handle theme changes
      if (event.key === 'theme' && event.newValue) {
        this.notifyListeners({
          type: 'THEME_CHANGE',
          payload: { 
            theme: event.newValue as 'light' | 'dark', 
            timestamp: Date.now() 
          }
        });
      }
    });

    this.storageListenerActive = true;
  }

  /**
   * Broadcast a message to all other tabs
   */
  broadcast(message: TabSyncMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (error) {
        // Failed to broadcast message - silently fail as storage events will handle it
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') console.error('Failed to broadcast message:', error);
      }
    }
    // If BroadcastChannel is not available, storage events will handle it
  }

  /**
   * Add a listener for cross-tab messages
   */
  addListener(listener: TabSyncListener) {
    this.listeners.add(listener);
  }

  /**
   * Remove a listener
   */
  removeListener(listener: TabSyncListener) {
    this.listeners.delete(listener);
  }

  /**
   * Notify all registered listeners
   */
  private notifyListeners(message: TabSyncMessage) {
    this.listeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        // Error in tab sync listener - silently fail to avoid breaking other listeners
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') console.error('Error in tab sync listener:', error);
      }
    });
  }

  /**
   * Broadcast auth login event
   */
  broadcastLogin(user: User) {
    this.broadcast({
      type: 'AUTH_LOGIN',
      payload: { user, timestamp: Date.now() }
    });
  }

  /**
   * Broadcast auth logout event
   */
  broadcastLogout() {
    this.broadcast({
      type: 'AUTH_LOGOUT',
      payload: { user: null, timestamp: Date.now() }
    });
  }

  /**
   * Broadcast auth signup event
   */
  broadcastSignup(user: User) {
    this.broadcast({
      type: 'AUTH_SIGNUP',
      payload: { user, timestamp: Date.now() }
    });
  }

  /**
   * Broadcast theme change event
   */
  broadcastThemeChange(theme: 'light' | 'dark') {
    this.broadcast({
      type: 'THEME_CHANGE',
      payload: { theme, timestamp: Date.now() }
    });
  }

  /**
   * Broadcast edit start event
   */
  broadcastEditStart(editType: 'about' | 'blog' | 'project', editSection: string, editUser?: string) {
    this.broadcast({
      type: 'EDIT_START',
      payload: { 
        editType, 
        editSection, 
        editUser,
        timestamp: Date.now() 
      }
    });
  }

  /**
   * Broadcast edit end event
   */
  broadcastEditEnd(editType: 'about' | 'blog' | 'project', editSection: string) {
    this.broadcast({
      type: 'EDIT_END',
      payload: { 
        editType, 
        editSection,
        timestamp: Date.now() 
      }
    });
  }

  /**
   * Broadcast content updated event
   */
  broadcastContentUpdate(contentType: 'about' | 'blog' | 'project', contentId?: string) {
    this.broadcast({
      type: 'CONTENT_UPDATED',
      payload: { 
        contentType, 
        contentId,
        timestamp: Date.now() 
      }
    });
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const tabSyncService = new TabSyncService();
