/**
 * Gmail-like Inbox JavaScript
 * Handles all inbox interactions including search, filtering, bulk actions, and message viewing
 */

class InboxManager {
    constructor() {
        this.selectedMessages = new Set();
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.isLoading = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUrlFromFilters();
        this.initializeTooltips();
    }

    bindEvents() {
        // Search functionality
        this.bindSearchEvents();

        // Folder navigation
        this.bindFolderEvents();

        // Message selection
        this.bindSelectionEvents();

        // Bulk actions
        this.bindBulkActionEvents();

        // Individual message actions
        this.bindMessageActionEvents();

        // Modal events
        this.bindModalEvents();

        // Pagination
        this.bindPaginationEvents();
    }

    bindSearchEvents() {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');

        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }

        if (searchInput) {
            // Real-time search with debounce
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch();
                }, 500);
            });
        }
    }

    bindFolderEvents() {
        const folderLinks = document.querySelectorAll('.folder-link');
        folderLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const url = new URL(link.href);
                const filter = url.searchParams.get('filter') || 'all';
                this.applyFilter(filter);
            });
        });
    }

    bindSelectionEvents() {
        // Select all checkbox
        const selectAllBtn = document.getElementById('select-all-btn');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                this.toggleSelectAll();
            });
        }

        // Individual message checkboxes
        this.bindMessageCheckboxes();
    }

    bindMessageCheckboxes() {
        const checkboxes = document.querySelectorAll('.message-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const messageId = parseInt(e.target.value);
                if (e.target.checked) {
                    this.selectedMessages.add(messageId);
                    e.target.closest('.message-row').classList.add('selected');
                } else {
                    this.selectedMessages.delete(messageId);
                    e.target.closest('.message-row').classList.remove('selected');
                }
                this.updateBulkActionButtons();
            });
        });
    }

    bindBulkActionEvents() {
        const markReadBtn = document.getElementById('mark-read-btn');
        const markUnreadBtn = document.getElementById('mark-unread-btn');
        const deleteSelectedBtn = document.getElementById('delete-selected-btn');

        if (markReadBtn) {
            markReadBtn.addEventListener('click', () => {
                this.performBulkAction('mark_read');
            });
        }

        if (markUnreadBtn) {
            markUnreadBtn.addEventListener('click', () => {
                this.performBulkAction('mark_unread');
            });
        }

        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', () => {
                this.confirmBulkDelete();
            });
        }
    }

    bindMessageActionEvents() {
        // View message buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.view-message-btn') || e.target.closest('.view-message-btn')) {
                const btn = e.target.closest('.view-message-btn') || e.target;
                const messageId = btn.dataset.messageId;
                this.viewMessage(messageId);
            }
        });

        // Mark read/unread buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.mark-read-btn') || e.target.closest('.mark-read-btn')) {
                const btn = e.target.closest('.mark-read-btn') || e.target;
                const messageId = btn.dataset.messageId;
                this.markMessageRead(messageId);
            }

            if (e.target.matches('.mark-unread-btn') || e.target.closest('.mark-unread-btn')) {
                const btn = e.target.closest('.mark-unread-btn') || e.target;
                const messageId = btn.dataset.messageId;
                this.markMessageUnread(messageId);
            }
        });

        // Delete message buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.delete-message-btn') || e.target.closest('.delete-message-btn')) {
                const btn = e.target.closest('.delete-message-btn') || e.target;
                const messageId = btn.dataset.messageId;
                this.confirmDeleteMessage(messageId);
            }
        });

        // Star messages (future feature)
        document.addEventListener('click', (e) => {
            if (e.target.matches('.message-star')) {
                const messageId = e.target.dataset.messageId;
                this.toggleMessageStar(messageId);
            }
        });

        // Click on message row to view
        document.addEventListener('click', (e) => {
            const messageRow = e.target.closest('.message-row');
            if (messageRow && !e.target.closest('.message-checkbox') && !e.target.closest('.message-actions') && !e.target.closest('.message-star')) {
                const messageId = messageRow.dataset.messageId;
                this.viewMessage(messageId);
            }
        });
    }

    bindModalEvents() {
        const messageModal = document.getElementById('messageModal');
        if (messageModal) {
            messageModal.addEventListener('hidden.bs.modal', () => {
                document.getElementById('modal-content-container').innerHTML = '';
            });
        }
    }

    bindPaginationEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.page-link')) {
                e.preventDefault();
                const url = new URL(e.target.href);
                const page = url.searchParams.get('page');
                this.loadPage(page);
            }
        });
    }

    // Search and Filter Methods
    performSearch() {
        const searchInput = document.getElementById('search-input');
        this.searchQuery = searchInput ? searchInput.value.trim() : '';
        this.loadMessages();
    }

    applyFilter(filter) {
        this.currentFilter = filter;
        this.clearSelection();
        this.loadMessages();
    }

    loadMessages(page = 1) {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        const params = new URLSearchParams({
            filter: this.currentFilter,
            page: page
        });

        if (this.searchQuery) {
            params.append('search', this.searchQuery);
        }

        fetch(`/messages/inbox?${params.toString()}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('inbox-content').innerHTML = data.html;
                this.updateSidebarCounts(data);
                this.updateFolderActiveState();
                this.bindMessageCheckboxes();
                this.clearSelection();
                this.updateURL();
            } else {
                this.showError('Failed to load messages');
            }
        })
        .catch(error => {
            console.error('Error loading messages:', error);
            this.showError('Failed to load messages');
        })
        .finally(() => {
            this.isLoading = false;
            this.hideLoading();
        });
    }

    loadPage(page) {
        this.loadMessages(page);
    }

    // Selection Methods
    toggleSelectAll() {
        const checkboxes = document.querySelectorAll('.message-checkbox');
        const allSelected = this.selectedMessages.size === checkboxes.length;

        if (allSelected) {
            this.clearSelection();
        } else {
            checkboxes.forEach(checkbox => {
                const messageId = parseInt(checkbox.value);
                this.selectedMessages.add(messageId);
                checkbox.checked = true;
                checkbox.closest('.message-row').classList.add('selected');
            });
        }

        this.updateBulkActionButtons();
        this.updateSelectAllButton();
    }

    clearSelection() {
        this.selectedMessages.clear();
        document.querySelectorAll('.message-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('.message-row').classList.remove('selected');
        });
        this.updateBulkActionButtons();
        this.updateSelectAllButton();
    }

    updateBulkActionButtons() {
        const hasSelection = this.selectedMessages.size > 0;
        const buttons = ['mark-read-btn', 'mark-unread-btn', 'delete-selected-btn'];

        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.disabled = !hasSelection;
            }
        });
    }

    updateSelectAllButton() {
        const selectAllBtn = document.getElementById('select-all-btn');
        const checkboxes = document.querySelectorAll('.message-checkbox');

        if (selectAllBtn && checkboxes.length > 0) {
            const allSelected = this.selectedMessages.size === checkboxes.length;

            if (allSelected) {
                selectAllBtn.innerHTML = '<i class="bi bi-square"></i> Deselect All';
            } else {
                selectAllBtn.innerHTML = '<i class="bi bi-check-square"></i> Select All';
            }
        }
    }

    // Message Action Methods
    async viewMessage(messageId) {
        this.showLoading();

        try {
            const response = await fetch(`/messages/${messageId}/`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                document.getElementById('modal-content-container').innerHTML = data.html;
                const modal = new bootstrap.Modal(document.getElementById('messageModal'));
                modal.show();

                // Update message row to show as read
                if (data.is_read) {
                    this.updateMessageRowStatus(messageId, true);
                }
            } else {
                this.showError('Failed to load message');
            }
        } catch (error) {
            console.error('Error viewing message:', error);
            this.showError('Failed to load message');
        } finally {
            this.hideLoading();
        }
    }

    async markMessageRead(messageId) {
        await this.updateMessageStatus(messageId, 'read', true);
    }

    async markMessageUnread(messageId) {
        await this.updateMessageStatus(messageId, 'unread', false);
    }

    async updateMessageStatus(messageId, action, isRead) {
        const messageRow = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageRow) {
            messageRow.classList.add('updating');
        }

        try {
            const response = await fetch(`/messages/${messageId}/mark-read/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const data = await response.json();

            if (data.success) {
                this.updateMessageRowStatus(messageId, isRead);
                this.showSuccess(`Message marked as ${action}`);

                // Update sidebar counts
                this.refreshSidebarCounts();
            } else {
                this.showError(`Failed to mark message as ${action}`);
            }
        } catch (error) {
            console.error(`Error marking message as ${action}:`, error);
            this.showError(`Failed to mark message as ${action}`);
        } finally {
            if (messageRow) {
                messageRow.classList.remove('updating');
            }
        }
    }

    async confirmDeleteMessage(messageId) {
        const result = await Swal.fire({
            title: 'Delete Message?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            await this.deleteMessage(messageId);
        }
    }

    async deleteMessage(messageId) {
        const messageRow = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageRow) {
            messageRow.classList.add('updating');
        }

        try {
            const response = await fetch(`/messages/${messageId}/delete/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Remove from selection if selected
                this.selectedMessages.delete(parseInt(messageId));

                // Animate and remove message row
                if (messageRow) {
                    messageRow.style.opacity = '0';
                    messageRow.style.transform = 'translateX(-100%)';
                    setTimeout(() => {
                        messageRow.remove();
                        this.updateBulkActionButtons();
                        this.refreshSidebarCounts();
                    }, 300);
                }

                this.showSuccess(data.message);

                // Close modal if it's open
                const modal = bootstrap.Modal.getInstance(document.getElementById('messageModal'));
                if (modal) {
                    modal.hide();
                }
            } else {
                this.showError('Failed to delete message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            this.showError('Failed to delete message');
        } finally {
            if (messageRow) {
                messageRow.classList.remove('updating');
            }
        }
    }

    // Bulk Action Methods
    async confirmBulkDelete() {
        const count = this.selectedMessages.size;
        const result = await Swal.fire({
            title: `Delete ${count} Messages?`,
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Yes, delete ${count} messages!`
        });

        if (result.isConfirmed) {
            await this.performBulkAction('delete');
        }
    }

    async performBulkAction(action) {
        if (this.selectedMessages.size === 0) {
            this.showWarning('No messages selected');
            return;
        }

        const messageIds = Array.from(this.selectedMessages);
        this.showLoading();

        try {
            const formData = new FormData();
            formData.append('action', action);
            messageIds.forEach(id => {
                formData.append('message_ids[]', id);
            });

            const response = await fetch('/messages/bulk-actions/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.handleBulkActionSuccess(data);
                this.showSuccess(data.message);
            } else {
                this.showError(data.message || 'Bulk action failed');
            }
        } catch (error) {
            console.error('Error performing bulk action:', error);
            this.showError('Bulk action failed');
        } finally {
            this.hideLoading();
        }
    }

    handleBulkActionSuccess(data) {
        const { action, affected_ids } = data;

        affected_ids.forEach(messageId => {
            const messageRow = document.querySelector(`[data-message-id="${messageId}"]`);

            if (action === 'delete') {
                if (messageRow) {
                    messageRow.style.opacity = '0';
                    messageRow.style.transform = 'translateX(-100%)';
                    setTimeout(() => messageRow.remove(), 300);
                }
            } else if (action === 'mark_read') {
                this.updateMessageRowStatus(messageId, true);
            } else if (action === 'mark_unread') {
                this.updateMessageRowStatus(messageId, false);
            }
        });

        this.clearSelection();
        this.refreshSidebarCounts();
    }

    // UI Update Methods
    updateMessageRowStatus(messageId, isRead) {
        const messageRow = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageRow) return;

        messageRow.dataset.isRead = isRead.toString();

        if (isRead) {
            messageRow.classList.remove('message-unread');
            // Update unread indicator
            const unreadIndicator = messageRow.querySelector('.unread-indicator');
            if (unreadIndicator) {
                unreadIndicator.remove();
            }
            // Update action buttons
            const markReadBtn = messageRow.querySelector('.mark-read-btn');
            const markUnreadBtn = messageRow.querySelector('.mark-unread-btn');
            if (markReadBtn && markUnreadBtn) {
                markReadBtn.style.display = 'none';
                markUnreadBtn.style.display = 'inline-block';
            }
        } else {
            messageRow.classList.add('message-unread');
            // Add unread indicator
            const subject = messageRow.querySelector('.message-subject strong');
            if (subject && !subject.querySelector('.unread-indicator')) {
                const indicator = document.createElement('span');
                indicator.className = 'unread-indicator';
                subject.insertBefore(indicator, subject.firstChild);
            }
            // Update action buttons
            const markReadBtn = messageRow.querySelector('.mark-read-btn');
            const markUnreadBtn = messageRow.querySelector('.mark-unread-btn');
            if (markReadBtn && markUnreadBtn) {
                markReadBtn.style.display = 'inline-block';
                markUnreadBtn.style.display = 'none';
            }
        }

        messageRow.classList.add('updated');
        setTimeout(() => messageRow.classList.remove('updated'), 1000);
    }

    updateSidebarCounts(data) {
        const updateElement = (selector, count) => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = count;
            }
        };

        if (data.total_messages !== undefined) {
            updateElement('.folder-link[href*="filter=all"] .badge', data.total_messages);
        }
        if (data.unread_count !== undefined) {
            updateElement('.folder-link[href*="filter=unread"] .badge', data.unread_count);
            updateElement('.stat-item:nth-child(2) strong', data.unread_count);
        }
    }

    async refreshSidebarCounts() {
        try {
            const response = await fetch('/messages/inbox', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                this.updateSidebarCounts(data);
            }
        } catch (error) {
            console.error('Error refreshing sidebar counts:', error);
        }
    }

    updateFolderActiveState() {
        document.querySelectorAll('.folder-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`.folder-link[href*="filter=${this.currentFilter}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    updateURL() {
        const params = new URLSearchParams();

        if (this.currentFilter !== 'all') {
            params.append('filter', this.currentFilter);
        }

        if (this.searchQuery) {
            params.append('search', this.searchQuery);
        }

        const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newURL);
    }

    updateUrlFromFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        this.currentFilter = urlParams.get('filter') || 'all';
        this.searchQuery = urlParams.get('search') || '';

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = this.searchQuery;
        }
    }

    // Utility Methods
    toggleMessageStar(messageId) {
        const star = document.querySelector(`[data-message-id="${messageId}"] .message-star`);
        if (star) {
            star.classList.toggle('starred');
            // TODO: Implement server-side star functionality
        }
    }

    initializeTooltips() {
        // Initialize Bootstrap tooltips if available
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }

    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showSuccess(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: message,
                timer: 3000,
                showConfirmButton: false
            });
        } else {
            alert(message);
        }
    }

    showError(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: message
            });
        } else {
            alert(`Error: ${message}`);
        }
    }

    showWarning(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: 'Warning!',
                text: message
            });
        } else {
            alert(`Warning: ${message}`);
        }
    }

    getCSRFToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) {
            return meta.getAttribute('content');
        }

        const input = document.querySelector('input[name="csrfmiddlewaretoken"]');
        if (input) {
            return input.value;
        }

        const cookie = document.cookie.split(';')
            .find(row => row.trim().startsWith('csrftoken='));
        if (cookie) {
            return cookie.split('=')[1];
        }

        return '';
    }
}

// Initialize inbox manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on inbox page
    if (document.getElementById('inbox-content')) {
        window.inboxManager = new InboxManager();
    }
});
