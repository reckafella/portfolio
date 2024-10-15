/* handles all JS for the posts templates */
document.addEventListener('DOMContentLoaded', function() {
    // Function to load posts via AJAX
    function loadPosts(topic, page, sort, search) {
        // Ensure the topic, page, sort, and search are properly sanitized
        if (!topic) topic = 'default';  // Fallback if topic is missing
        if (!page) page = 1;  // Default to first page if page is not defined
        if (!sort) sort = 'relevance';  // Default to 'relevance' sort
        if (!search) search = '';  // Empty search if no search term provided

        // Create the AJAX request
        var xhr = new XMLHttpRequest();
        var url = '{% url "blog" %}?topic=' + encodeURIComponent(topic) +
                  '&page=' + encodeURIComponent(page) +
                  '&sort=' + encodeURIComponent(sort) +
                  '&search=' + encodeURIComponent(search);
        
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
                    newUrl = updateQueryStringParameter(newUrl, 'topic', topic);
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

    // Event handler for topic tab clicks
    document.getElementById('topicTabs').addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            var links = document.querySelectorAll('#topicTabs a');
            links.forEach(function(link) {
                link.classList.remove('active');
            });

            e.target.classList.add('active');
            var topic = e.target.getAttribute('data-topic');
            var sort = document.getElementById('sortSelect').value;
            var search = document.getElementById('searchInput').value;
            loadPosts(topic, 1, sort, search);
        }
    });

    // Event handler for pagination links
    document.getElementById('pagination').addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            var topic = document.querySelector('#topicTabs .active').getAttribute('data-topic');
            var page = e.target.getAttribute('href').split('page=')[1];
            var sort = document.getElementById('sortSelect').value;
            var search = document.getElementById('searchInput').value;
            loadPosts(topic, page, sort, search);
        }
    });

    // Event listener for sorting option change
    document.getElementById('sortSelect').addEventListener('change', function() {
        var topic = document.querySelector('#topicTabs .active').getAttribute('data-topic');
        var sort = this.value;
        var search = document.getElementById('searchInput').value;
        loadPosts(topic, 1, sort, search);
    });

    // Event listener for search form submission
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var topic = document.querySelector('#topicTabs .active').getAttribute('data-topic');
        var sort = document.getElementById('sortSelect').value;
        var search = document.getElementById('searchInput').value;
        loadPosts(topic, 1, sort, search);
    });

    // Load initial posts on page load
    var initialTopic = '{{ current_topic }}';
    var initialSort = '{{ current_sort }}';
    var initialSearch = '{{ search_query }}';
    loadPosts(initialTopic, 1, initialSort, initialSearch);
});



/* document.addEventListener('DOMContentLoaded', function() {
    function loadPosts(topic, page, sort, search) {
        // Ensure the topic, page, sort, and search are safe and sanitized
        if (!topic || !page || !sort) {
            console.error('Invalid parameters for loading posts.');
            return;
        }

        // Create the AJAX request
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '{% url "blog" %}?topic=' + encodeURIComponent(topic) + '&page=' + encodeURIComponent(page) + '&sort=' + encodeURIComponent(sort) + '&search=' + encodeURIComponent(search), true);
        xhr.responseType = 'json';

        xhr.onload = function() {
            if (xhr.status === 200) {
                var data = xhr.response;

                // Update the posts and pagination containers
                document.getElementById('postsContainer').innerHTML = data.posts_html;
                document.getElementById('pagination').innerHTML = data.pagination_html;

                // Update the URL to reflect the new state
                var newUrl = updateQueryStringParameter(window.location.href, 'sort', sort);
                newUrl = updateQueryStringParameter(newUrl, 'topic', topic);
                newUrl = updateQueryStringParameter(newUrl, 'page', page);
                window.history.pushState({path: newUrl}, '', newUrl);
            }
        };

        xhr.onerror = function() {
            console.error('An error occurred while loading posts.');
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

    // Event delegation for topic tabs
    document.getElementById('topicTabs').addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            var links = document.querySelectorAll('#topicTabs a');
            links.forEach(function(link) {
                link.classList.remove('active');
            });

            e.target.classList.add('active');
            var topic = e.target.getAttribute('data-topic');
            var sort = document.getElementById('sortSelect').value;
            var search = document.getElementById('searchInput').value;
            loadPosts(topic, 1, sort, search);
        }
    });

    // Event delegation for pagination links
    document.getElementById('pagination').addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            var topic = document.querySelector('#topicTabs .active').getAttribute('data-topic');
            var page = e.target.getAttribute('href').split('page=')[1];
            var sort = document.getElementById('sortSelect').value;
            var search = document.getElementById('searchInput').value;
            loadPosts(topic, page, sort, search);
        }
    });

    // Event listener for sort select change
    document.getElementById('sortSelect').addEventListener('change', function() {
        var topic = document.querySelector('#topicTabs .active').getAttribute('data-topic');
        var sort = this.value;
        var search = document.getElementById('searchInput').value;
        loadPosts(topic, 1, sort, search);
    });

    // Event listener for search form submission
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var topic = document.querySelector('#topicTabs .active').getAttribute('data-topic');
        var sort = document.getElementById('sortSelect').value;
        var search = document.getElementById('searchInput').value;
        loadPosts(topic, 1, sort, search);
    });

    // Load initial posts
    var initialTopic = '{{ current_topic }}';
    var initialSort = '{{ current_sort }}';
    var initialSearch = '{{ search_query }}';
    loadPosts(initialTopic, 1, initialSort, initialSearch);
}); */
