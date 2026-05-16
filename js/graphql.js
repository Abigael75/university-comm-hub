console.log('graphql.js loaded');
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Form intercepted! Now would call backend.');
    });
  } else {
    console.error('Form with id="loginForm" not found');
  }
});