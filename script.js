(function () {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const stored = localStorage.getItem('theme');
  if (stored) root.setAttribute('data-theme', stored);

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // Mobile menu
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );

  // Scroll progress bar
  const progress = document.getElementById('scrollProgress');
  function updateProgress() {
    const scrollTop = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = height > 0 ? `${(scrollTop / height) * 100}%` : '0%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

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
    if (el) el.textContent = value;
  }

  async function loadStats(url, onSuccess) {
    try {
      const r = await fetch(url);
      const data = await r.json();
      if (data.error) return;
      onSuccess(data);
    } catch (e) {
      // network/parse failure — leave static fallback values in place
    }
  }

  loadStats('/api/codeforces', (d) => {
    setStat('cf-rank', d.rank);
    setStat('cf-rating', d.rating);
    setStat('cf-max', d.maxRating);
  });

  loadStats('/api/leetcode', (d) => {
    setStat('lc-solved', d.solved);
    setStat('lc-rating', d.rating);
    setStat('lc-max', d.maxRating);
  });

  loadStats('/api/codechef', (d) => {
    setStat('cc-stars', d.stars);
    setStat('cc-rating', d.rating);
    setStat('cc-max', d.maxRating);
  });

  loadStats('/api/atcoder', (d) => {
    setStat('ac-rating', d.rating);
    setStat('ac-max', d.maxRating);
  });

  // Typewriter role rotation
  const roleEl = document.getElementById('roleTyped');
  if (roleEl) {
    const roles = [
      'Full-Stack Engineer',
      'Software Developer',
      'Competitive Programmer',
      'ML / Data Science',
      'IIT Guwahati',
    ];
    let roleIndex = 0, charIndex = 0, deleting = false;

    function typeStep() {
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        roleEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(typeStep, 1400);
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
      setTimeout(typeStep, deleting ? 35 : 65);
    }
    typeStep();
  }

  // Resume dropdowns
  const resumeMenus = document.querySelectorAll('.resume-menu');

  function closeAllResumeMenus(except) {
    resumeMenus.forEach((menu) => {
      if (menu === except) return;
      const btn = menu.querySelector('.resume-toggle');
      const panel = menu.querySelector('.resume-dropdown');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (panel) {
        panel.hidden = true;
        menu.classList.remove('open');
      }
    });
  }

  resumeMenus.forEach((menu) => {
    const btn = menu.querySelector('.resume-toggle');
    const panel = menu.querySelector('.resume-dropdown');
    if (!btn || !panel) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = panel.hidden;
      closeAllResumeMenus();
      if (willOpen) {
        panel.hidden = false;
        menu.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    panel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeAllResumeMenus());
    });
  });

  document.addEventListener('click', () => closeAllResumeMenus());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllResumeMenus();
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
      label.textContent = 'Email copied ✓';
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        label.textContent = original;
      }, 1800);
    });
  }

})();
