document.addEventListener('DOMContentLoaded', function() {
  const itemsPerPage = 6;
  let currentPage = 1;
  let currentFilter = '*';
  let currentFilterValue = 'all';

  const projectContainer = document.getElementById('project-container');
  const filterButtons = document.querySelectorAll('#project-filters li');
  const paginationContainer = document.querySelector('.pagination');

  checkUrlParams();

  // Store original projects and create a working copy
  const allProjects = [...document.querySelectorAll('.project-item')];
  const projectsPool = allProjects.map(project => project.cloneNode(true));

  updateView();

  filterButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();

      filterButtons.forEach(btn => btn.classList.remove('filter-active'));
      this.classList.add('filter-active');

      currentFilter = this.getAttribute('data-filter');
      currentPage = 1;

      updateView();
    });
  });

  window.addEventListener('popstate', function(event) {
    if (event.state && event.state.managed) {
      currentFilter = event.state.filter;
      currentFilterValue = event.state.filterValue;
      currentPage = event.state.page;
      updateActiveFilterButton();
    } else {
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
    const filteredProjects = filterProjects(projectsPool, currentFilter);
    const visibleProjects = paginateProjects(filteredProjects, currentPage, itemsPerPage);

    // Clear pagination first to prevent layout issues
    paginationContainer.innerHTML = '';

    // Use requestAnimationFrame to ensure smooth DOM updates
    requestAnimationFrame(() => {
      // Clear and rebuild the container
      projectContainer.innerHTML = '';
      
      // Create a document fragment for better performance
      const fragment = document.createDocumentFragment();
      
      visibleProjects.forEach(project => {
        fragment.appendChild(project.cloneNode(true));
      });
      
      projectContainer.appendChild(fragment);

      // Wait for layout to settle before updating pagination
      setTimeout(() => {
        updatePagination(filteredProjects.length, itemsPerPage);
      }, 0);
    });

    updateUrlParams();
  }

  function filterProjects(projects, filter) {
    if (filter === '*') {
      return projects;
    }
    const filterClass = filter.substring(1);
    return projects.filter(project => project.classList.contains(filterClass));
  }

  function updateUrlParams() {
    let filterValue = 'all';
    if (currentFilter !== '*') {
      filterValue = currentFilter.replace(/^\.filter-/, '');
      currentFilterValue = filterValue;
    }
    
    const url = new URL(window.location.href);
    url.searchParams.set('filter', filterValue);
    url.searchParams.set('page', currentPage);
    
    const state = { 
      managed: true,
      filter: currentFilter, 
      filterValue: currentFilterValue, 
      page: currentPage 
    };
    
    window.history.pushState(state, '', url);
  }

  function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);

    const filterValue = urlParams.get('filter');
    if (filterValue) {
      if (filterValue === 'all') {
        currentFilter = '*';
      } else {
        currentFilter = '.filter-' + filterValue.replace(/^filter-/, '');
        currentFilterValue = filterValue;
      }
    }

    const pageValue = urlParams.get('page');
    if (pageValue && !isNaN(pageValue)) {
      currentPage = parseInt(pageValue);
    }
    updateActiveFilterButton();
  }

  function paginateProjects(projects, page, perPage) {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return projects.slice(startIndex, endIndex);
  }

  function updatePagination(totalItems, perPage) {
    const totalPages = Math.ceil(totalItems / perPage);
    
    // Clear pagination first
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) {
      return;
    }

    // Create pagination elements
    const paginationHTML = createPaginationHTML(totalPages);
    paginationContainer.innerHTML = paginationHTML;

    // Add event listeners to pagination links
    addPaginationEventListeners(totalPages);
  }

  function createPaginationHTML(totalPages) {
    let html = '';

    // Previous button
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">&laquo; Previous</a>
    </li>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === currentPage) {
        html += `<li class="page-item active">
          <span class="page-link">${i}</span>
        </li>`;
      } else {
        html += `<li class="page-item">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>`;
      }
    }

    // Next button
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">Next &raquo;</a>
    </li>`;

    return html;
  }

  function addPaginationEventListeners(totalPages) {
    const paginationLinks = paginationContainer.querySelectorAll('a.page-link');
    
    paginationLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const newPage = parseInt(this.getAttribute('data-page'));
        
        // Validate page bounds
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
          currentPage = newPage;
          updateView();
        }
      });
    });
  }
});
