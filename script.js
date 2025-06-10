class HealthcareForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5; // Updated from 6 to 5
        this.formData = {};
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateProgressBar();
        this.updateNavigation();
    }
    
    bindEvents() {
        // Navigation buttons
        document.getElementById('next-btn').addEventListener('click', () => this.nextStep());
        document.getElementById('prev-btn').addEventListener('click', () => this.prevStep());
        document.getElementById('submit-btn').addEventListener('click', (e) => this.submitForm(e));
        
        // Option cards (single select)
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectOption(e));
        });
        
        // Checkbox cards (multi-select)
        document.querySelectorAll('.checkbox-card input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleCheckboxChange(e));
        });
        
        // Form inputs
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', (e) => this.handleInputChange(e));
            input.addEventListener('blur', (e) => this.validateField(e.target));
        });
        
        // Secondary button
        document.querySelector('.secondary-btn').addEventListener('click', () => {
            alert('Redirecting to carer registration page...');
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }
    
    selectOption(e) {
        const card = e.currentTarget;
        const step = card.closest('.form-step');
        const stepNumber = parseInt(step.dataset.step);
        
        // Remove selection from other cards in the same step
        step.querySelectorAll('.option-card').forEach(otherCard => {
            otherCard.classList.remove('selected');
        });
        
        // Select current card
        card.classList.add('selected');
        
        // Store the value
        const value = card.dataset.value;
        
        switch(stepNumber) {
            case 1:
                this.formData.careType = value;
                document.getElementById('care_type').value = value;
                break;
            case 4:
                this.formData.startTime = value;
                document.getElementById('start_time').value = value;
                break;
        }
        
        // Auto-advance after a short delay for better UX
        setTimeout(() => {
            if (stepNumber < this.totalSteps) {
                this.nextStep();
            }
        }, 500);
    }
    
    handleCheckboxChange(e) {
        const checkbox = e.target;
        const card = checkbox.closest('.checkbox-card');
        
        if (checkbox.checked) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
        
        // Update form data
        const checkedBoxes = Array.from(document.querySelectorAll('input[name="care_needs"]:checked'));
        this.formData.careNeeds = checkedBoxes.map(cb => cb.value);
    }
    
    handleInputChange(e) {
        const input = e.target;
        this.formData[input.name] = input.value;
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
        }
        
        // Only validate format if field has a value
        if (value) {
            // Email validation
            if (field.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
            }
            
            // Phone validation - more flexible
            if (field.type === 'tel') {
                const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
                isValid = phoneRegex.test(value);
            }
            
            // Postcode validation - more flexible for various formats
            if (field.name === 'postcode') {
                // Accept any alphanumeric combination that looks like a postcode
                const postcodeRegex = /^[A-Z0-9\s]{3,10}$/i;
                isValid = postcodeRegex.test(value);
            }
        }
        
        // Visual feedback
        if (value && isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
        } else if (value && !isValid) {
            field.classList.remove('valid');
            field.classList.add('invalid');
        } else {
            field.classList.remove('valid', 'invalid');
        }
        
        return isValid;
    }
    
    validateStep(stepNumber) {
        const step = document.querySelector(`[data-step="${stepNumber}"]`);
        let isValid = true;
        
        switch(stepNumber) {
            case 1:
                isValid = !!this.formData.careType;
                if (!isValid) {
                    console.log('Step 1 validation failed: No care type selected');
                }
                break;
            case 2:
                isValid = this.formData.careNeeds && this.formData.careNeeds.length > 0;
                if (!isValid) {
                    console.log('Step 2 validation failed: No care needs selected');
                }
                break;
            case 3:
                const requiredFields = step.querySelectorAll('input[required]');
                console.log('Step 3 - Required fields:', requiredFields.length);
                
                isValid = Array.from(requiredFields).every(field => {
                    const fieldValid = field.value.trim() !== '' && this.validateField(field);
                    console.log(`Field ${field.name}: "${field.value}" - Valid: ${fieldValid}`);
                    return fieldValid;
                });
                
                if (!isValid) {
                    console.log('Step 3 validation failed: Required fields not completed');
                }
                break;
            case 4:
                isValid = !!this.formData.startTime;
                if (!isValid) {
                    console.log('Step 4 validation failed: No start time selected');
                }
                break;
            case 5:
                const finalRequiredFields = step.querySelectorAll('input[required]');
                isValid = Array.from(finalRequiredFields).every(field => {
                    const fieldValid = field.value.trim() !== '' && this.validateField(field);
                    console.log(`Final field ${field.name}: "${field.value}" - Valid: ${fieldValid}`);
                    return fieldValid;
                });
                
                if (!isValid) {
                    console.log('Step 5 validation failed: Required fields not completed');
                }
                break;
        }
        
        console.log(`Step ${stepNumber} validation result:`, isValid);
        return isValid;
    }
    
    nextStep() {
        if (!this.validateStep(this.currentStep)) {
            this.showValidationMessage();
            return;
        }
        
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStep();
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStep();
        }
    }
    
    updateStep() {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        currentStepElement.classList.add('active');
        
        // Update progress bar
        this.updateProgressBar();
        
        // Update navigation
        this.updateNavigation();
        
        // Update step counter
        document.getElementById('current-step').textContent = this.currentStep;
        
        // Scroll to top
        document.querySelector('.form-container').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    updateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        const percentage = (this.currentStep / this.totalSteps) * 100;
        progressFill.style.width = `${percentage}%`;
    }
    
    updateNavigation() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');
        
        // Previous button
        prevBtn.disabled = this.currentStep === 1;
        
        // Next/Submit button
        if (this.currentStep === this.totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'flex';
        } else {
            nextBtn.style.display = 'flex';
            submitBtn.style.display = 'none';
        }
    }
    
    showValidationMessage() {
        // Create and show validation message
        const existingMessage = document.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const message = document.createElement('div');
        message.className = 'validation-message';
        message.style.cssText = `
            background: #fee2e2;
            color: #dc2626;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            font-size: 14px;
            border: 1px solid #fecaca;
        `;
        message.textContent = 'Please complete all required fields before continuing.';
        
        const stepContent = document.querySelector(`[data-step="${this.currentStep}"] .step-content`);
        stepContent.appendChild(message);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
    }
    
    async submitForm(e) {
        e.preventDefault();
        
        if (!this.validateStep(this.currentStep)) {
            this.showValidationMessage();
            return;
        }
        
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            // Collect all form data
            const formElement = document.getElementById('healthcare-form');
            const formData = new FormData(formElement);
            
            // Add selected care needs
            if (this.formData.careNeeds) {
                formData.delete('care_needs'); // Remove existing entries
                this.formData.careNeeds.forEach(need => {
                    formData.append('care_needs[]', need);
                });
            }
            
            // Simulate API call
            await this.simulateApiCall(formData);
            
            // Show success message
            this.showSuccessMessage();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage(error.message);
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }
    
    async simulateApiCall(formData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Convert FormData to object for logging
        const data = {};
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        console.log('Form submitted with data:', data);
        
        // Simulate random success/failure for demo
        if (Math.random() < 0.9) { // 90% success rate
            return { success: true, message: 'Form submitted successfully!' };
        } else {
            throw new Error('Network error. Please try again.');
        }
    }
    
    showSuccessMessage() {
        const form = document.getElementById('healthcare-form');
        form.innerHTML = `
            <div class="success-message">
                <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
                <h3>Thank you for your submission!</h3>
                <p>We've received your care request and one of our specialists will contact you within 24 hours.</p>
                <p style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
                    Reference ID: #${Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
                <button onclick="window.location.reload()" style="
                    margin-top: 30px;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #9424a5 0%, #49a64a 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    Submit Another Request
                </button>
            </div>
        `;
    }
    
    showErrorMessage(message) {
        const existingMessage = document.querySelector('.error-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #fee2e2;
            color: #dc2626;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            border: 1px solid #fecaca;
        `;
        errorDiv.innerHTML = `
            <strong>Error:</strong> ${message}
            <button onclick="this.parentElement.remove()" style="
                margin-left: 10px;
                background: none;
                border: none;
                color: #dc2626;
                cursor: pointer;
                font-size: 18px;
            ">×</button>
        `;
        
        const stepContent = document.querySelector(`[data-step="${this.currentStep}"] .step-content`);
        stepContent.appendChild(errorDiv);
    }
    
    handleKeydown(e) {
        // Navigate with arrow keys
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
            if (this.currentStep < this.totalSteps) {
                this.nextStep();
            }
        } else if (e.key === 'ArrowLeft') {
            if (this.currentStep > 1) {
                this.prevStep();
            }
        }
        
        // Handle option selection with keyboard
        if (e.key === 'Enter' || e.key === ' ') {
            const focusedElement = document.activeElement;
            if (focusedElement.classList.contains('option-card')) {
                e.preventDefault();
                focusedElement.click();
            }
        }
    }
    
    // Method to prefill form data (useful for testing or returning users)
    prefillData(data) {
        Object.assign(this.formData, data);
        
        // Update UI elements
        Object.entries(data).forEach(([key, value]) => {
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                element.value = value;
                this.validateField(element);
            }
        });
    }
    
    // Method to get current form data
    getFormData() {
        return { ...this.formData };
    }
    
    // Method to reset form
    reset() {
        this.currentStep = 1;
        this.formData = {};
        
        // Reset UI
        document.getElementById('healthcare-form').reset();
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelectorAll('.checkbox-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        
        this.updateStep();
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.healthcareForm = new HealthcareForm();
    
    // Add some sample data for testing (remove in production)
    if (window.location.search.includes('demo=true')) {
        setTimeout(() => {
            window.healthcareForm.prefillData({
                postcode: 'SW1A 1AA',
                city: 'London',
                full_name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '07123456789'
            });
        }, 1000);
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealthcareForm;
}