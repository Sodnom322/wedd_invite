/* =============================================
   script.js — Wedding Invitation
   ============================================= */

(function () {
  'use strict';

  /* ------------------------------------------
     PETAL CANVAS
  ------------------------------------------ */
  const canvas  = document.getElementById('petalsCanvas');
  const ctx     = canvas.getContext('2d');
  let W, H, petals = [];
  const PETAL_COUNT = window.innerWidth < 600 ? 28 : 50;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  /* Petal shapes — we draw a stylised teardrop/ellipse */
  function makePetal() {
    return {
      x:       Math.random() * W,
      y:       Math.random() * -H,
      w:       6 + Math.random() * 10,
      h:       9 + Math.random() * 14,
      angle:   Math.random() * Math.PI * 2,
      spin:    (Math.random() - 0.5) * 0.03,
      vx:      (Math.random() - 0.5) * 0.6,
      vy:      0.5 + Math.random() * 1.1,
      opacity: 0.3 + Math.random() * 0.55,
      hue:     Math.random() > 0.5
               ? `rgba(248, 220, 210, `   // blush
               : `rgba(212, 165, 165, `   // rose
    };
  }

  for (let i = 0; i < PETAL_COUNT; i++) {
    const p = makePetal();
    p.y = Math.random() * H; // start spread across screen
    petals.push(p);
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = p.opacity;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.hue + p.opacity + ')';
    ctx.fill();
    // subtle vein
    ctx.beginPath();
    ctx.moveTo(0, -p.h / 2);
    ctx.quadraticCurveTo(p.w * 0.2, 0, 0, p.h / 2);
    ctx.strokeStyle = 'rgba(201,169,110,0.2)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();
  }

  let animFrame;
  function animatePetals() {
    ctx.clearRect(0, 0, W, H);
    petals.forEach((p) => {
      p.x     += p.vx + Math.sin(p.y * 0.012) * 0.3;
      p.y     += p.vy;
      p.angle += p.spin;
      if (p.y > H + 20) {
        Object.assign(p, makePetal());
        p.y = -20;
      }
      drawPetal(p);
    });
    animFrame = requestAnimationFrame(animatePetals);
  }

  animatePetals();

  // Pause petals when hero is off-screen (perf)
  const heroEl = document.getElementById('hero');
  const perfObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        if (!animFrame) animatePetals();
      } else {
        cancelAnimationFrame(animFrame);
        animFrame = null;
      }
    });
  }, { threshold: 0 });
  perfObs.observe(heroEl);


  /* ------------------------------------------
     COUNTDOWN TIMER
  ------------------------------------------ */
  const WEDDING = new Date('2025-06-14T15:00:00');

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateCountdown() {
    const now  = new Date();
    const diff = WEDDING - now;

    if (diff <= 0) {
      document.getElementById('countdown').style.display = 'none';
      document.getElementById('countdown-past').style.display = 'block';
      return;
    }

    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs  = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cd-days').textContent  = pad(days);
    document.getElementById('cd-hours').textContent = pad(hours);
    document.getElementById('cd-mins').textContent  = pad(mins);
    document.getElementById('cd-secs').textContent  = pad(secs);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);


  /* ------------------------------------------
     NAV — show/hide + active state
  ------------------------------------------ */
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });


  /* ------------------------------------------
     SCROLL-TRIGGERED FADE-IN
  ------------------------------------------ */
  const fadeEls = document.querySelectorAll('.fade-in');

  const fadeObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        fadeObs.unobserve(e.target); // fire once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeEls.forEach((el) => fadeObs.observe(el));


  /* ------------------------------------------
     PARALLAX ON HERO BG
  ------------------------------------------ */
  function heroParallax() {
    const scrolled = window.scrollY;
    const factor   = 0.35;
    heroEl.style.backgroundPositionY = `calc(50% + ${scrolled * factor}px)`;
  }

  window.addEventListener('scroll', heroParallax, { passive: true });


  /* ------------------------------------------
     SMOOTH SCROLL for nav links
  ------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = nav.offsetHeight + 8;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();
