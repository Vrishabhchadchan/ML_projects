// Get DOM elements
const form = document.getElementById('burnoutForm');
const resultsDiv = document.getElementById('results');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');

// Result display elements
const burnoutScoreSpan = document.getElementById('burnoutScore');
const burnoutLevelSpan = document.getElementById('burnoutLevel');
const burnoutMessageP = document.getElementById('burnoutMessage');

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
            work_hours: parseFloat(formData.get('work_hours')),
            screen_time_hours: parseFloat(formData.get('screen_time_hours')),
            meetings_count: parseInt(formData.get('meetings_count')),
            breaks_taken: parseInt(formData.get('breaks_taken')),
            after_hours_work: parseInt(formData.get('after_hours_work')),
            sleep_hours: parseFloat(formData.get('sleep_hours')),
            task_completion_rate: parseFloat(formData.get('task_completion_rate')),
            day_type_Weekend: formData.get('day_type_Weekend') ? 1 : 0  // Convert checkbox to 0/1
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
    for (const [key, value] of Object.entries(data)) {
        if (key !== 'day_type_Weekend' && (isNaN(value) || value === null || value === undefined)) {
            return false;
        }
    }
    
    // Validate ranges
    if (data.work_hours < 0 || data.work_hours > 24) return false;
    if (data.screen_time_hours < 0 || data.screen_time_hours > 24) return false;
    if (data.meetings_count < 0) return false;
    if (data.breaks_taken < 0) return false;
    if (data.after_hours_work < 0) return false;
    if (data.sleep_hours < 0 || data.sleep_hours > 24) return false;
    if (data.task_completion_rate < 0 || data.task_completion_rate > 100) return false;
    
    return true;
}

/**
 * Display prediction results
 */
function displayResults(data) {
    // Set burnout score
    burnoutScoreSpan.textContent = data.burnout_score;
    
    // Set burnout level with appropriate styling
    burnoutLevelSpan.textContent = data.burnout_level;
    burnoutLevelSpan.className = 'level ' + data.burnout_level.toLowerCase();
    
    // Set message
    burnoutMessageP.textContent = data.message;
    
    // Show results section
    resultsDiv.classList.remove('hidden');
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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