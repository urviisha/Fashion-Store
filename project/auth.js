// Check if user is logged in
document.addEventListener('DOMContentLoaded', () => {
  const user = localStorage.getItem('user');
  const authLink = document.getElementById('authLink');
  
  if (authLink) {
    if (user) {
      authLink.href = '#';
      authLink.onclick = () => {
        localStorage.removeItem('user');
        window.location.href = 'signin.html';
      };
    } else {
      authLink.href = 'signin.html';
    }
  }
});