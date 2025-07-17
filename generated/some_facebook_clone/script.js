// script.js
console.log('Facebook clone script loaded!');

// You can add JavaScript functionality here, such as:
// - Handling the post button click event
// - Dynamically updating the news feed with new posts
// - Implementing like and comment features

// Example: Adding a simple alert when the post button is clicked
const postButton = document.querySelector('.post button');
if (postButton) {
    postButton.addEventListener('click', function() {
        alert('Post button clicked!');
    });
}
