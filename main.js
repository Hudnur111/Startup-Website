/* ==========================================================================
   PRÄZIS — Website-weites JavaScript
   Wird von allen Seiten eingebunden. Steuert: mobiles Menü, Farbschema-Umschalter,
   Newsletter-, Kontakt- und Screening-Formular (inkl. E-Mail-Benachrichtigung,
   Formular-Autospeicherung) und die Einblend-Animation beim Scrollen.
   ========================================================================== */

/* ==========================================================================
   Farbschema (Hell/Dunkel)
   ==========================================================================
   Folgt standardmäßig der Systemeinstellung (siehe CSS @media prefers-color-scheme).
   Über den Umschalter im Header kann das manuell überschrieben werden — die Wahl
   wird in localStorage gemerkt. Ein kleines Inline-Script im <head> jeder Seite
   wendet eine gespeicherte Wahl schon vor dem ersten Rendern an, damit die Seite
   nicht kurz im falschen Farbschema aufblitzt. */
(function(){
  var STORAGE_KEY = 'praezis-theme';
  var root = document.documentElement;
  var mql = window.matchMedia('(prefers-color-scheme: dark)');

  function systemTheme(){ return mql.matches ? 'dark' : 'light'; }
  function currentTheme(){ return root.getAttribute('data-theme') || systemTheme(); }

  function updateButtons(){
    var isDark = currentTheme() === 'dark';
    document.querySelectorAll('.theme-toggle').forEach(function(btn){
      btn.classList.toggle('is-dark', isDark);
      btn.setAttribute('aria-label', isDark ? 'Helles Farbschema aktivieren' : 'Dunkles Farbschema aktivieren');
    });
  }

  document.querySelectorAll('.theme-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch(e){}
      updateButtons();
    });
  });

  if (mql.addEventListener) {
    mql.addEventListener('change', function(){
      var saved;
      try { saved = localStorage.getItem(STORAGE_KEY); } catch(e){}
      if (!saved) { updateButtons(); }
    });
  }

  updateButtons();
})();

/* ==========================================================================
   Cookie-Hinweis
   ==========================================================================
   Diese Website setzt keine Tracking- oder Marketing-Cookies. Die einzige
   Speicherung im Browser ist technisch notwendige localStorage (Farbschema-Wahl,
   Formular-Entwürfe) — siehe Datenschutzerklärung. Der Hinweis informiert einmalig
   darüber; über den Footer-Link "Cookie-Einstellungen" lässt er sich jederzeit
   erneut aufrufen.

   Bewusst KEIN "Alle akzeptieren / Ablehnen"-Pärchen: Es gibt keine optionalen
   Cookies, über die man abstimmen könnte — beide Buttons würden exakt dasselbe
   tun. Das vorzutäuschen wäre irreführend. Stattdessen zeigt "Details" ehrlich,
   was aktuell im Browser gespeichert ist, mit echter Löschfunktion. */
