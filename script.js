// ---- Scroll Progress Bar ----
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (totalHeight > 0) {
    const progress = (window.scrollY / totalHeight) * 100;
    if (scrollProgress) {
      scrollProgress.style.width = `${progress}%`;
    }
  }
});

// ---- Scroll Reveal Animation (Intersection Observer) ----
const sections = document.querySelectorAll('.fade-section');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
}, { threshold: 0.12 });
sections.forEach(s => sectionObserver.observe(s));

// ---- Active Nav Link Highlighting ----
const navLinks = document.querySelectorAll('.rail nav a[href^="#"]');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => navObserver.observe(s));

// ---- Project Category Filter ----
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project[data-category]');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.getAttribute('data-filter');

    // Toggle active button state
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Filter project items with smooth fade effect
    projectCards.forEach(card => {
      const category = card.getAttribute('data-category');
      if (filter === 'all' || category.includes(filter)) {
        card.style.display = 'grid';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 50);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(8px)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 200);
      }
    });
  });
});

// ---- Interactive Copy Email Toast ----
function copyEmail(email) {
  navigator.clipboard.writeText(email).then(() => {
    showToast('Copied email to clipboard!');
  }).catch(() => {
    showToast(`Email: ${email}`);
  });
}

function showToast(message) {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}
