document.addEventListener('DOMContentLoaded', function () {
    /* settings */
    const itemsPerPage = 4; /* matches values from the backend */
    let currentPage = 1;
    let currentFilter = '*';

    /* get dom elements */
    const projectContainer = document.querySelector('.project-container .row:last-child');
    const filterButtons = document.querySelectorAll('#project-filters li');
    const paginationContainer = document.querySelector('.pagination');

    /* get all projects */
    const allProjects = [...document.querySelectorAll('.project-item')];

    updateView();

    /* set up handlers for filter click */
    filterButtons.forEach((button) => {
        button.addEventListener('click', function () {
            filterButtons.forEach(btn => btn.classList.remove('filter-active'));
            this.classList.add('filter-active');

            // set the current filter
            currentFilter = this.getAttribute('data-filter');

            // reset the current page to 1 when changing filters
            currentPage = 1; // reset to first page
            updateView();
        });
    });

    function updateView() {
        /* filter projects */
        const filteredProjects = filterProjects(allProjects, currentFilter);

        /* paginate the filtered projects */
        const visibleProjects = paginateProjects(filteredProjects, currentPage, itemsPerPage);

        /* update visibility */
        allProjects.forEach(project => project.classList.add('d-none'));
        visibleProjects.forEach(project => project.classList.remove('d-none'));
        /* update pagination */

        updatePagination(filteredProjects.length, itemsPerPage);
    }

    function filterProjects(projects, filter) {
        if (filter === '*') {
            return projects;
        }
        return projects.filter(project => project.classList.contains(filter.substring(1)));
    }

    function paginateProjects(projects, page, itemsPerPage) {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return projects.slice(start, end);
    }

    function updatePagination(totalItems, itemsPerPage) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) {
            return; // No pagination needed
        }

        /* previous button */
        const prevButton = document.createElement('li');
        prevButton.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        const prevLink = document.createElement('a');
        prevLink.className = 'page-link';
        prevLink.innerHTML = '&laquo; Previous';
        prevLink.href = '#';
        prevLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                updateView();
            }
        });

        prevButton.appendChild(prevLink);
        paginationContainer.appendChild(prevButton);

        /* page numbers */
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('li');
            pageButton.className = `page-item ${currentPage === i ? 'active' : ''}`;

            if (currentPage === i) {
                const currentSpan = document.createElement('span');
                currentSpan.className = 'page-link';
                currentSpan.textContent = i;
                pageButton.appendChild(currentSpan);
            } else {
                const pageLink = document.createElement('a');
                pageLink.className = 'page-link';
                pageLink.textContent = i;
                pageLink.href = '#';
                pageLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentPage = i;
                    updateView();
                });
                pageButton.appendChild(pageLink);
            }
            paginationContainer.appendChild(pageButton);
        }

        /* next button */
        const nextButton = document.createElement('li');
        nextButton.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        const nextLink = document.createElement('a');
        nextLink.className = 'page-link';
        nextLink.innerHTML = 'Next &raquo;';
        nextLink.href = '#';
        nextLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                updateView();
            }
        });
        nextButton.appendChild(nextLink);
        paginationContainer.appendChild(nextButton);
    }
});
