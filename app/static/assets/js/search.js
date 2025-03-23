function performSearch(event) {
    // Prevent the default form submission
    event.preventDefault();
    
    // Get form elements using their IDs
    const searchInput = document.getElementById('search-input');
    const searchType = document.getElementById('search-bar-filterOption');
    const sortOption = document.getElementById('search-bar-sortSelect');
    
    const searchTerm = searchInput.value.trim();
    const searchCategory = searchType.value;
    const sortOptionValue = sortOption.value;

    if (searchTerm) {
        // Build the search URL
        let searchUrl = '/search?q=' + encodeURIComponent(searchTerm);
        
        if (searchCategory && searchCategory !== 'all') {
            searchUrl += '&category=' + encodeURIComponent(searchCategory);
        }
        
        if (sortOptionValue && sortOptionValue !== 'relevance') {
            searchUrl += '&sort=' + encodeURIComponent(sortOptionValue);
        }

        // Hide the modal
        const searchModal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
        if (searchModal) {
            searchModal.hide();
        }
        // Navigate to the search URL
        window.location.href = searchUrl;
    }
    
    return false;
}

// Event listener for focusing input when modal opens
document.getElementById('searchModal').addEventListener('shown.bs.modal', function () {
    document.getElementById('q').focus();
});

// Add keyboard shortcut for opening search modal
document.addEventListener('keydown', function(e) {
    // Open search modal with Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        select('.search-bar').classList.add('search-bar-show');
    }
});

/* Search.html */

document.addEventListener('DOMContentLoaded', function() {
  var categorySelect = document.getElementById('category-select');
  var postsTabContainer = document.getElementById('posts-tab-container');
  var projectsTabContainer = document.getElementById('projects-tab-container');
  var postsTab = document.getElementById('posts-tab');
  var projectsTab = document.getElementById('projects-tab');

  function updateTabs() {
      var selectedCategory = categorySelect.value;
      if (selectedCategory === 'posts') {
          postsTabContainer.style.display = 'block';
          projectsTabContainer.style.display = 'none';
          postsTab.click();
      } else if (selectedCategory === 'projects') {
          postsTabContainer.style.display = 'none';
          projectsTabContainer.style.display = 'block';
          projectsTab.click();
      } else {
          postsTabContainer.style.display = 'block';
          projectsTabContainer.style.display = 'block';
      }
  }
  if (categorySelect) {
    categorySelect.addEventListener('change', updateTabs);updateTabs();
  }
  
  var triggerTabList = [].slice.call(document.querySelectorAll('#searchTabs button'));
  triggerTabList.forEach(function (triggerEl) {
      var tabTrigger = new bootstrap.Tab(triggerEl);

      triggerEl.addEventListener('click', function (event) {
          event.preventDefault();
          tabTrigger.show();
      });
  });
});
