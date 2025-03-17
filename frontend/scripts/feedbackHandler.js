document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');

    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        
        const feedback = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            type: document.getElementById('feedbackType').value,
            message: document.getElementById('feedbackText').value,
            timestamp: new Date().toISOString()
        };

        try {
            // Using relative URL instead of absolute
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(feedback)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Thank you for your feedback!');
                feedbackForm.reset();
            } else {
                throw new Error(data.error || 'Failed to submit feedback');
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert(`Error submitting feedback: ${error.message}`);
        } finally {
            submitButton.disabled = false;
        }
    });
});
