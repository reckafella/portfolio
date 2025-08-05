document.addEventListener('DOMContentLoaded', function() {
  const filterButtons = document.querySelectorAll('#project-filters li');

  // Check URL parameters for initial filter state
  checkUrlParams();

  // Set up filter click handlers for quick filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();

      // Update active filter button
      filterButtons.forEach(btn => btn.classList.remove('filter-active'));
      this.classList.add('filter-active');

      // Get the filter value
      const filterValue = this.getAttribute('data-filter');
      let categoryValue = 'all';

      if (filterValue !== '*') {
        categoryValue = filterValue.replace(/^\.filter-/, '');
      }

      // Update URL and reload page with new filter
      const url = new URL(window.location.href);
      url.searchParams.set('category', categoryValue);
      url.searchParams.delete('page'); // Reset to first page when changing categories

      window.location.href = url.toString();
    });
  });

  // Enhanced filter form functionality
  const filterForm = document.getElementById('project-filters-form');
  if (filterForm) {
    const searchInput = document.getElementById('search');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const filterSelects = filterForm.querySelectorAll('select');

    // Remove auto-submit on select changes - now requires submit button
    // filterSelects.forEach(select => {
    //     select.addEventListener('change', function() {
    //         filterForm.submit();
    //     });
    // });

    // Enhanced search functionality without auto-submit
    if (searchInput) {
      // Clear search button functionality
      if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
          searchInput.value = '';
          this.style.display = 'none';
          // Auto-submit when clearing search
          filterForm.submit();
        });
      }

      // Show/hide clear search button based on input
      searchInput.addEventListener('input', function() {
        if (clearSearchBtn) {
          clearSearchBtn.style.display = this.value ? 'inline-block' : 'none';
        }
      });

      // Optional: Submit on Enter key in search input
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          filterForm.submit();
        }
      });
    }

    // Add loading indicator on form submit
    filterForm.addEventListener('submit', function() {
      const submitBtn = filterForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Filtering...';
        submitBtn.disabled = true;

        // Re-enable after a short delay (in case page doesn't reload)
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }, 3000);
      }
    });

    // Smooth scroll to results after filtering
    if (window.location.search && document.querySelector('.project-container')) {
      setTimeout(() => {
        const projectContainer = document.querySelector('.project-container');
        if (projectContainer) {
          projectContainer.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }

    // Auto-expand accordion if filters are active
    const hasFilters = document.querySelector('.filter-active-badge');
    if (hasFilters) {
      const accordion = document.getElementById('filtersCollapse');
      if (accordion) {
        const bsCollapse = new bootstrap.Collapse(accordion, {
          toggle: false
        });
        bsCollapse.show();
      }
    }
  }

  function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryValue = urlParams.get('category') || 'all';

    // Update active filter button based on URL
    filterButtons.forEach(btn => {
      const btnFilter = btn.getAttribute('data-filter');
      if ((categoryValue === 'all' && btnFilter === '*') ||
          (categoryValue !== 'all' && btnFilter === `.filter-${categoryValue}`)) {
        btn.classList.add('filter-active');
      } else {
        btn.classList.remove('filter-active');
      }
    });
  }
});
