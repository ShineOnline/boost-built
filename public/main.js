/**
 * Boost Builds - Front-End Interactions & Back-End Hook Markers
 * Target Niche: Contractor & Trades Website Design & Marketing Systems
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initContactForm();
  initBackendSystemMarkers();
});

/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const drawer = document.getElementById('nav-drawer');
  const closeBtn = document.getElementById('nav-drawer-close');

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });
  }

  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Close drawer if clicking link
  const drawerLinks = document.querySelectorAll('.nav-drawer-link');
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}


/**
 * Contact/Lead Generation Form Handler
 */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const phone = formData.get('phone');
      const trade = formData.get('trade');
      const message = formData.get('message');

      // Basic validation
      if (!name || !email || !phone) {
        alert('Please fill out all required fields (Name, Email, Phone).');
        return;
      }

      // Visual submission feedback
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending details...';

      // Send to Backend CRM API
      fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, trade, message })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          submitBtn.innerHTML = 'Sent Successfully!';
          contactForm.reset();
          alert(`Thanks, ${name}! We've received your request and will call/text you back in under 15 minutes.`);
        } else {
          alert('Error: ' + (data.error || 'Could not submit your details.'));
        }
      })
      .catch(err => {
        console.error('Error submitting form:', err);
        alert('Could not submit form. Please check your connection.');
      })
      .finally(() => {
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }, 3000);
      });
    });
  }
}

/**
 * System integration markers for future backend capabilities (login, editor panel, SEO config)
 */
function initBackendSystemMarkers() {
  console.log('--- BOOST BUILDS FRONT-END LOADED ---');
  console.log('MARKER [Login / Auth]: Backend routes to be mounted under `/admin/login` for editor dashboard.');
  console.log('MARKER [Static Content CMS]: Text-editing hooks initialized. Target endpoints: `/api/content/update`.');
  console.log('MARKER [SEO Manager]: SEO fields schema mapping: meta title, meta description, JSON-LD Schema. Configured for `/api/seo/save`.');
  console.log('MARKER [GMB Integrations]: Google Business Profile API sync hook prepared for local maps & reviews widget integration.');
}
