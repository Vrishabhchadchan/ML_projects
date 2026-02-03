// Get DOM elements
const form = document.getElementById('salaryForm');
const resultsDiv = document.getElementById('results');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');

// Result display elements
const salaryAmountSpan = document.getElementById('salaryAmount');
const salaryLevelSpan = document.getElementById('salaryLevel');
const salaryMessageP = document.getElementById('salaryMessage');
const resultAgeSpan = document.getElementById('resultAge');
const resultExperienceSpan = document.getElementById('resultExperience');

// Input elements
const ageInput = document.getElementById('age');
const experienceInput = document.getElementById('experience');

/**
 * Dynamic validation: Update experience max based on age
 */
ageInput.addEventListener('input', function() {
    const age = parseInt(this.value);
    if (age && age >= 18) {
        const maxExperience = age - 18;
        experienceInput.setAttribute('max', maxExperience);
        
        // If current experience exceeds max, adjust it
        const currentExperience = parseInt(experienceInput.value);
        if (currentExperience > maxExperience) {
            experienceInput.value = maxExperience;
        }
    }
});

/**
 * Handle form submission
 */
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Hide previous results and errors
    resultsDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    
    // Show loading spinner
    loadingDiv.classList.remove('hidden');
    
    try {
        // Collect form data
        const formData = new FormData(form);
        
        // Build JSON payload with exact feature names matching the model
        const payload = {
            age: parseFloat(formData.get('age')),
            experience: parseFloat(formData.get('experience'))
        };
        
        // Validate inputs
        if (!validateInputs(payload)) {
            throw new Error('Please fill in all required fields with valid values.');
        }
        
        // Send POST request to Flask backend
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        // Parse response
        const data = await response.json();
        
        // Hide loading spinner
        loadingDiv.classList.add('hidden');
        
        // Check if request was successful
        if (!response.ok) {
            throw new Error(data.error || 'Prediction failed. Please try again.');
        }
        
        // Display results
        displayResults(data);
        
    } catch (error) {
        // Hide loading spinner
        loadingDiv.classList.add('hidden');
        
        // Show error message
        displayError(error.message);
    }
});

/**
 * Validate form inputs
 */
function validateInputs(data) {
    // Check for NaN values
    if (isNaN(data.age) || isNaN(data.experience)) {
        return false;
    }
    
    // Validate ranges
    if (data.age < 18 || data.age > 100) return false;
    if (data.experience < 0 || data.experience > (data.age - 18)) return false;
    
    return true;
}

/**
 * Display prediction results
 */
function displayResults(data) {
    // Animate salary count-up
    animateValue(salaryAmountSpan, 0, data.predicted_salary, 1000);
    
    // Set salary level with appropriate styling
    const levelClass = data.salary_level.toLowerCase().replace(' ', '');
    salaryLevelSpan.textContent = data.salary_level;
    salaryLevelSpan.className = 'level ' + levelClass;
    
    // Set additional details
    resultAgeSpan.textContent = `${data.age} years`;
    resultExperienceSpan.textContent = `${data.experience} years`;
    
    // Set message
    salaryMessageP.textContent = data.message;
    
    // Show results section
    resultsDiv.classList.remove('hidden');
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Animate number count-up effect
 */
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        element.textContent = current.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }, 16);
}

/**
 * Display error message
 */
function displayError(message) {
    errorDiv.textContent = `❌ Error: ${message}`;
    errorDiv.classList.remove('hidden');
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
    
    // Scroll to error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Add input validation feedback on blur
 */
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('blur', function() {
        const value = parseFloat(this.value);
        const min = parseFloat(this.min);
        const max = parseFloat(this.max);
        
        if (isNaN(value)) {
            this.style.borderColor = '#dc3545';
        } else if ((min !== null && value < min) || (max !== null && value > max)) {
            this.style.borderColor = '#ffc107';
        } else {
            this.style.borderColor = '#28a745';
        }
    });
    
    input.addEventListener('focus', function() {
        this.style.borderColor = '#667eea';
    });
});

/**
 * Reset form button (optional enhancement)
 */
form.addEventListener('reset', () => {
    resultsDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    
    // Reset all input border colors
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.style.borderColor = '#e0e0e0';
    });
});