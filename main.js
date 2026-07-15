/* ==========================================================================
   PRÄZIS — Website-weites JavaScript
   Wird von allen Seiten eingebunden. Steuert: mobiles Menü, Newsletter-Formular,
   Kontaktformular (Demo) und die Einblend-Animation beim Scrollen.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function(){

  /* ---------- Mobiles Menü ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var navIcon = document.getElementById('nav-toggle-icon');
  var navLinks = document.getElementById('navlinks');

  if (navToggle && navLinks && navIcon) {
    var closeNav = function(){
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Menü öffnen');
      navIcon.innerHTML = '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>';
    };
    var openNav = function(){
      document.body.classList.add('nav-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Menü schließen');
      navIcon.innerHTML = '<line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>';
    };
    navToggle.addEventListener('click', function(){
      document.body.classList.contains('nav-open') ? closeNav() : openNav();
    });
    navLinks.addEventListener('click', function(e){
      if (e.target.tagName === 'A') { closeNav(); }
    });
    window.addEventListener('keydown', function(e){
      if (e.key === 'Escape') { closeNav(); }
    });
    window.addEventListener('resize', function(){
      if (window.innerWidth > 760) { closeNav(); }
    });
  }

  /* ---------- Aktiven Menüpunkt markieren ---------- */
  var currentPage = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.navlinks a').forEach(function(link){
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  /* ---------- Formulare: echter Versand über Netlify Forms ----------
     Beide Formulare tragen data-netlify="true" + ein verstecktes form-name-Feld.
     Netlify erkennt sie beim Deploy automatisch und legt ein Postfach dafür an
     (Site-Einstellungen > Forms). Lokal (file://) schlägt der fetch fehl —
     das ist normal, erst nach dem Netlify-Deploy funktioniert der Versand. */
  function encodeFormData(form){
    var data = new FormData(form);
    var pairs = [];
    data.forEach(function(value, key){
      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    });
    return pairs.join('&');
  }

  function wireNetlifyForm(formId, statusId, successMessage){
    var form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var status = document.getElementById(statusId);
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeFormData(form)
      }).then(function(){
        status.textContent = successMessage;
        form.reset();
      }).catch(function(){
        status.textContent = 'Danke! Der Versand klappt erst nach dem Netlify-Deploy — lokal kann das Formular nicht senden.';
      });
    });
  }

  wireNetlifyForm('newsletter-form', 'newsletter-status', 'Danke — Sie erhalten künftig Updates zu neuen Projekten.');
  wireNetlifyForm('contact-form', 'contact-form-status', 'Danke für Ihre Nachricht — wir melden uns innerhalb eines Werktags.');

  /* ---------- Scroll-Einblend-Animation ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el, i){
      el.style.setProperty('--i', i % 8);
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

});
