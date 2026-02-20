// Function for Section switching
export function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.page-section').forEach(section => {
    section.hidden = true;
    section.classList.remove('active');
  });

  // Show target section
  const target = document.getElementById('section-' + sectionId);
  if (target) {
    target.hidden = false;
    target.classList.add('active');
    // Move focus to main for accessibility
    document.getElementById('main-content').focus();
  }

  // Update sidebar nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    const isActive = btn.dataset.section === sectionId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  // Update bottom navigation for mobile
  document.querySelectorAll('.bottom-nav-item').forEach(btn => {
    const isActive = btn.dataset.section === sectionId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}