(function(){
  var SEEN_KEY = 'praezis-cookie-notice-seen';

  function describeStorage(){
    var theme;
    try { theme = localStorage.getItem('praezis-theme'); } catch(e){}
    var themeLabel = theme === 'dark' ? 'Dunkel (manuell gewählt)' : theme === 'light' ? 'Hell (manuell gewählt)' : 'Folgt Systemeinstellung';
    var hasContactDraft = false, hasScreeningDraft = false;
    try { hasContactDraft = !!localStorage.getItem('praezis-draft-contact-form'); } catch(e){}
    try { hasScreeningDraft = !!localStorage.getItem('praezis-draft-screening-form'); } catch(e){}
    return [
      { label: 'Farbschema', value: themeLabel },
      { label: 'Kontaktformular-Entwurf', value: hasContactDraft ? 'Vorhanden' : 'Keiner gespeichert' },
      { label: 'Screening-Formular-Entwurf', value: hasScreeningDraft ? 'Vorhanden' : 'Keiner gespeichert' }
    ];
  }

  function renderDetails(panel){
    var rows = describeStorage();
    panel.innerHTML = '<div class="cookie-details-list">' + rows.map(function(r){
      return '<div class="cookie-details-row"><span>' + r.label + '</span><strong>' + r.value + '</strong></div>';
    }).join('') + '</div>' +
      '<button type="button" class="cookie-details-clear" id="cookie-clear-all">Gespeicherte Daten jetzt löschen</button>';
    document.getElementById('cookie-clear-all').addEventListener('click', function(){
      try {
        localStorage.removeItem('praezis-theme');
        localStorage.removeItem('praezis-draft-contact-form');
        localStorage.removeItem('praezis-draft-screening-form');
      } catch(e){}
      document.documentElement.removeAttribute('data-theme');
      var contactForm = document.getElementById('contact-form');
      var screeningForm = document.getElementById('screening-form');
      if (contactForm && contactForm.__clearDraft) { contactForm.__clearDraft(); }
      if (screeningForm && screeningForm.__clearDraft) { screeningForm.__clearDraft(); }
      renderDetails(panel);
    });
  }

  function showBanner(){
    if (document.querySelector('.cookie-banner')) return;
    var banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie-Hinweis');
    banner.innerHTML =
      '<div class="cookie-banner-main">' +
        '<div class="cookie-banner-icon" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M12 2a10 10 0 1 0 9.54 13.05 4 4 0 0 1-4.9-4.9A4 4 0 0 1 12 5.5c0-1.1.4-2.1 1.05-2.87A9.96 9.96 0 0 0 12 2Z"/>' +
            '<circle cx="8.7" cy="10.8" r=".6" fill="currentColor" stroke="none"/>' +
            '<circle cx="11.5" cy="15.2" r=".6" fill="currentColor" stroke="none"/>' +
            '<circle cx="15.2" cy="9.6" r=".6" fill="currentColor" stroke="none"/>' +
          '</svg>' +
        '</div>' +
        '<div class="cookie-banner-body">' +
          '<p class="cookie-banner-title">Datenschutz-Hinweis</p>' +
          '<p class="cookie-banner-text">Diese Website verwendet ausschließlich technisch notwendige lokale Speicherung im Browser (Farbschema, Formular-Entwürfe) — keine Tracking- oder Marketing-Cookies. <a href="datenschutz.html">Mehr erfahren</a></p>' +
        '</div>' +
        '<div class="cookie-banner-actions">' +
          '<button type="button" class="btn btn-outline cookie-banner-details-toggle" id="cookie-banner-details" aria-expanded="false">' +
            '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>' +
            'Details' +
          '</button>' +
          '<button type="button" class="btn btn-primary" id="cookie-banner-ok">Verstanden</button>' +
        '</div>' +
      '</div>' +
      '<div class="cookie-banner-details" id="cookie-banner-details-panel" hidden></div>';
    document.body.appendChild(banner);

    var detailsBtn = document.getElementById('cookie-banner-details');
    var detailsPanel = document.getElementById('cookie-banner-details-panel');
    detailsBtn.addEventListener('click', function(){
      var isOpen = !detailsPanel.hasAttribute('hidden');
      if (isOpen) {
        detailsPanel.setAttribute('hidden', '');
        detailsBtn.setAttribute('aria-expanded', 'false');
      } else {
        renderDetails(detailsPanel);
        detailsPanel.removeAttribute('hidden');
        detailsBtn.setAttribute('aria-expanded', 'true');
      }
    });

    document.getElementById('cookie-banner-ok').addEventListener('click', function(){
      try { localStorage.setItem(SEEN_KEY, '1'); } catch(e){}
      banner.remove();
    });
  }

  var seen;
  try { seen = localStorage.getItem(SEEN_KEY); } catch(e){}
  if (!seen) { showBanner(); }

  document.querySelectorAll('.cookie-settings-link').forEach(function(link){
    link.addEventListener('click', function(e){
      e.preventDefault();
      showBanner();
      var btn = document.getElementById('cookie-banner-details');
      if (btn) { btn.click(); }
    });
  });
})();

