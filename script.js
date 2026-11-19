/* Honeybunch portfolio interactions
 * Connects to the existing index.html markup. No framework or build step required.
 */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const projectData = {
    arthive: {
      title: 'ArtHive',
      subtitle: 'A digital gallery concept for art, literature, culture, and heritage.',
      description: 'ArtHive is a developing digital museum and gallery concept intended to make local creative works and cultural materials easier to discover. The project direction includes organized collections and tools for managing submitted content. The current portfolio artwork is an illustration, not a live product screenshot.',
      role: 'Student project contributor; interface and feature planning',
      type: 'Digital art gallery / cultural collection concept',
      features: 'Browse works by collection; organize Literature, Culture, Traditional works, and Artworks; planned user sign-in and authorized content upload and removal.',
      technologies: 'HTML, CSS, JavaScript, and Firebase in the prototype/planning workflow. Confirm the exact deployed configuration before presenting it as production-ready.',
      status: 'Prototype / in development. Live authentication, public uploads, and production moderation are not verified here.',
      screenshots: 'The card uses a CSS concept illustration. Add actual application screenshots when available.'
    },
    feed: {
      title: 'FEED — Emergency Food Assistance and Distribution System',
      subtitle: 'A web-based concept for coordinating food assistance in disaster-prone barangays.',
      description: 'FEED is a student system project focused on supporting the coordination of emergency food assistance and distribution in disaster-prone barangays in Catbalogan City, Samar. Its intended workflow brings relevant community participants and distribution information into one system. The card artwork is illustrative, not a system screenshot.',
      role: 'Student project contributor; requirements, system analysis, and documentation',
      type: 'Web-based emergency food assistance and distribution system',
      features: 'Role-based workflow concept for administrators, staff, volunteers, donors, and barangay officials; assistance and distribution coordination; geographic context for supported barangays.',
      technologies: 'Web application technologies and QGIS for geographic planning were part of the project context. Confirm the final implemented stack against your project documentation.',
      status: 'Academic project / prototype concept. Do not describe features as deployed unless they are implemented and tested.',
      screenshots: 'The card uses a CSS concept illustration. Replace it with approved screenshots from the actual system.'
    },
    'sweet-delicacy': {
      title: 'Honeybunch Sweet Delicacy',
      subtitle: 'A food-business website concept for product browsing and online ordering.',
      description: 'Honeybunch Sweet Delicacy is a developing e-commerce concept for presenting food products and organizing customer orders. The planned experience includes separate customer, administrator, and rider workflows, with delivery coverage focused on selected upland barangays in Catbalogan City. The portfolio artwork is illustrative.',
      role: 'Project owner / student developer',
      type: 'Food business website and online ordering prototype',
      features: 'Product browsing; customer cart and order flow; administrator and rider roles; delivery-area map concept; chatbot concept; order reference and QR receipt concept.',
      technologies: 'HTML, CSS, JavaScript, Leaflet map library, and QR-code library in the prototype workflow. COD, GCash, and PayPal are planned payment options only; payment processing is not implemented.',
      status: 'Prototype / in development. Online payment, live order dispatch, and production authentication are not active services.',
      screenshots: 'The card uses a CSS concept illustration. Add real product and interface screenshots when available.'
    }
  };

  // Footer year stays current without editing the HTML each year.
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Mobile navigation: supports keyboard, touch, and automatic close after navigation.
  const menuButton = $('.menu-toggle');
  const menu = $('#primary-menu');
  const closeMenu = () => {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    menu.classList.remove('is-open');
  };
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
      menu.classList.toggle('is-open', !isOpen);
    });
    $$('.nav-links a', menu).forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('click', event => {
      if (menuButton.getAttribute('aria-expanded') === 'true' && !menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 1024) closeMenu(); });
  }

  // Project details dialog uses the existing modal and field IDs in index.html.
  const dialog = $('#project-dialog');
  const panel = $('.project-dialog-panel', dialog || document);
  let lastProjectTrigger = null;
  let dialogCloseTimer = null;
  const setText = (id, value) => { const node = document.getElementById(id); if (node) node.textContent = value; };

  function openProject(key, trigger) {
    const project = projectData[key];
    if (!project || !dialog || !panel) return;
    lastProjectTrigger = trigger || document.activeElement;
    setText('project-dialog-title', project.title);
    setText('project-dialog-subtitle', project.subtitle);
    setText('project-dialog-description', project.description);
    setText('project-detail-role', project.role);
    setText('project-detail-type', project.type);
    setText('project-detail-features', project.features);
    setText('project-detail-technologies', project.technologies);
    setText('project-detail-status', project.status);
    setText('project-detail-screenshots', project.screenshots);
    const actions = $('#project-detail-actions');
    if (actions) { actions.replaceChildren(); actions.hidden = true; }
    window.clearTimeout(dialogCloseTimer);
    dialog.hidden = false;
    document.body.classList.add('dialog-open');
    document.body.dataset.hbPreviousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      dialog.classList.add('is-open');
      panel.focus({ preventScroll: true });
    });
  }

  function closeProject() {
    if (!dialog || dialog.hidden) return;
    dialog.classList.remove('is-open');
    document.body.classList.remove('dialog-open');
    document.body.style.overflow = document.body.dataset.hbPreviousOverflow || '';
    delete document.body.dataset.hbPreviousOverflow;
    dialogCloseTimer = window.setTimeout(() => {
      dialog.hidden = true;
      if (lastProjectTrigger && document.contains(lastProjectTrigger)) lastProjectTrigger.focus({ preventScroll: true });
    }, prefersReducedMotion ? 0 : 230);
  }

  $$('.project-card[data-project]').forEach(card => {
    card.addEventListener('click', event => {
      // Keep modifier-click and non-primary navigation behavior intact.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openProject(card.dataset.project, card);
    });
  });
  if (dialog) {
    $('.project-dialog-close', dialog)?.addEventListener('click', closeProject);
    $('[data-dialog-close]', dialog)?.addEventListener('click', closeProject);
    dialog.addEventListener('click', event => { if (event.target === dialog) closeProject(); });
  }

  // One global Escape handler and focus containment for the active dialog.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (dialog && !dialog.hidden) closeProject();
      closeMenu();
    }
    if (event.key === 'Tab' && dialog && !dialog.hidden && panel) {
      const focusable = $$('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])', panel).filter(el => !el.hidden && el.offsetParent !== null);
      if (!focusable.length) { event.preventDefault(); panel.focus(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  // Make service rows useful navigation targets without changing their visual design.
  $$('.service-list article').forEach((item, index) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'link');
    item.setAttribute('aria-label', `Ask about ${$('h3', item)?.textContent.trim() || 'this service'}`);
    const goToContact = () => { window.location.hash = 'contact'; };
    item.addEventListener('click', goToContact);
    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); goToContact(); }
    });
    item.dataset.serviceIndex = String(index + 1);
  });

  // Subtle entrance animation; content remains visible when reduced motion is requested.
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const targets = $$('.fact-card, .project-card, .service-list article, .journey-steps > div');
    targets.forEach(el => el.classList.add('hb-reveal'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    targets.forEach(el => observer.observe(el));
  }

  // Optional active-section indication for navigation links that point to page sections.
  if ('IntersectionObserver' in window) {
    const sections = $$('main section[id]');
    const sectionLinks = $$('.nav-links a[href^="#"]');
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(link => {
          if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else if (link.getAttribute('aria-current') === 'location') link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    sections.forEach(section => navObserver.observe(section));
  }
})();
