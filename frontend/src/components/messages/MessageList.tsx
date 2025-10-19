/**
 * MessageList Component
 * Display list of messages with selection and click to view
 */

import React from 'react';
import { format } from 'date-fns';
import type { Message } from '@/types/message';

interface MessageListProps {
  messages: Message[];
  selectedIds: number[];
  loading: boolean;
  onToggleSelect: (_messageId: number) => void;
  onViewMessage: (_message: Message) => void;
  onMarkAsRead: (_messageId: number) => void;
  onMarkAsUnread: (_messageId: number) => void;
  onDeleteMessage: (_messageId: number) => void;
  processing: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedIds,
  loading,
  onToggleSelect,
  onViewMessage,
  onMarkAsRead,
  onMarkAsUnread,
  onDeleteMessage,
  processing
}) => {
  if (loading) {
    return (
      <div className="inbox-content">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="inbox-content">
        <div className="text-center py-5">
          <i className="bi bi-inbox display-1 text-muted"></i>
          <h4 className="mt-3">No messages found</h4>
          <p className="text-muted">There are no messages to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inbox-content">
      <div className="message-list">
        {messages.map((message) => {
          const isSelected = selectedIds.includes(message.id);
          
          return (
            <div
              key={message.id}
              className={`message-item ${isSelected ? 'selected' : ''} ${!message.is_read ? 'unread' : 'read'}`}
            >
              <div className="message-checkbox">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(message.id)}
                  disabled={processing}
                />
              </div>
              
              <div
                className="message-content"
                onClick={() => onViewMessage(message)}
                style={{ cursor: 'pointer' }}
              >
                <div className="message-header">
                  <div className="message-sender">
                    <strong>{message.name}</strong>
                    <span className="message-email text-muted">({message.email})</span>
                  </div>
                  <div className="message-date">
                    {format(new Date(message.created_at), 'MMM dd, yyyy')}
                  </div>
                </div>
                
                <div className="message-subject">
                  <strong>{message.subject || '(No Subject)'}</strong>
                </div>
                
                <div className="message-preview">
                  {message.message_preview || message.message}
                </div>
              </div>
              
              <div className="message-actions">
                <div className="btn-group" role="group">
                  {!message.is_read ? (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(message.id);
                      }}
                      disabled={processing}
                      title="Mark as read"
                    >
                      <i className="bi bi-envelope-open"></i>
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsUnread(message.id);
                      }}
                      disabled={processing}
                      title="Mark as unread"
                    >
                      <i className="bi bi-envelope"></i>
                    </button>
                  )}
                  
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMessage(message.id);
                    }}
                    disabled={processing}
                    title="Delete message"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