/* ==========================================================================
   E-Mail-Versand (EmailJS)
   ==========================================================================
   Kontakt- und Screening-Formular laufen technisch weiter über Netlify Forms
   (Speicherung, Spam-Schutz, Datei-Uploads). Zusätzlich verschickt EmailJS
   direkt aus dem Browser zwei E-Mails, ganz ohne eigenen Server:
     1. Admin-Benachrichtigung an denny.svalina.praezis@gmail.com — Absender
        "BotWebsite", eigener Betreff, alle Formulardaten übersichtlich gelistet.
        Vorlage: emailjs-template-admin.html
     2. Automatische Empfangsbestätigung an den Absender selbst ("Auto-Reply").
        Vorlage: emailjs-template-guide.html

   Public Key & Service ID sind bereits eingetragen. Es fehlt nur noch die
   Template ID der Admin-Benachrichtigung (siehe EMAILJS_ADMIN_TEMPLATE_ID
   unten) — die Auto-Reply-Template-ID ist schon gesetzt. */
var EMAILJS_PUBLIC_KEY  = 'T5GDR_4iuw9vd0aan';
var EMAILJS_SERVICE_ID  = 'service_isgveb7';
var EMAILJS_ADMIN_TEMPLATE_ID    = 'template_99jioko';
var EMAILJS_CUSTOMER_TEMPLATE_ID = 'template_k61jn3l';
var EMAILJS_READY = EMAILJS_PUBLIC_KEY.indexOf('DEIN_') !== 0;
var EMAILJS_ADMIN_READY    = EMAILJS_READY && EMAILJS_ADMIN_TEMPLATE_ID.indexOf('DEIN_') !== 0;
var EMAILJS_CUSTOMER_READY = EMAILJS_READY && EMAILJS_CUSTOMER_TEMPLATE_ID.indexOf('DEIN_') !== 0;

if (EMAILJS_READY) {
  var emailjsScript = document.createElement('script');
  emailjsScript.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  emailjsScript.onload = function(){
    if (window.emailjs) { window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); }
  };
  document.head.appendChild(emailjsScript);
}

/* Ermittelt die sichtbare Beschriftung eines Feldes (Label, aria-label oder Feldname). */
function getFieldLabel(el){
  if (el.id) {
    var lbl = document.querySelector('label[for="' + el.id + '"]');
    if (lbl) return lbl.textContent.trim();
  }
  var parentLabel = el.closest('label');
  if (parentLabel) return parentLabel.textContent.trim();
  if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');
  return el.name;
}

/* Baut aus einem Formular eine übersichtliche, nach Abschnitten gegliederte
   Text-Zusammenfassung aller ausgefüllten Felder — für den E-Mail-Inhalt. */
function buildEmailSummary(form){
  var lines = [];
  var nodes = form.querySelectorAll('.form-field, .slot-row, .form-step-title, .form-section-title');

  nodes.forEach(function(node){
    if (node.classList.contains('form-step-title') || node.classList.contains('form-section-title')) {
      lines.push('');
      lines.push('— ' + node.textContent.trim().toUpperCase() + ' —');
      return;
    }

    var directLabel = node.querySelector(':scope > label');
    var heading = (directLabel && !directLabel.classList.contains('checkbox-chip')) ? directLabel.textContent.trim() : null;
    var values = [];

    node.querySelectorAll('.checkbox-chip input[type="checkbox"]').forEach(function(cb){
      if (!cb.checked) return;
      var chip = cb.closest('.checkbox-chip');
      values.push(chip ? chip.textContent.trim() : cb.value);
    });

    node.querySelectorAll('input, select, textarea').forEach(function(el){
      if (el.type === 'checkbox' || el.type === 'hidden' || el.type === 'file') return;
      if (!el.value) return;
      var lbl = getFieldLabel(el);
      if (el.tagName === 'SELECT') {
        values.push(lbl + ': ' + el.options[el.selectedIndex].text);
      } else if (lbl && lbl !== heading) {
        values.push(lbl + ': ' + el.value);
      } else {
        values.push(el.value);
      }
    });

    var fileInput = node.querySelector('input[type="file"]');
    if (fileInput && fileInput.files && fileInput.files.length) {
      var names = [];
      Array.prototype.forEach.call(fileInput.files, function(f){ names.push(f.name); });
      values.push('Angehängte Dateien (Download im Netlify-Formular-Dashboard): ' + names.join(', '));
    }

    if (!values.length) return;
    if (heading) lines.push(heading + ':');
    values.forEach(function(v){ lines.push('  • ' + v); });
  });

  return lines.join('\n').trim();
}

