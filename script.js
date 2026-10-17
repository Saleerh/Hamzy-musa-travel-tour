(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.focus();
      }
    });
  }

  document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
    const select = document.querySelector('#service');
    if (select) select.value = link.dataset.service;
  }));
  document.querySelectorAll('[data-destination]').forEach(link => link.addEventListener('click', () => {
    const select = document.querySelector('#destination');
    if (select) select.value = link.dataset.destination;
  }));

  const form = document.querySelector('#contactForm');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const destination = String(data.get('destination') || '');
    const service = String(data.get('service') || '');
    const message = String(data.get('message') || '').trim();
    const status = document.querySelector('#formStatus');
    if (!name || !phone || !destination || !service) {
      if (status) status.textContent = 'Please complete all required fields.';
      return;
    }
    const text = [
      'Hello Hamzy Musa Travel & Tours, I would like to make an enquiry.', '',
      `Name: ${name}`, `Phone / WhatsApp: ${phone}`,
      `Destination: ${destination}`, `Service: ${service}`,
      message ? `More details: ${message}` : ''
    ].filter(Boolean).join('\n');
    if (status) status.textContent = 'Opening WhatsApp. Review your enquiry and tap Send to contact our team.';
    const url = `https://wa.me/2349128496030?text=${encodeURIComponent(text)}`;
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.href = url;
  });
  // V2 trip builder: turns a few quick choices into a prefilled enquiry.
  const purposeButtons = [...document.querySelectorAll('.purpose-option')];
  const purposeInput = document.querySelector('#quickPurpose');
  purposeButtons.forEach(button => button.addEventListener('click', () => {
    purposeButtons.forEach(item => { item.classList.remove('active'); item.setAttribute('aria-pressed', 'false'); });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
    if (purposeInput) purposeInput.value = button.dataset.purpose || 'Tourism / visit';
  }));
  const buildButton = document.querySelector('#buildEnquiry');
  if (buildButton) buildButton.addEventListener('click', () => {
    const destination = document.querySelector('#quickDestination')?.value || 'Other';
    const service = document.querySelector('#quickService')?.value || 'General enquiry';
    const purpose = purposeInput?.value || 'Tourism / visit';
    const destinationField = document.querySelector('#destination');
    const serviceField = document.querySelector('#service');
    const messageField = document.querySelector('#message');
    if (destinationField) destinationField.value = destination;
    if (serviceField) serviceField.value = service;
    if (messageField) messageField.value = `Travel purpose: ${purpose}. Please advise me on the next steps.`;
    const formHeading = document.querySelector('.form-heading');
    if (formHeading) formHeading.setAttribute('data-ready', 'true');
    document.querySelector('#contact')?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    window.setTimeout(() => document.querySelector('#name')?.focus({preventScroll:true}), 450);
  });

  // Light scroll reveals; content remains visible if IntersectionObserver is unavailable.
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('reveal-ready');
    const revealTargets = document.querySelectorAll('.section-heading, .service-card, .destination-card, .process-steps article, .about-copy, .faq-item, .finder-card, .finder-copy');
    revealTargets.forEach((element, index) => {
      element.classList.add('reveal-up');
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.12, rootMargin: '0px 0px -35px 0px'});
    revealTargets.forEach(element => observer.observe(element));
  }


  // V3 booking request: saves a local demo record and opens WhatsApp for actual delivery.
  const bookingForm = document.querySelector('#bookingRequestForm');
  if (bookingForm) bookingForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const request = Object.fromEntries(formData.entries());
    request.id = `HM-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    request.createdAt = new Date().toISOString();
    request.status = 'New';
    const status = document.querySelector('#bookingRequestStatus');
    try {
      const existing = JSON.parse(localStorage.getItem('hmtt_v3_requests') || '[]');
      existing.unshift(request);
      localStorage.setItem('hmtt_v3_requests', JSON.stringify(existing.slice(0, 250)));
    } catch (error) {
      // Private browsing or storage restrictions should not prevent WhatsApp enquiry.
    }
    const message = [
      `Hello Hamzy Musa Travel & Tours, I'd like to submit a travel request.`,
      `Request reference: ${request.id}`,
      `Name: ${request.name}`, `Phone: ${request.phone}`,
      request.email ? `Email: ${request.email}` : '',
      `Destination: ${request.destination}`, `Purpose: ${request.purpose}`,
      `Service: ${request.service}`, request.date ? `Preferred departure: ${request.date}` : '',
      `Travellers: ${request.travelers || 'Not specified'}`, request.notes ? `Additional details: ${request.notes}` : '',
      '', 'Please advise me on availability, requirements, and next steps. I understand this is a request and not a confirmed booking.'
    ].filter(Boolean).join('\n');
    if (status) status.textContent = `Request ${request.id} prepared. WhatsApp will open so you can review and send it to our team.`;
    const url = `https://wa.me/2349128496030?text=${encodeURIComponent(message)}`;
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.href = url;
  });
  const dateInput = document.querySelector('#bookDate');
  if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
