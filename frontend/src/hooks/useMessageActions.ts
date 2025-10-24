/**
 * Custom hook for message actions
 */

import { useState, useCallback } from 'react';
import { messageService } from '../services/messageService';
import type { Message } from '../types/message';

export const useMessageActions = (onSuccess?: () => void) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);

  /**
   * Toggle message selection
   */
  const toggleSelect = useCallback((messageId: number) => {
    setSelectedIds(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  }, []);

  /**
   * Select all messages
   */
  const selectAll = useCallback((messages: Message[]) => {
    setSelectedIds(messages.map(m => m.id));
  }, []);

  /**
   * Deselect all messages
   */
  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  /**
   * Check if message is selected
   */
  const isSelected = useCallback((messageId: number) => {
    return selectedIds.includes(messageId);
  }, [selectedIds]);

  /**
   * Mark single message as read
   */
  const markAsRead = useCallback(async (messageId: number) => {
    try {
      setProcessing(true);
      await messageService.markAsRead(messageId);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to mark message as read:', err);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [onSuccess]);

  /**
   * Mark single message as unread
   */
  const markAsUnread = useCallback(async (messageId: number) => {
    try {
      setProcessing(true);
      await messageService.markAsUnread(messageId);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to mark message as unread:', err);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [onSuccess]);

  /**
   * Delete single message
   */
  const deleteMessage = useCallback(async (messageId: number) => {
    try {
      setProcessing(true);
      await messageService.deleteMessage(messageId);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to delete message:', err);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [onSuccess]);

  /**
   * Bulk mark as read
   */
  const bulkMarkAsRead = useCallback(async () => {
    if (selectedIds.length === 0) return;

    try {
      setProcessing(true);
      await messageService.bulkAction({
        action: 'mark_read',
        message_ids: selectedIds
      });
      deselectAll();
      onSuccess?.();
    } catch (err) {
      console.error('Failed to bulk mark as read:', err);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [selectedIds, deselectAll, onSuccess]);

  /**
   * Bulk mark as unread
   */
  const bulkMarkAsUnread = useCallback(async () => {
    if (selectedIds.length === 0) return;

    try {
      setProcessing(true);
      await messageService.bulkAction({
        action: 'mark_unread',
        message_ids: selectedIds
      });
      deselectAll();
      onSuccess?.();
    } catch (err) {
      console.error('Failed to bulk mark as unread:', err);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [selectedIds, deselectAll, onSuccess]);

  /**
   * Bulk delete
   */
  const bulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;

    try {
      setProcessing(true);
      await messageService.bulkAction({
        action: 'delete',
        message_ids: selectedIds
      });
      deselectAll();
      onSuccess?.();
    } catch (err) {
      console.error('Failed to bulk delete:', err);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [selectedIds, deselectAll, onSuccess]);

  return {
    selectedIds,
    processing,
    toggleSelect,
    selectAll,
    deselectAll,
    isSelected,
    markAsRead,
    markAsUnread,
    deleteMessage,
    bulkMarkAsRead,
    bulkMarkAsUnread,
    bulkDelete
  };
};
