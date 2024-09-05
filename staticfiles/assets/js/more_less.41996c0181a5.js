document.addEventListener("DOMContentLoaded", function() {
    const toggleButtons = document.querySelectorAll(".toggle-description");

    toggleButtons.forEach(function(button) {
        const cardText = button.closest(".card-text");
        const shortDescription = cardText.querySelector(".short-description");
        const fullDescription = cardText.querySelector(".full-description");
        const fullLength = parseInt(fullDescription.getAttribute("data-length"));
        const shortLength = shortDescription.textContent.length;

        // Show the toggle button only if the full description is longer than the truncated one
        if (fullLength > shortLength) {
            button.style.display = "inline";
        }

        button.addEventListener("click", function() {
            if (fullDescription.style.display === "none") {
                fullDescription.style.display = "inline";
                shortDescription.style.display = "none";
                button.textContent = "Less";
            } else {
                fullDescription.style.display = "none";
                shortDescription.style.display = "inline";
                button.textContent = "More";
            }
        });
    });
});

/*
document.addEventListener("DOMContentLoaded", function() {
    const toggleButtons = document.querySelectorAll(".toggle-description");

    toggleButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            const cardText = this.closest(".card-text");
            const shortDescription = cardText.querySelector(".short-description");
            const fullDescription = cardText.querySelector(".full-description");

            if (fullDescription.style.display === "none") {
                fullDescription.style.display = "inline";
                shortDescription.style.display = "none";
                this.textContent = "Less";
            } else {
                fullDescription.style.display = "none";
                shortDescription.style.display = "inline";
                this.textContent = "More";
            }
        });
    });
});
*/
