/* handles all JS for the posts templates */
document.addEventListener('DOMContentLoaded', function() {
    // Function to load posts via AJAX
    function loadPosts(tag, page, sort, q) {
        // Ensure the tag, page, sort, and search are properly sanitized
        if (!tag) tag = 'default';  // Fallback if tag is missing
        if (!page) page = 1;  // Default to first page if page is not defined
        if (!sort) sort = 'relevance';  // Default to 'relevance' sort
        if (!filter) filter = 'all';  // Default to 'all' filter
        if (!q) q = '';  // Empty search if no search term provided

        // Create the AJAX request
        var xhr = new XMLHttpRequest();
        var url = '{% url "blog" %}?tag=' + encodeURIComponent(tag) +
                  '&page=' + encodeURIComponent(page) +
                  '&sort=' + encodeURIComponent(sort) +
                  '&filter-by=' + encodeURIComponent(filter) +
                  '&q=' + encodeURIComponent(q);
        
        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');  // Identify it as an AJAX request
        xhr.responseType = 'json';  // Expect JSON response

        xhr.onload = function() {
            if (xhr.status === 200) {
                var data = xhr.response;

                // Check if data has valid keys before updating the DOM
                if (data && data.posts_html && data.pagination_html) {
                    document.getElementById('postsContainer').innerHTML = data.posts_html;
                    document.getElementById('pagination').innerHTML = data.pagination_html;

                    // Update the URL to reflect the new state
                    var newUrl = updateQueryStringParameter(window.location.href, 'sort', sort);
                    newUrl = updateQueryStringParameter(newUrl, 'tag', tag);
                    newUrl = updateQueryStringParameter(newUrl, 'page', page);
                    window.history.pushState({path: newUrl}, '', newUrl);
                } else {
                    console.error('Invalid data returned from the server');
                }
            } else {
                console.error('Error loading posts:', xhr.statusText);
            }
        };

        xhr.onerror = function() {
            console.error('An error occurred during the AJAX request.');
        };

        xhr.send();
    }

    // Helper function to update URL parameters
    function updateQueryStringParameter(uri, key, value) {
        var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
        var separator = uri.indexOf('?') !== -1 ? '&' : '?';
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + '=' + encodeURIComponent(value) + '$2');
        } else {
            return uri + separator + key + '=' + encodeURIComponent(value);
        }
    }

    // Event handler for tag tab clicks
    document.getElementById('tagTabs').addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            var links = document.querySelectorAll('#tagTabs a');
            links.forEach(function(link) {
                link.classList.remove('active');
            });

            e.target.classList.add('active');
            var tag = e.target.getAttribute('data-tag');
            var sort = document.getElementById('sortSelect').value;
            var filter = document.getElementById('filterSelect').value;
            var q = document.getElementById('searchInput').value;
            loadPosts(tag, 1, sort, q, filter);
        }
    });

    // Event handler for pagination links
    document.getElementById('pagination').addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            var tag = document.querySelector('#tagTabs .active').getAttribute('data-tag');
            var page = e.target.getAttribute('href').split('page=')[1];
            var sort = document.getElementById('sortSelect').value;
            var filter = document.getElementById('filterSelect').value;
            var q = document.getElementById('searchInput').value;
            loadPosts(tag, page, sort, q, filter);
        }
    });

    // Event listener for sorting option change
    document.getElementById('sortSelect').addEventListener('change', function() {
        var tag = document.querySelector('#tagTabs .active').getAttribute('data-tag');
        var sort = this.value;
        var filter = document.getElementById('filterSelect').value;
        var q = document.getElementById('searchInput').value;
        loadPosts(tag, 1, sort, q, filter);
    });

    // Event listener for search form submission
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var tag = document.querySelector('#tagTabs .active').getAttribute('data-tag');
        var sort = document.getElementById('sortSelect').value;
        var q = document.getElementById('searchInput').value;
        var filter = document.getElementById('filterSelect').value;
        loadPosts(tag, 1, sort, q, filter);
    });

    // Load initial posts on page load
    var initialTag = '{{ current_tag }}';
    var initialSort = '{{ current_sort }}';
    var initialSearch = '{{ q }}';
    var initialFilter = '{{ current_filter }}';
    loadPosts(initialTag, 1, initialSort, initialSearch, initialFilter);
});
