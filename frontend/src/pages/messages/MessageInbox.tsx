/**
 * MessageInbox Page Component
 * Main inbox container combining all message components
 */

import React, { useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useMessageActions } from '@/hooks/useMessageActions';
import { InboxSidebar } from '@/components/messages/InboxSidebar';
import { MessageToolbar } from '@/components/messages/MessageToolbar';
import { MessageList } from '@/components/messages/MessageList';
import { MessageDetailModal } from '@/components/messages/MessageDetailModal';
import type { Message } from '@/types/message';

export const MessageInbox: React.FC = () => {
  const {
    messages,
    stats,
    loading,
    error,
    pagination,
    filters,
    setFilter,
    setSearch,
    refresh
  } = useMessages();

  const {
    selectedIds,
    processing,
    toggleSelect,
    selectAll,
    deselectAll,
    markAsRead,
    markAsUnread,
    deleteMessage,
    bulkMarkAsRead,
    bulkMarkAsUnread,
    bulkDelete
  } = useMessageActions(refresh);

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      deselectAll();
    } else {
      selectAll(messages);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} message(s)?`)) {
      await bulkDelete();
    }
  };

  return (
    <div className="min-vh-100">
      <section className="section contact">
        <div className="container-fluid">
          <div className="row" id="inbox-layout">
            {/* Sidebar */}
            <div className="col-12 col-md-4 col-lg-3" id="inbox-sidebar-wrapper">
              <InboxSidebar
                stats={stats}
                currentFilter={filters.filter}
                onFilterChange={setFilter}
              />
            </div>

            {/* Main Content */}
            <div id="inbox-main" className="col-12 col-md-8 col-lg-9">
              <div className="inbox-main">
                {/* Toolbar */}
                <MessageToolbar
                  messages={messages}
                  selectedIds={selectedIds}
                  searchQuery={filters.search}
                  onSearchChange={setSearch}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={deselectAll}
                  onBulkMarkAsRead={bulkMarkAsRead}
                  onBulkMarkAsUnread={bulkMarkAsUnread}
                  onBulkDelete={handleBulkDelete}
                  processing={processing}
                />

                {/* Error Display */}
                {error && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Messages List */}
                <MessageList
                  messages={messages}
                  selectedIds={selectedIds}
                  loading={loading}
                  onToggleSelect={toggleSelect}
                  onViewMessage={handleViewMessage}
                  onMarkAsRead={markAsRead}
                  onMarkAsUnread={markAsUnread}
                  onDeleteMessage={deleteMessage}
                  processing={processing}
                />

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <nav>
                      <ul className="pagination">
                        <li className={`page-item ${!pagination.has_previous ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setFilter(filters.filter)}
                            disabled={!pagination.has_previous}
                          >
                            Previous
                          </button>
                        </li>
                        
                        {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(page => (
                          <li key={page} className={`page-item ${page === pagination.page ? 'active' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setFilter(filters.filter)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}
                        
                        <li className={`page-item ${!pagination.has_next ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setFilter(filters.filter)}
                            disabled={!pagination.has_next}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Message Detail Modal */}
      <MessageDetailModal
        message={selectedMessage}
        isOpen={showModal}
        onClose={handleCloseModal}
        onMarkAsRead={markAsRead}
        onMarkAsUnread={markAsUnread}
        onDelete={deleteMessage}
        processing={processing}
      />
    </div>
  );
};
