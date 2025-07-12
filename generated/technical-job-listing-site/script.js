console.log('TechJobsHub script loaded successfully!');

// You can add more interactive JavaScript functionalities here later!
// For example, dynamic job loading, search filtering, etc.

// Example: Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
