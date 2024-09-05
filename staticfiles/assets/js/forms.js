const toastContainer = document.getElementById('liveToast');

const showToast = (type, message) => {
    // Set the toast body message
    const toastBody = document.getElementById('toastBody');
    toastBody.className = `alert toast-body alert-${type} text-bg-${type}`;
    toastBody.innerText = message;

    const toastTitle = document.getElementById('toastTitle');
    const toastIcon = document.getElementById('toastIcon');


    if (type === 'success') {
        toastTitle.innerText = 'Success';
        toastIcon.className = 'bi bi-check-circle-fill';
    } else if (type === 'danger' || type === 'warning') {
        toastTitle.innerText = 'Error';
        toastIcon.className = 'bi bi-exclamation-triangle-fill';
    } else if (type === 'info') {
        toastTitle.innerText = 'Info';
        toastIcon.className = 'bi bi-info-circle-fill';
    } else {
        toastTitle.innerText = '';
        toastIcon.className = '';
    }



    // Adjust the alert classes based on the type (success, error)
    const toastElement = document.getElementById('toast');
    toastElement.className = `toast alert alert-${type} fade show`;

    let now = new Date().toLocaleTimeString();
    document.getElementById('alert-time').textContent = now;

    toastContainer.style.display = 'grid';
    toastElement.style.display = 'grid';
    // Show the toast
    const toast = new bootstrap.Toast(toastElement, { autohide: false });
    toast.show();
};


const closeAlert = () => {
    toastContainer.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    let form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        let formData = new FormData(form);

        // Perform the fetch request
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showToast('success', `${data.message}`);
                window.location.href = data.redirect_url;
            } else {
                showToast('danger', `${data.errors}`);
            }
        })
        .catch(error => {
            showToast('error', 'An error occurred. Please try again.');
            console.error('There was a problem with the fetch operation:', error);
        });
    });

    // Add event listener to the close button
    let closeButton = document.querySelector('.btn-close');
    closeButton.addEventListener('click', closeAlert);
});
