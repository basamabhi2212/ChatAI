function adminLogin() {
  const mobile = document.getElementById('mobile').value;
  if (mobile === '9999999999') { // Hardcoded admin number
    localStorage.setItem('mobile', mobile);
    localStorage.setItem('role', 'Admin');
    location.href = 'dashboard.html';
  } else {
    alert('Invalid Admin Number');
  }
}
