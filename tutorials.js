/* Honeybunch tutorial library interactions
 * Search, filters, sorting, accessible lesson dialogs, and honest premium previews.
 */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const search = $('#tutorial-search');
  const category = $('#tutorial-category');
  const access = $('#tutorial-access');
  const sort = $('#tutorial-sort');
  const grid = $('#tutorial-grid');
  const results = $('#tutorial-results');
  const empty = $('#tutorial-empty');
  const cards = grid ? $$('[data-tutorial-card]', grid) : [];
  const dialog = $('#lesson-dialog');
  const panel = $('.lesson-panel', dialog || document);
  const lessonContent = $('#lesson-content');
  let lastTrigger = null;
  let closeTimer = null;

  const lessons = {
    'va-tasks': {
      title: 'Organizing a Virtual Assistant’s Daily Task List',
      description: 'A practical beginner method for turning a busy list of requests into a clear daily work plan.',
      objectives: ['Separate urgent tasks from important tasks.', 'Record the deadline and expected output for each task.', 'Keep a short progress note that a client can understand.'],
      sections: [
        ['1. Capture every task', 'Write each request in one trusted list instead of keeping reminders in several chats or notes. Include the task name, requester, due date, and any required file or link.'],
        ['2. Set a useful priority', 'Mark tasks that are time-sensitive or block other work. Confirm priorities with the client when two deadlines compete; do not guess which task matters most.'],
        ['3. Break large work into steps', 'Turn a broad request into small actions such as gather information, prepare a draft, check details, and submit for review.'],
        ['4. Share a concise update', 'At an agreed check-in time, report what is complete, what is in progress, and what needs clarification. Keep client information private.'],
        ['Try it', 'Create a three-column task list: Task, Due date, and Next action. Add a Status column if it helps you track progress.']
      ]
    },
    'folder-system': {
      title: 'A Tidy Digital Folder System',
      description: 'Build a consistent folder and file-naming routine so documents are easier to locate and hand over.',
      objectives: ['Choose a folder structure that matches the work.', 'Use predictable file names and dates.', 'Keep shared files organized and access-controlled.'],
      sections: [
        ['1. Start with broad folders', 'Create a small number of top-level folders such as Projects, Administration, Reference, and Archive. Avoid making a new folder for every tiny task.'],
        ['2. Use a consistent naming pattern', 'A useful pattern is YYYY-MM-DD_Project_DocumentName_Version. For example: 2026-11-19_Honeybunch_ProjectBrief_v01. Use names that describe the contents.'],
        ['3. Keep versions clear', 'Use version numbers or a shared revision history. Avoid filenames such as final-final-new because they make it difficult to identify the current copy.'],
        ['4. Review access', 'Share only with people who need the file. Check whether a folder inherits public or organization-wide access before uploading private information.'],
        ['Try it', 'Choose one active project and reorganize a copy of its files using three folders: Working, Approved, and Reference.']
      ]
    },
    'semantic-html': {
      title: 'Your First Semantic HTML Page',
      description: 'Learn how meaningful HTML elements describe the structure and purpose of a web page.',
      objectives: ['Recognize common semantic page landmarks.', 'Organize content with headings and sections.', 'Use links and buttons for their correct purposes.'],
      sections: [
        ['1. Begin with the document shell', 'Use a doctype, an html element with a language, a head for metadata, and a body for visible page content. Set a useful page title and include a viewport meta tag for mobile layouts.'],
        ['2. Add page landmarks', 'Use header for introductory content, nav for major navigation, main for the primary page content, section for a thematic group, and footer for closing information.'],
        ['3. Keep headings in order', 'Use one clear h1 for the page’s main subject, then h2 and h3 headings to describe nested topics. Choose headings for meaning, not just their visual size.'],
        ['4. Choose the right interactive element', 'Use an anchor when the action navigates to another location. Use a button when the action changes something on the current page, such as opening a dialog.'],
        ['Try it', 'Create a page with a header, a navigation link, one main section with an h1 and paragraph, and a footer. Then check that every link has a meaningful destination.']
      ]
    },
    'ai-rubric': {
      title: 'Evaluating AI Responses with a Simple Rubric',
      description: 'A preview of a planned learning topic. The full lesson has not been published.',
      objectives: ['Consider relevance, accuracy, clarity, and instruction-following.', 'Check important claims against reliable sources.', 'Recognize that AI output can be incomplete or mistaken.'],
      sections: [['Planned lesson preview', 'This premium topic is not yet available. A future lesson may include a response-evaluation checklist and practice examples. No subscriber access or payment is enabled on this page.']]
    },
    'github-deploy': {
      title: 'From GitHub Repository to Published Website',
      description: 'A preview of a planned beginner deployment walkthrough. The full lesson and video are not published.',
      objectives: ['Understand the role of a repository.', 'Review the files needed by a static website.', 'Learn what to verify after deployment.'],
      sections: [['Planned lesson preview', 'This topic is planned for a future learning module. The public page does not include a paid lesson, downloadable asset, or video.']]
    },
    'safe-ai': {
      title: 'Choosing a Safe and Useful AI Tool',
      description: 'A preview of a planned beginner topic about selecting digital tools thoughtfully.',
      objectives: ['Identify what a tool is designed to do.', 'Review privacy and account requirements.', 'Check whether the tool is appropriate for the task.'],
      sections: [['Planned lesson preview', 'This topic is planned for a future learning module. Its full lesson has not been published and no premium access is active.']]
    }
  };

  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  function renderLesson(key, trigger, isPreview) {
    const lesson = lessons[key];
    if (!lesson || !dialog || !panel) return;
    lastTrigger = trigger || document.activeElement;
    $('#lesson-label').textContent = isPreview ? 'TUTORIAL PREVIEW' : (['ai-rubric', 'github-deploy', 'safe-ai'].includes(key) ? 'PLANNED TOPIC PREVIEW' : 'FREE WRITTEN LESSON');
    $('#lesson-title').textContent = lesson.title;
    $('#lesson-description').textContent = lesson.description;
    const objectiveList = $('#lesson-objectives');
    objectiveList.replaceChildren(...lesson.objectives.map(text => {
      const li = document.createElement('li'); li.textContent = text; return li;
    }));
    lessonContent.innerHTML = lesson.sections.map(([heading, body]) => `<section><h3>${escapeHTML(heading)}</h3><p>${escapeHTML(body)}</p></section>`).join('');
    window.clearTimeout(closeTimer);
    dialog.hidden = false;
    document.body.classList.add('dialog-open');
    document.body.dataset.hbPreviousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => { dialog.classList.add('is-open'); panel.focus({ preventScroll: true }); });
  }

  function closeLesson() {
    if (!dialog || dialog.hidden) return;
    dialog.classList.remove('is-open');
    document.body.classList.remove('dialog-open');
    document.body.style.overflow = document.body.dataset.hbPreviousOverflow || '';
    delete document.body.dataset.hbPreviousOverflow;
    closeTimer = window.setTimeout(() => {
      dialog.hidden = true;
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
    }, reducedMotion ? 0 : 230);
  }

  function applyFilters() {
    if (!grid) return;
    const query = (search?.value || '').trim().toLocaleLowerCase();
    const categoryValue = category?.value || 'all';
    const accessValue = access?.value || 'all';
    let visible = 0;
    cards.forEach(card => {
      const text = `${card.dataset.title || ''} ${card.textContent}`.toLocaleLowerCase();
      const matches = (!query || text.includes(query)) && (categoryValue === 'all' || card.dataset.category === categoryValue) && (accessValue === 'all' || card.dataset.access === accessValue);
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    const ordered = [...cards].sort((a, b) => {
      switch (sort?.value) {
        case 'title': return (a.dataset.title || '').localeCompare(b.dataset.title || '');
        case 'duration': return Number(a.dataset.duration || 0) - Number(b.dataset.duration || 0);
        case 'difficulty':
          const levels = { beginner: 1, intermediate: 2, advanced: 3 };
          return (levels[a.dataset.level] || 99) - (levels[b.dataset.level] || 99);
        default: return cards.indexOf(a) - cards.indexOf(b);
      }
    });
    ordered.forEach(card => grid.append(card));
    if (results) results.textContent = `${visible} ${visible === 1 ? 'tutorial' : 'tutorials'} found`;
    if (empty) empty.hidden = visible !== 0;
  }

  [search, category, access, sort].filter(Boolean).forEach(control => {
    control.addEventListener(control === search ? 'input' : 'change', applyFilters);
  });
  applyFilters();

  // Both buttons are delegated so cards remain functional if the list is later expanded.
  grid?.addEventListener('click', event => {
    const preview = event.target.closest('[data-preview]');
    const watch = event.target.closest('[data-watch]');
    if (preview) renderLesson(preview.dataset.preview, preview, true);
    else if (watch) renderLesson(watch.dataset.watch, watch, false);
  });

  // The existing hero link is a convenient one-tap filter for free material.
  $$('[data-free-filter]').forEach(link => link.addEventListener('click', () => {
    if (access) { access.value = 'free'; applyFilters(); }
  }));

  if (dialog) {
    $('.lesson-close', dialog)?.addEventListener('click', closeLesson);
    $('[data-lesson-close]', dialog)?.addEventListener('click', closeLesson);
    dialog.addEventListener('click', event => { if (event.target === dialog) closeLesson(); });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLesson();
    if (event.key === 'Tab' && dialog && !dialog.hidden && panel) {
      const focusable = $$('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])', panel).filter(el => el.offsetParent !== null);
      if (!focusable.length) { event.preventDefault(); panel.focus(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  // Match the mobile menu behavior on the homepage.
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
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      menuButton.setAttribute('aria-label', open ? 'Open navigation menu' : 'Close navigation menu');
      menu.classList.toggle('is-open', !open);
    });
    $$('a', menu).forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => { if (window.innerWidth > 1024) closeMenu(); });
  }

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
