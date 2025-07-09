document.addEventListener('DOMContentLoaded', function() {
  const filterButtons = document.querySelectorAll('#project-filters li');
  
  // Check URL parameters for initial filter state
  checkUrlParams();

  // Set up filter click handlers
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
