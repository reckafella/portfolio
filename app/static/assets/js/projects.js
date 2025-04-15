// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
  // Settings
  const itemsPerPage = 6;
  let currentPage = 1;
  let currentFilter = '*';
  let currentFilterValue = 'all';

  // Get DOM elements
  const projectContainer = document.getElementById('project-container');
  const filterButtons = document.querySelectorAll('#project-filters li');
  const paginationContainer = document.querySelector('.pagination');

  // Check URL parameters for initial filter/page
  checkUrlParams();

  // Get all projects
  const allProjects = [...document.querySelectorAll('.project-item')];

  // Initial setup
  updateView();

  // Set up filter click handlers
  filterButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();

      // Update active filter button
      filterButtons.forEach(btn => btn.classList.remove('filter-active'));
      this.classList.add('filter-active');

      // Set current filter
      currentFilter = this.getAttribute('data-filter');

      // Reset to first page when changing filters
      currentPage = 1;

      // Update the view
      updateView();
    });
  });

  // Handle browser back/forward navigation with popstate
  window.addEventListener('popstate', function(event) {
    // If state exists and was pushed by our code
    if (event.state && event.state.managed) {
      currentFilter = event.state.filter;
      currentFilterValue = event.state.filterValue;
      currentPage = event.state.page;

      // Update UI to reflect state
      updateActiveFilterButton();
    } else {
      // Otherwise check URL params
      checkUrlParams();
    }
    
    updateView();
  });

  function updateActiveFilterButton() {
    filterButtons.forEach(btn => {
      const btnFilter = btn.getAttribute('data-filter');
      if ((currentFilterValue === 'all' && btnFilter === '*') ||
          (currentFilterValue !== 'all' && btnFilter === currentFilter)) {
        btn.classList.add('filter-active');
      } else {
        btn.classList.remove('filter-active');
      }
    });
  }

  function updateView() {
    // First, filter projects
    const filteredProjects = filterProjects(allProjects, currentFilter);

    // Then paginate the filtered projects
    const visibleProjects = paginateProjects(filteredProjects, currentPage, itemsPerPage);

    // Clear and rebuild the layout properly
    // First, hide all projects
    allProjects.forEach(project => {
      project.style.display = 'none';
    });

    // Then show only the visible ones
    visibleProjects.forEach(project => {
      project.style.display = '';
    });

    // Update pagination UI
    updatePagination(filteredProjects.length, itemsPerPage);

    // Update URL query params
    updateUrlParams();
  }

  function filterProjects(projects, filter) {
    if (filter === '*') {
      return projects;
    }
    const filterClass = filter.substring(1);
    return projects.filter(project => project.classList.contains(filterClass));
  }

  // URL Query Parameters functions
  function updateUrlParams() {
    let filterValue = 'all';
    if (currentFilter !== '*') {
      filterValue = currentFilter.replace(/^\.filter-/, '');
      currentFilterValue = filterValue;
    }
    
    // Create URL with query parameters
    const url = new URL(window.location.href);
    url.searchParams.set('filter', filterValue);
    url.searchParams.set('page', currentPage);
    
    // Use pushState to update URL without reload
    const state = { 
      managed: true,
      filter: currentFilter, 
      filterValue: currentFilterValue, 
      page: currentPage 
    };
    
    window.history.pushState(state, '', url);
  }

  function checkUrlParams() {
    // Get URL search params
    const urlParams = new URLSearchParams(window.location.search);

    // Get filter from params
    const filterValue = urlParams.get('filter');
    if (filterValue) {
      if (filterValue === 'all') {
        currentFilter = '*';
      } else {
        // Make sure we don't keep adding filter- prefixes
        currentFilter = '.filter-' + filterValue.replace(/^filter-/, '');
        currentFilterValue = filterValue;
      }

      // Update active filter button
      updateActiveFilterButton();
    }

    // Get page from params
    const pageValue = urlParams.get('page');
    if (pageValue && !isNaN(pageValue)) {
      currentPage = parseInt(pageValue);
    }
  }

  function paginateProjects(projects, page, perPage) {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return projects.slice(startIndex, endIndex);
  }

  function updatePagination(totalItems, perPage) {
    // Calculate total pages
    const totalPages = Math.ceil(totalItems / perPage);

    // Clear current pagination
    paginationContainer.innerHTML = '';

    // Don't show pagination if there's only one page
    if (totalPages <= 1) {
      return;
    }

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.innerHTML = '&laquo; Previous';
    
    // Create URL with query parameters
    const prevUrl = new URL(window.location.href);
    prevUrl.searchParams.set('filter', currentFilterValue);
    prevUrl.searchParams.set('page', currentPage - 1);
    prevLink.href = prevUrl.toString();

    prevLink.addEventListener('click', function(e) {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        updateView();
      }
    });
    prevLi.appendChild(prevLink);
    paginationContainer.appendChild(prevLi);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageLi = document.createElement('li');
      pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;

      if (i === currentPage) {
        const currentSpan = document.createElement('span');
        currentSpan.className = 'page-link';
        currentSpan.textContent = i;
        pageLi.appendChild(currentSpan);
      } else {
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.textContent = i;
        
        // Create URL with query parameters
        const pageUrl = new URL(window.location.href);
        pageUrl.searchParams.set('filter', currentFilterValue);
        pageUrl.searchParams.set('page', i);
        pageLink.href = pageUrl.toString();
        
        pageLink.addEventListener('click', function(e) {
          e.preventDefault();
          currentPage = i;
          updateView();
        });
        pageLi.appendChild(pageLink);
      }

      paginationContainer.appendChild(pageLi);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.innerHTML = 'Next &raquo;';
    
    // Create URL with query parameters
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('filter', currentFilterValue);
    nextUrl.searchParams.set('page', currentPage + 1);
    nextLink.href = nextUrl.toString();
    
    nextLink.addEventListener('click', function(e) {
      e.preventDefault();
      if (currentPage < totalPages) {
        currentPage++;
        updateView();
      }
    });
    nextLi.appendChild(nextLink);
    paginationContainer.appendChild(nextLi);
  }
});
