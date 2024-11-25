document.addEventListener("DOMContentLoaded", function () {
    const toggleButtons = document.querySelectorAll(".toggle-description");

    toggleButtons.forEach(function (button) {
        const cardText = button.closest(".card-text");
        const shortDescription = cardText.querySelector(".short-description");
        const fullDescription = cardText.querySelector(".full-description");
        const fullLength = parseInt(fullDescription.getAttribute("data-length"));
        const shortLength = shortDescription.textContent.length;

        // Show the toggle button only if the full description is longer than the truncated one
        if (fullLength > shortLength) {
            button.style.display = "inline";
        }

        button.addEventListener("click", function () {
            if (fullDescription.classList.contains("d-none")) {
                fullDescription.classList.remove("d-none");
                shortDescription.classList.add("d-none");
                button.textContent = "Less";
                button.setAttribute("aria-expanded", "true");
            } else {
                fullDescription.classList.add("d-none");
                shortDescription.classList.remove("d-none");
                button.textContent = "More";
                button.setAttribute("aria-expanded", "false");
            }
        });
    });
});
