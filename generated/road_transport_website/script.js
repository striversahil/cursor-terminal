document.querySelectorAll('nav ul li a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Basic form submission feedback (optional)
document.querySelector('.contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    this.reset();
});

// Dark Mode Toggle Logic
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// Function to apply theme
function applyTheme(theme) {
    if (theme === 'dark-mode') {
        body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️'; // Sun emoji for dark mode
    } else {
        body.classList.remove('dark-mode');
        darkModeToggle.textContent = '🌙'; // Moon emoji for light mode
    }
}

// Check for user's preferred mode in localStorage on load
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    applyTheme(savedTheme);
} else {
    // Default to light mode if no preference is saved
    applyTheme('light-mode');
}

// Event listener for toggle button
darkModeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark-mode')) {
        applyTheme('light-mode');
        localStorage.setItem('theme', 'light-mode');
    } else {
        applyTheme('dark-mode');
        localStorage.setItem('theme', 'dark-mode');
    }
});
