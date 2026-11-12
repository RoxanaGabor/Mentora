// main.js - Client-side JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // FAQ accordion functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions.length > 0) {
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                // Toggle active class
                question.classList.toggle('active');
                
                // Toggle corresponding answer
                const answer = question.nextElementSibling;
                answer.classList.toggle('show');
            });
        });
    }
    
    // Contact form validation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            let isValid = true;
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            // Remove any existing error messages
            document.querySelectorAll('.error-message').forEach(el => el.remove());
            
            // Validate name
            if (nameInput.value.trim() === '') {
                isValid = false;
                showError(nameInput, 'Name is required');
            }
            
            // Validate email
            if (emailInput.value.trim() === '') {
                isValid = false;
                showError(emailInput, 'Email is required');
            } else if (!isValidEmail(emailInput.value)) {
                isValid = false;
                showError(emailInput, 'Please enter a valid email address');
            }
            
            // Validate message
            if (messageInput.value.trim() === '') {
                isValid = false;
                showError(messageInput, 'Message is required');
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    // Review form validation
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            let isValid = true;
            const nameInput = document.getElementById('review-name');
            const ratingInputs = document.querySelectorAll('input[name="rating"]');
            const commentInput = document.getElementById('review-comment');
            
            // Remove any existing error messages
            document.querySelectorAll('.error-message').forEach(el => el.remove());
            
            // Validate name
            if (nameInput.value.trim() === '') {
                isValid = false;
                showError(nameInput, 'Name is required');
            }
            
            // Validate rating
            let ratingSelected = false;
            ratingInputs.forEach(input => {
                if (input.checked) {
                    ratingSelected = true;
                }
            });
            
            if (!ratingSelected) {
                isValid = false;
                showError(document.querySelector('.star-rating'), 'Please select a rating');
            }
            
            // Validate comment
            if (commentInput.value.trim() === '') {
                isValid = false;
                showError(commentInput, 'Comment is required');
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    // Helper function to show error messages
    function showError(input, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '0.9rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
        input.style.borderColor = 'red';
    }
    
    // Helper function to validate email format
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
});
