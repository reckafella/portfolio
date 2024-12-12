function toggleSearchBar() {
  const searchBar = document.getElementById('search-bar');
  searchBar.classList.toggle('d-none');
  
  if (!searchBar.classList.contains('d-none')) {
      searchBar.querySelector('input[type="text"]').focus();
  }
}

function performSearch() {
  const searchInput = document.querySelector('#search-bar input[type="text"]');
  const searchType = document.getElementById('search-bar-filterOption');
  const sortOption = document.getElementById('search-bar-sortSelect');
  
  const searchTerm = searchInput.value.trim();
  const searchCategory = searchType.value;
  const sortOptionValue = sortOption.value;

  if (searchTerm) {
      let searchUrl = '/search?q=' + encodeURIComponent(searchTerm);
      
      if (searchCategory !== 'all') {
          searchUrl += '&category=' + encodeURIComponent(searchCategory);
      }
      if (sortOptionValue !== 'relevance') {
          searchUrl += '&sort=' + encodeURIComponent(sortOptionValue);
      }

      // Redirect to the search URL
      window.location.href = searchUrl;
  }

  // Prevent form submission to avoid default behavior
  return false;
}

document.addEventListener('DOMContentLoaded', function() {
  const searchIcon = document.querySelector('a[href*="search"]');
  if (searchIcon) {
      searchIcon.addEventListener('click', function(e) {
          e.preventDefault();
          toggleSearchBar();
      });
  }

  document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
          const searchBar = document.getElementById('search-bar');
          if (!searchBar.classList.contains('d-none')) {
              toggleSearchBar();
          }
      }
  });
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

  categorySelect.addEventListener('change', updateTabs);
  updateTabs();

  var triggerTabList = [].slice.call(document.querySelectorAll('#searchTabs button'));
  triggerTabList.forEach(function (triggerEl) {
      var tabTrigger = new bootstrap.Tab(triggerEl);

      triggerEl.addEventListener('click', function (event) {
          event.preventDefault();
          tabTrigger.show();
      });
  });
});
