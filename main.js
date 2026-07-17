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
    /* Backdrop hinter dem Popup-Menü — schließt das Menü bei Tap daneben.
       Wird per JS erzeugt, damit keine der HTML-Seiten angepasst werden muss. */
    var navBackdrop = document.createElement('div');
    navBackdrop.className = 'nav-backdrop';
    navBackdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(navBackdrop);

    var closeNav = function(returnFocus){
      var wasOpen = document.body.classList.contains('nav-open');
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Menü öffnen');
      navIcon.innerHTML = '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>';
      if (returnFocus && wasOpen) { navToggle.focus(); }
    };
    var openNav = function(){
      document.body.classList.add('nav-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Menü schließen');
      navIcon.innerHTML = '<line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>';
      /* Fokus auf den ersten Menüpunkt, damit Tastatur- und Screenreader-Nutzer
         direkt im geöffneten Popup landen statt weiter auf dem Button zu stehen. */
      var firstLink = navLinks.querySelector('a');
      if (firstLink) { firstLink.focus(); }
    };
    navToggle.addEventListener('click', function(){
      document.body.classList.contains('nav-open') ? closeNav(true) : openNav();
    });
    navLinks.addEventListener('click', function(e){
      if (e.target.tagName === 'A') { closeNav(false); }
    });
    navBackdrop.addEventListener('click', function(){ closeNav(true); });
    window.addEventListener('keydown', function(e){
      if (e.key === 'Escape') { closeNav(true); }
    });
    window.addEventListener('resize', function(){
      if (window.innerWidth > 1060) { closeNav(); }
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
      var hasFile = !!form.querySelector('input[type="file"]');
      /* Bei Datei-Uploads muss FormData unverändert als Body gehen — der Browser
         setzt dann automatisch den richtigen multipart/form-data-Header inkl.
         Boundary. Ein manuell gesetzter Content-Type-Header würde das kaputt machen. */
      var fetchOptions = hasFile
        ? { method: 'POST', body: new FormData(form) }
        : { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: encodeFormData(form) };
      fetch('/', fetchOptions).then(function(){
        status.textContent = successMessage;
        form.reset();
        var fileList = form.querySelector('.file-list');
        if (fileList) { fileList.innerHTML = ''; }
      }).catch(function(){
        status.textContent = 'Danke! Der Versand klappt erst nach dem Netlify-Deploy — lokal kann das Formular nicht senden.';
      });
    });
  }

  wireNetlifyForm('newsletter-form', 'newsletter-status', 'Danke — Sie erhalten künftig Updates zu neuen Projekten.');
  wireNetlifyForm('contact-form', 'contact-form-status', 'Danke für Ihre Nachricht — wir melden uns innerhalb eines Werktags.');
  wireNetlifyForm('screening-form', 'screening-form-status', 'Danke für Ihr ausführliches Screening — wir melden uns innerhalb eines Werktags schriftlich.');

  /* ---------- Kontaktformular: weiteren Terminvorschlag hinzufügen ---------- */
  var addSlotBtn = document.getElementById('add-slot');
  var slotList = document.getElementById('slot-list');
  if (addSlotBtn && slotList) {
    addSlotBtn.addEventListener('click', function(){
      var nextIndex = slotList.querySelectorAll('.slot-row').length + 1;
      var row = document.createElement('div');
      row.className = 'slot-row';
      row.innerHTML =
        '<span class="slot-index">' + nextIndex + '</span>' +
        '<input type="date" name="termin_' + nextIndex + '_datum" aria-label="Terminvorschlag ' + nextIndex + ' – Datum">' +
        '<input type="time" name="termin_' + nextIndex + '_uhrzeit" aria-label="Terminvorschlag ' + nextIndex + ' – Uhrzeit">';
      slotList.appendChild(row);
      setMinDateOnInputs(row);
    });
  }

  /* ---------- Datei-Upload mit Drag & Drop (Screening-Formular) ---------- */
  function formatFileSize(bytes){
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function wireFileUpload(dropId, inputId, listId){
    var drop = document.getElementById(dropId);
    var input = document.getElementById(inputId);
    var list = document.getElementById(listId);
    if (!drop || !input || !list || typeof DataTransfer === 'undefined') return;

    var files = new DataTransfer();

    function render(){
      list.innerHTML = '';
      Array.prototype.forEach.call(files.files, function(file, idx){
        var item = document.createElement('div');
        item.className = 'file-list-item';
        var label = document.createElement('span');
        label.textContent = file.name + ' (' + formatFileSize(file.size) + ')';
        var removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '×';
        removeBtn.setAttribute('aria-label', 'Datei entfernen: ' + file.name);
        removeBtn.addEventListener('click', function(){
          files.items.remove(idx);
          input.files = files.files;
          render();
        });
        item.appendChild(label);
        item.appendChild(removeBtn);
        list.appendChild(item);
      });
    }

    function addFiles(fileListToAdd){
      Array.prototype.forEach.call(fileListToAdd, function(f){ files.items.add(f); });
      input.files = files.files;
      render();
    }

    input.addEventListener('change', function(){ addFiles(input.files); });

    ['dragenter', 'dragover'].forEach(function(evt){
      drop.addEventListener(evt, function(e){ e.preventDefault(); drop.classList.add('is-dragover'); });
    });
    ['dragleave', 'drop'].forEach(function(evt){
      drop.addEventListener(evt, function(e){ e.preventDefault(); drop.classList.remove('is-dragover'); });
    });
    drop.addEventListener('drop', function(e){ addFiles(e.dataTransfer.files); });
  }

  wireFileUpload('file-drop', 'cf-anhaenge', 'file-list');

  /* ---------- Datumsfelder: kein Datum in der Vergangenheit wählbar ---------- */
  function setMinDateOnInputs(scope){
    var today = new Date().toISOString().slice(0, 10);
    (scope || document).querySelectorAll('input[type="date"]').forEach(function(el){
      el.min = today;
    });
  }
  setMinDateOnInputs(document);

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
      if (!el.style.getPropertyValue('--i')) {
        el.style.setProperty('--i', i % 8);
      }
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

});
