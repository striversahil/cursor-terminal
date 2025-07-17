document.addEventListener('DOMContentLoaded', () => {
    // Get all like buttons
    const likeButtons = document.querySelectorAll('.post-actions button:first-child');

    likeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Toggle a 'liked' class on the button
            button.classList.toggle('liked');

            // Optionally, change text or icon based on liked state
            if (button.classList.contains('liked')) {
                button.innerHTML = '<i class="fas fa-thumbs-up"></i> Liked';
                button.style.color = 'var(--facebook-blue)';
            } else {
                button.innerHTML = '<i class="far fa-thumbs-up"></i> Like';
                button.style.color = 'var(--dark-grey)';
            }
        });
    });

    // You can add more interactive JavaScript features here later,
    // like handling comments, sharing, or dynamic content loading.
});