/* Verschickt Admin-Benachrichtigung + Kunden-Auto-Reply per EmailJS.
   Bricht pro Mail still ab, solange die jeweilige Template ID noch nicht
   eingetragen ist (siehe Kommentar oben) — die andere Mail wird trotzdem
   verschickt, sobald sie bereit ist. */
function sendEmailNotification(form, subject, formLabel){
  if (typeof emailjs === 'undefined') return;

  var emailField = form.querySelector('input[type="email"]');
  var nameField = form.querySelector('input[name="name"]');
  var customerEmail = emailField && emailField.value ? emailField.value : '';
  var customerName = nameField && nameField.value ? nameField.value : 'dort';
  var now = new Date().toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
  var summary = buildEmailSummary(form) || '(Keine weiteren Angaben)';

  if (EMAILJS_ADMIN_READY) {
    var adminHeader = 'Formular: ' + formLabel
      + '\nEingegangen: ' + now
      + '\nName: ' + (customerName !== 'dort' ? customerName : '–')
      + '\nE-Mail: ' + (customerEmail || '–');
    var adminParams = {
      to_email: 'denny.svalina.praezis@gmail.com',
      from_name: 'BotWebsite',
      reply_to: customerEmail,
      subject: subject,
      message: adminHeader + '\n\n' + summary
    };
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_ADMIN_TEMPLATE_ID, adminParams).catch(function(err){
      console.warn('Admin-Benachrichtigung (EmailJS) fehlgeschlagen:', err);
    });
  }

  if (EMAILJS_CUSTOMER_READY && customerEmail) {
    var customerParams = {
      to_email: customerEmail,
      email: customerEmail,
      from_name: 'PRÄZIS',
      reply_to: 'denny.svalina.praezis@gmail.com',
      subject: 'Danke für Ihre Nachricht — PRÄZIS',
      absender_name: customerName,
      name: customerName,
      message: summary
    };
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CUSTOMER_TEMPLATE_ID, customerParams).catch(function(err){
      console.warn('Auto-Reply (EmailJS) fehlgeschlagen:', err);
    });
  }
}

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

  function wireNetlifyForm(formId, statusId, successMessage, emailSubject, formLabel){
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
      /* E-Mail-Benachrichtigung wird parallel losgeschickt — unabhängig von
         Netlify Forms, damit sie auch dann ankommt, wenn dort mal was hakt. */
      if (emailSubject) { sendEmailNotification(form, emailSubject, formLabel || formId); }
      fetch('/', fetchOptions).then(function(){
        status.textContent = successMessage;
        form.reset();
        var fileList = form.querySelector('.file-list');
        if (fileList) { fileList.innerHTML = ''; }
        var uploadError = document.getElementById('file-upload-error');
        if (uploadError) { uploadError.textContent = ''; }
        if (form.__clearDraft) { form.__clearDraft(); }
      }).catch(function(){
        status.textContent = 'Danke! Der Versand klappt erst nach dem Netlify-Deploy — lokal kann das Formular nicht senden.';
      });
    });
  }

  wireNetlifyForm('newsletter-form', 'newsletter-status', 'Danke — Sie erhalten künftig Updates zu neuen Projekten.');
  wireNetlifyForm('contact-form', 'contact-form-status', 'Danke für Ihre Nachricht — wir melden uns innerhalb eines Werktags.', '!!!!! Neue Nachricht Kontaktformular !!!!!', 'Kontaktformular');
  wireNetlifyForm('screening-form', 'screening-form-status', 'Danke für Ihr ausführliches Screening — wir melden uns innerhalb eines Werktags schriftlich.', '!!!!! Neue Nachricht Screening-Formular !!!!!', 'Screening-Formular');

  /* ---------- Formular-Autospeicherung (Entwurf) ----------
     Lange Formulare (v. a. das 8-teilige Screening) gehen bei versehentlich
     geschlossenem Tab oder Browser-Absturz sonst komplett verloren. Eingaben
     werden daher fortlaufend in localStorage gesichert und beim erneuten
     Öffnen der Seite automatisch wiederhergestellt — bis zum erfolgreichen
     Absenden oder manuellen Verwerfen. Datei-Anhänge lassen sich technisch
     nicht in localStorage speichern und bleiben daher außen vor. */
  function serializeFormDraft(form){
    var data = {};
    Array.prototype.forEach.call(form.elements, function(el){
      if (!el.name || el.type === 'hidden' || el.type === 'file' || el.type === 'submit') return;
      data[el.name] = el.type === 'checkbox' ? el.checked : el.value;
    });
    return data;
  }

  function applyFormDraft(form, data){
    Object.keys(data).forEach(function(name){
      var el = form.elements[name];
      if (!el || el.length) { return; } // el.length: RadioNodeList (mehrere gleichnamige Felder) wird hier nicht unterstützt
      if (el.type === 'checkbox') { el.checked = !!data[name]; }
      else { el.value = data[name]; }
    });
  }

  function hasMeaningfulDraft(data){
    return Object.keys(data).some(function(k){
      var v = data[k];
      return v === true || (typeof v === 'string' && v.trim() !== '');
    });
  }

  function wireFormDraft(formId){
    var form = document.getElementById(formId);
    if (!form) return;
    var key = 'praezis-draft-' + formId;

    function clearDraft(){
      try { localStorage.removeItem(key); } catch(e){}
      var banner = form.querySelector('.draft-banner');
      if (banner) { banner.remove(); }
    }
    form.__clearDraft = clearDraft;

    var saved;
    try { saved = localStorage.getItem(key); } catch(e){}
    if (saved) {
      var parsed = null;
      try { parsed = JSON.parse(saved); } catch(e){}
      if (parsed && parsed.fields && hasMeaningfulDraft(parsed.fields)) {
        applyFormDraft(form, parsed.fields);
        var timeStr = new Date(parsed.savedAt).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
        var banner = document.createElement('div');
        banner.className = 'draft-banner';
        var label = document.createElement('span');
        label.textContent = 'Entwurf vom ' + timeStr + ' automatisch wiederhergestellt.';
        var discardBtn = document.createElement('button');
        discardBtn.type = 'button';
        discardBtn.className = 'draft-banner-discard';
        discardBtn.textContent = 'Entwurf verwerfen';
        discardBtn.addEventListener('click', function(){
          form.reset();
          clearDraft();
        });
        banner.appendChild(label);
        banner.appendChild(discardBtn);
        form.insertBefore(banner, form.firstChild);
      } else {
        clearDraft();
      }
    }

    var saveTimeout;
    form.addEventListener('input', function(){
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(function(){
        var fields = serializeFormDraft(form);
        if (!hasMeaningfulDraft(fields)) { clearDraft(); return; }
        try { localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), fields: fields })); } catch(e){}
      }, 600);
    });
  }

  wireFormDraft('contact-form');
  wireFormDraft('screening-form');

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

  var MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB — siehe Hinweistext im Upload-Feld

  function wireFileUpload(dropId, inputId, listId, errorId){
    var drop = document.getElementById(dropId);
    var input = document.getElementById(inputId);
    var list = document.getElementById(listId);
    var errorEl = errorId ? document.getElementById(errorId) : null;
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
      var rejected = [];
      Array.prototype.forEach.call(fileListToAdd, function(f){
        if (f.size > MAX_FILE_SIZE) {
          rejected.push(f.name + ' (' + formatFileSize(f.size) + ')');
        } else {
          files.items.add(f);
        }
      });
      input.files = files.files;
      render();
      if (errorEl) {
        errorEl.textContent = rejected.length
          ? 'Zu groß, nicht hinzugefügt (max. 10 MB): ' + rejected.join(', ')
          : '';
      }
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

  wireFileUpload('file-drop', 'cf-anhaenge', 'file-list', 'file-upload-error');

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
