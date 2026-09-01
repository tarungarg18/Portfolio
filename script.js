(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const storedTheme = localStorage.getItem('theme');

  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    themeToggle.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    if (persist) localStorage.setItem('theme', theme);
  }

  applyTheme(storedTheme || (colorScheme.matches ? 'dark' : 'light'), false);

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  });

  colorScheme.addEventListener('change', (event) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(event.matches ? 'dark' : 'light', false);
    }
  });

  // Mobile menu
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  function setNavigationOpen(open) {
    navLinks.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }

  burger.addEventListener('click', () => {
    setNavigationOpen(!navLinks.classList.contains('open'));
  });
  navLinks.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => setNavigationOpen(false))
  );

  // Scroll progress bar
  const progress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');

  function updateProgress() {
    const scrollTop = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = height > 0 ? `${(scrollTop / height) * 100}%` : '0%';
    backToTop.classList.toggle('visible', scrollTop > 560);
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  backToTop.addEventListener('click', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // Active nav link on scroll
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => {
            a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((s) => navObserver.observe(s));

  // Live coding-platform stats. Falls back silently to the static values
  // already in the HTML if an endpoint errors or a platform changes its page.
  function setStat(key, value) {
    if (value === null || value === undefined) return;
    const el = document.querySelector(`[data-stat="${key}"]`);
    if (el) {
      el.textContent = value;
      el.classList.remove('stat-loading');
    }
  }

  function setPlatformStatus(platform, message, state) {
    const card = document.querySelector(`[data-platform="${platform}"]`);
    const status = document.querySelector(`[data-platform-status="${platform}"]`);
    if (card) {
      card.setAttribute('data-state', state);
      card.querySelectorAll('.stat-loading').forEach((stat) => stat.classList.remove('stat-loading'));
    }
    if (status) status.textContent = message;
  }

  async function loadStats(url, platform, onSuccess) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error('Request failed');
      const data = await r.json();
      if (data.error) throw new Error('Data unavailable');
      onSuccess(data);
      setPlatformStatus(platform, 'Live data', 'loaded');
    } catch (e) {
      setPlatformStatus(platform, 'Live data temporarily unavailable', 'error');
    }
  }

  loadStats('/api/codeforces', 'cf', (d) => {
    setStat('cf-rank', d.rank);
    setStat('cf-rating', d.rating);
    setStat('cf-max', d.maxRating);
  });

  loadStats('/api/leetcode', 'lc', (d) => {
    setStat('lc-solved', d.solved);
    setStat('lc-rating', d.rating);
    setStat('lc-max', d.maxRating);
  });

  loadStats('/api/codechef', 'cc', (d) => {
    setStat('cc-stars', d.stars);
    setStat('cc-rating', d.rating);
    setStat('cc-max', d.maxRating);
  });

  loadStats('/api/atcoder', 'ac', (d) => {
    setStat('ac-rating', d.rating);
    setStat('ac-max', d.maxRating);
  });

  // Typewriter role rotation
  const roleEl = document.getElementById('roleTyped');
  if (roleEl) {
    const roles = [
      'Software Engineering',
      'Full-Stack Development',
      'Data Science & Machine Learning',
      'Competitive Programmer',
    ];
    let roleIndex = 0, charIndex = 0, deleting = false;

    function typeStep() {
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        roleEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(typeStep, 1200);
          return;
        }
      } else {
        charIndex--;
        roleEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(typeStep, deleting ? 28 : 52);
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      roleEl.textContent = 'Software Engineering · Data Science · Machine Learning';
    } else {
      typeStep();
    }
  }

  // Keep one technical-highlights panel open at a time.
  const projectHighlights = document.querySelectorAll('.project-highlights');
  projectHighlights.forEach((panel) => {
    panel.addEventListener('toggle', () => {
      if (!panel.open) return;
      projectHighlights.forEach((otherPanel) => {
        if (otherPanel !== panel) otherPanel.open = false;
      });
    });
  });

  document.addEventListener('click', (event) => {
    if (navLinks.classList.contains('open') && !event.target.closest('.nav-inner')) {
      setNavigationOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setNavigationOpen(false);
  });

  // Copy email button
  const copyBtn = document.getElementById('copyEmailBtn');
  if (copyBtn) {
    const label = copyBtn.querySelector('.copy-label');
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.getAttribute('data-email');
      try {
        await navigator.clipboard.writeText(email);
      } catch (e) {
        const temp = document.createElement('textarea');
        temp.value = email;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      copyBtn.classList.add('copied');
      const original = label.textContent;
      label.textContent = 'Email copied';
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        label.textContent = original;
      }, 1800);
    });
  }

})();
