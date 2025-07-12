document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.navbar nav');

    hamburgerMenu.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when a navigation link is clicked (for smooth scrolling)
    document.querySelectorAll('.navbar nav ul li a').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });
});
