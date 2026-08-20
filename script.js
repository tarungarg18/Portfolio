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

  // Total "Problems Solved" hero stat is the live sum of solved counts
  // across all four platforms, once every platform has reported in.
  const solvedByPlatform = { cf: null, lc: null, cc: null, ac: null };
  function maybeUpdateSolvedTotal() {
    const values = Object.values(solvedByPlatform);
    if (values.some((v) => v === null)) return;
    const total = values.reduce((sum, v) => sum + v, 0);
    const heroTotalEl = document.querySelector('.hero-stat [data-count][data-suffix]');
    if (!heroTotalEl) return;
    const from = parseInt(heroTotalEl.textContent, 10) || 0;
    const duration = 900;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      heroTotalEl.textContent = Math.round(from + (total - from) * eased) + '+';
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  loadStats('/api/codeforces', (d) => {
    setStat('cf-rank', d.rank);
    setStat('cf-rating', d.rating);
    setStat('cf-max', d.maxRating);
    if (typeof d.solved === 'number') solvedByPlatform.cf = d.solved;
    maybeUpdateSolvedTotal();
  });

  loadStats('/api/leetcode', (d) => {
    setStat('lc-solved', d.solved);
    setStat('lc-rating', d.rating);
    setStat('lc-max', d.maxRating);
    if (typeof d.solved === 'number') solvedByPlatform.lc = d.solved;
    maybeUpdateSolvedTotal();
  });

  loadStats('/api/codechef', (d) => {
    setStat('cc-stars', d.stars);
    setStat('cc-rating', d.rating);
    setStat('cc-max', d.maxRating);
    if (typeof d.solved === 'number') solvedByPlatform.cc = d.solved;
    maybeUpdateSolvedTotal();
  });

  loadStats('/api/atcoder', (d) => {
    setStat('ac-rating', d.rating);
    setStat('ac-max', d.maxRating);
    if (typeof d.solved === 'number') solvedByPlatform.ac = d.solved;
    maybeUpdateSolvedTotal();
  });

  // Typewriter role rotation
  const roleEl = document.getElementById('roleTyped');
  if (roleEl) {
    const roles = ['Competitive Programmer', 'Building Scalable Systems', '1100+ Problems Solved', 'IIT Guwahati'];
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

  // Animated stat counters (run once when hero scrolls into view)
  const countEls = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (countEls.length) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    countEls.forEach((el) => countObserver.observe(el));
  }

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
      label.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        label.textContent = original;
      }, 1800);
    });
  }

})();
