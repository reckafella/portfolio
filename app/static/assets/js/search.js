function toggleSearchBar() {
    const searchBar = document.getElementById('search-bar');
    searchBar.classList.toggle('d-none');
    
    if (!searchBar.classList.contains('d-none')) {
        searchBar.querySelector('input[type="text"]').focus();
    }
}

function performSearch() {
    const searchInput = document.querySelector('#search-bar input[type="text"]');
    const searchType = document.querySelector('#search-bar select');
    
    const searchTerm = searchInput.value.trim();
    const searchCategory = searchType.value;

    if (searchTerm) {
        let searchUrl = '/search/?q=' + encodeURIComponent(searchTerm);
        if (searchCategory !== 'all') {
            searchUrl += '&category=' + encodeURIComponent(searchCategory);
        }
        window.location.href = searchUrl;
    }

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

/* // Function to toggle the search bar visibility
function toggleSearchBar() {
    const searchBar = document.getElementById('search-bar');
    searchBar.classList.toggle('d-none');
    
    if (!searchBar.classList.contains('d-none')) {
      searchBar.querySelector('input[type="text"]').focus();
    }
  }
  
  // Function to perform the search
  function performSearch() {
    const searchInput = document.querySelector('#search-bar input[type="text"]');
    const searchType = document.querySelector('#search-bar select');
    
    const searchTerm = searchInput.value.trim();
    const searchCategory = searchType.value;
  
    if (searchTerm) {
      // Construct the search URL
      let searchUrl = '/search/?q=' + encodeURIComponent(searchTerm);
      if (searchCategory !== 'all') {
        searchUrl += '&category=' + encodeURIComponent(searchCategory);
      }
  
      // Redirect to the search URL
      window.location.href = searchUrl;
    }
  
    // Prevent form submission
    return false;
  }
  
  // Add click event listener to the search icon
  document.addEventListener('DOMContentLoaded', function() {
    const searchIcon = document.querySelector('a[href*="search"]');
    if (searchIcon) {
      searchIcon.addEventListener('click', function(e) {
        e.preventDefault();
        toggleSearchBar();
      });
    }
  }); */