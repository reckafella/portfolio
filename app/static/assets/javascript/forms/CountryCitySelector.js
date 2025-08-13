/**
 * CountryCitySelector - Handles dynamic country/city selection
 * Fetches cities based on selected country and updates city dropdown
 * @class CountryCitySelector
 */
export class CountryCitySelector {
    /**
     * Constructor for CountryCitySelector
     * @param {string} countryFieldId - The ID of the country select field
     * @param {string} cityFieldId - The ID of the city select field
     * @param {string} apiEndpoint - The API endpoint to fetch cities
     */
    constructor(countryFieldId, cityFieldId, apiEndpoint = '/api/cities/') {
        this.countryField = document.getElementById(countryFieldId);
        this.cityField = document.getElementById(cityFieldId);
        this.apiEndpoint = apiEndpoint;
        
        // Store initial values
        this.initialCountry = this.countryField ? this.countryField.value : '';
        this.initialCity = this.cityField ? this.cityField.value : '';
        
        this.init();
    }
    
    /**
     * Initialize the country/city selector
     */
    init() {
        if (!this.countryField || !this.cityField) {
            console.error('CountryCitySelector: Country or city field not found');
            return;
        }
        
        // Set up event listener for country changes
        this.countryField.addEventListener('change', this.handleCountryChange.bind(this));
        
        // If there's an initial country selected, load its cities
        if (this.initialCountry) {
            this.loadCitiesForCountry(this.initialCountry, this.initialCity);
        }
    }
    
    /**
     * Handle country field change
     * @param {Event} event - The change event
     */
    handleCountryChange(event) {
        const countryCode = event.target.value;
        
        if (countryCode) {
            this.loadCitiesForCountry(countryCode);
        } else {
            this.resetCityField();
        }
    }
    
    /**
     * Load cities for the selected country
     * @param {string} countryCode - The country code
     * @param {string} selectedCity - The city to select (optional)
     */
    async loadCitiesForCountry(countryCode, selectedCity = null) {
        try {
            // Show loading state
            this.showLoadingState();
            
            // Fetch cities from API
            const response = await fetch(`${this.apiEndpoint}?country=${countryCode}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': this.getCSRFToken()
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.cities) {
                this.populateCityField(data.cities, selectedCity);
            } else {
                console.error('Failed to load cities:', data.error || 'Unknown error');
                this.showErrorState();
            }
            
        } catch (error) {
            console.error('Error loading cities:', error);
            this.showErrorState();
        }
    }
    
    /**
     * Populate the city field with options
     * @param {Array} cities - Array of city objects with value and label
     * @param {string} selectedCity - The city to select (optional)
     */
    populateCityField(cities, selectedCity = null) {
        // Clear existing options
        this.cityField.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a city';
        this.cityField.appendChild(defaultOption);
        
        // Add city options
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.value;
            option.textContent = city.label;
            
            // Select the city if it matches the selectedCity or initialCity
            if (selectedCity && city.value === selectedCity) {
                option.selected = true;
            } else if (!selectedCity && this.initialCity && city.value === this.initialCity) {
                option.selected = true;
            }
            
            this.cityField.appendChild(option);
        });
        
        // Enable the field and remove loading state
        this.cityField.disabled = false;
        this.cityField.classList.remove('loading');
        
        // Clear initial city after first load
        if (this.initialCity) {
            this.initialCity = null;
        }
    }
    
    /**
     * Reset the city field to its initial state
     */
    resetCityField() {
        this.cityField.innerHTML = '';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a country first';
        this.cityField.appendChild(defaultOption);
        
        this.cityField.disabled = true;
        this.cityField.classList.remove('loading', 'error');
    }
    
    /**
     * Show loading state for city field
     */
    showLoadingState() {
        this.cityField.disabled = true;
        this.cityField.classList.add('loading');
        this.cityField.classList.remove('error');
        
        this.cityField.innerHTML = '';
        const loadingOption = document.createElement('option');
        loadingOption.value = '';
        loadingOption.textContent = 'Loading cities...';
        this.cityField.appendChild(loadingOption);
    }
    
    /**
     * Show error state for city field
     */
    showErrorState() {
        this.cityField.disabled = false;
        this.cityField.classList.remove('loading');
        this.cityField.classList.add('error');
        
        this.cityField.innerHTML = '';
        const errorOption = document.createElement('option');
        errorOption.value = '';
        errorOption.textContent = 'Error loading cities';
        this.cityField.appendChild(errorOption);
    }
    
    /**
     * Get CSRF token from meta tag or cookie
     * @returns {string} CSRF token
     */
    getCSRFToken() {
        // Try to get from meta tag first
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        
        // Fallback to cookie
        const name = 'csrftoken';
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue || '';
    }
    
    /**
     * Get current selected values
     * @returns {Object} Object with country and city values
     */
    getSelectedValues() {
        return {
            country: this.countryField ? this.countryField.value : '',
            city: this.cityField ? this.cityField.value : ''
        };
    }
    
    /**
     * Set selected values programmatically
     * @param {string} countryCode - The country code to select
     * @param {string} cityName - The city name to select (optional)
     */
    setSelectedValues(countryCode, cityName = null) {
        if (this.countryField && countryCode) {
            this.countryField.value = countryCode;
            if (cityName) {
                this.loadCitiesForCountry(countryCode, cityName);
            } else {
                this.loadCitiesForCountry(countryCode);
            }
        }
    }
}
