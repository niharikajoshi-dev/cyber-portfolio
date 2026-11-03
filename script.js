/**
 * ==========================================================================
 * NIHARIKA JOSHI | DEFENSIVE CYBERSECURITY PORTFOLIO
 * Core UI/UX Engine, 3D Canvas Crystals, and Interactive Animations
 * ==========================================================================
 */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
   * 1. 3D MOVING CRYSTALS & CYBER LATTICE CANVAS ENGINE
   * ------------------------------------------------------------------------ */
  class CrystalsCanvas {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.crystals = [];
      this.particles = [];
      this.mouse = { x: null, y: null, targetX: 0, targetY: 0 };
      this.fov = 380;
      this.animId = null;
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (this.isReducedMotion) return;

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });

      window.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left - this.width / 2;
        this.mouse.y = e.clientY - rect.top - this.height / 2;
      }, { passive: true });

      window.addEventListener('mouseleave', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      }, { passive: true });

      this.createGeometry();
      this.render();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * window.devicePixelRatio;
      this.canvas.height = this.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    createGeometry() {
      this.crystals = [];
      this.particles = [];

      // Create floating 3D crystals (wireframe octahedrons)
      const crystalCount = window.innerWidth < 768 ? 6 : 14;
      for (let i = 0; i < crystalCount; i++) {
        this.crystals.push({
          x: (Math.random() - 0.5) * this.width * 1.2,
          y: (Math.random() - 0.5) * this.height * 1.2,
          z: Math.random() * 400 - 150,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          vz: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 24 + 18,
          rotX: Math.random() * Math.PI,
          rotY: Math.random() * Math.PI,
          rotSpeedX: (Math.random() - 0.5) * 0.015,
          rotSpeedY: (Math.random() - 0.5) * 0.015,
          color: Math.random() > 0.45 ? 'cyan' : 'violet'
        });
      }

      // Create background cyber particle lattice
      const particleCount = window.innerWidth < 768 ? 25 : 55;
      for (let i = 0; i < particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    }

    project(x, y, z) {
      const scale = this.fov / (this.fov + z);
      return {
        x: x * scale + this.width / 2,
        y: y * scale + this.height / 2,
        scale: scale
      };
    }

    renderOctahedron(crystal) {
      const s = crystal.size;
      // 6 vertices of an octahedron in local space
      const baseVertices = [
        { x: 0, y: -s, z: 0 },
        { x: s, y: 0, z: 0 },
        { x: 0, y: 0, z: s },
        { x: -s, y: 0, z: 0 },
        { x: 0, y: 0, z: -s },
        { x: 0, y: s, z: 0 }
      ];

      // Rotate vertices
      const cosX = Math.cos(crystal.rotX);
      const sinX = Math.sin(crystal.rotX);
      const cosY = Math.cos(crystal.rotY);
      const sinY = Math.sin(crystal.rotY);

      const rotated = baseVertices.map(v => {
        // Rot Y
        let x1 = v.x * cosY + v.z * sinY;
        let z1 = -v.x * sinY + v.z * cosY;
        let y1 = v.y;

        // Rot X
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;
        let x2 = x1;

        // World translate
        return this.project(x2 + crystal.x, y2 + crystal.y, z2 + crystal.z);
      });

      // Edge connectivity
      const edges = [
        [0, 1], [0, 2], [0, 3], [0, 4], // Top pyramid
        [5, 1], [5, 2], [5, 3], [5, 4], // Bottom pyramid
        [1, 2], [2, 3], [3, 4], [4, 1]  // Equatorial ring
      ];

      const strokeColor = crystal.color === 'cyan' 
        ? 'rgba(0, 240, 255, 0.35)' 
        : 'rgba(167, 139, 250, 0.35)';

      this.ctx.beginPath();
      for (const [start, end] of edges) {
        const p1 = rotated[start];
        const p2 = rotated[end];
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
      }
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = 1.2;
      this.ctx.stroke();

      // Draw vertices as small nodes
      for (const p of rotated) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 2 * p.scale, 0, Math.PI * 2);
        this.ctx.fillStyle = crystal.color === 'cyan' 
          ? 'rgba(0, 240, 255, 0.7)' 
          : 'rgba(167, 139, 250, 0.7)';
        this.ctx.fill();
      }
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Smooth mouse damping
      if (this.mouse.x !== null) {
        this.mouse.targetX += (this.mouse.x - this.mouse.targetX) * 0.05;
        this.mouse.targetY += (this.mouse.y - this.mouse.targetY) * 0.05;
      } else {
        this.mouse.targetX += (0 - this.mouse.targetX) * 0.02;
        this.mouse.targetY += (0 - this.mouse.targetY) * 0.02;
      }

      // Draw Background Particles & Lines
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha * 0.6})`;
        this.ctx.fill();

        // Connect nearby particles with subtle cyber grid lines
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 * (1 - dist / 110)})`;
            this.ctx.lineWidth = 0.8;
            this.ctx.stroke();
          }
        }
      }

      // Update & Render Crystals
      for (const crystal of this.crystals) {
        crystal.rotX += crystal.rotSpeedX;
        crystal.rotY += crystal.rotSpeedY;

        crystal.x += crystal.vx;
        crystal.y += crystal.vy;
        crystal.z += crystal.vz;

        // Subtle parallax attraction towards mouse
        crystal.x += this.mouse.targetX * 0.0003;
        crystal.y += this.mouse.targetY * 0.0003;

        // Boundary wrap
        const boundX = this.width * 0.7;
        const boundY = this.height * 0.7;
        if (crystal.x < -boundX) crystal.x = boundX;
        if (crystal.x > boundX) crystal.x = -boundX;
        if (crystal.y < -boundY) crystal.y = boundY;
        if (crystal.y > boundY) crystal.y = -boundY;
        if (crystal.z < -200) crystal.z = 250;
        if (crystal.z > 250) crystal.z = -200;

        this.renderOctahedron(crystal);
      }

      this.animId = requestAnimationFrame(() => this.render());
    }
  }

  /* ------------------------------------------------------------------------
   * 2. SCROLL PROGRESS INDICATOR
   * ------------------------------------------------------------------------ */
  function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress-bar');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
   * 3. HEADER STICKY & ACTIVE NAVIGATION LINK TRACKING
   * ------------------------------------------------------------------------ */
  function initHeaderAndNav() {
    const header = document.getElementById('site-header');
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav-link');
    const backToTop = document.getElementById('back-to-top');

    function onScroll() {
      const scrollY = window.scrollY;

      // Header background blur on scroll
      if (header) {
        if (scrollY > 30) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      // Back to top visibility
      if (backToTop) {
        if (scrollY > 400) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      }

      // Active Section Spy
      let currentSectionId = '';
      sections.forEach(section => {
        const top = section.offsetTop - 120;
        const height = section.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
          currentSectionId = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Smooth Back To Top Click
    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ------------------------------------------------------------------------
   * 4. MOBILE DRAWER NAVIGATION
   * ------------------------------------------------------------------------ */
  function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-nav');
    const links = drawer ? drawer.querySelectorAll('.mobile-nav-link') : [];

    if (!toggleBtn || !drawer) return;

    function toggleMenu(isOpen) {
      const willOpen = typeof isOpen === 'boolean' ? isOpen : !drawer.classList.contains('open');
      if (willOpen) {
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        toggleBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      } else {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        toggleBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    }

    toggleBtn.addEventListener('click', () => toggleMenu());

    links.forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        toggleMenu(false);
      }
    });

    document.addEventListener('click', (e) => {
      if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
        toggleMenu(false);
      }
    });
  }

  /* ------------------------------------------------------------------------
   * 5. SCROLL REVEAL (INTERSECTION OBSERVER)
   * ------------------------------------------------------------------------ */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (!revealElements.length) return;

    // Immediately reveal elements near top on initial render
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('is-revealed');
      }
    });

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => {
      if (!el.classList.contains('is-revealed')) {
        observer.observe(el);
      }
    });
  }

  /* ------------------------------------------------------------------------
   * 6. PROJECT CATEGORY FILTERS
   * ------------------------------------------------------------------------ */
  function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (!filterBtns.length || !projectCards.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetCategory = btn.getAttribute('data-filter');

        // Update button states
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Filter cards
        projectCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          const isMatch = targetCategory === 'all' || cardCategory === targetCategory;

          if (isMatch) {
            card.style.display = 'flex';
            requestAnimationFrame(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0) scale(1)';
            });
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(16px) scale(0.96)';
            setTimeout(() => {
              if (card.style.opacity === '0') {
                card.style.display = 'none';
              }
            }, 250);
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
   * 7. 3D CARD SPOTLIGHT & TILT MICRO-INTERACTIONS
   * ------------------------------------------------------------------------ */
  function initCardSpotlights() {
    const cards = document.querySelectorAll(
      '.project-card, .skill-card, .focus-card, .lab-card, .security-visual-card'
    );

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  /* ------------------------------------------------------------------------
   * 8. TOAST NOTIFICATION UTILITY
   * ------------------------------------------------------------------------ */
  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;

    if (toastTimer) clearTimeout(toastTimer);

    toastText.textContent = message;
    toast.classList.remove('active');
    
    // Trigger reflow to restart animation
    void toast.offsetWidth;

    toast.classList.add('active');

    toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, 3200);
  }

  /* ------------------------------------------------------------------------
   * 9. COPY EMAIL TO CLIPBOARD
   * ------------------------------------------------------------------------ */
  function initCopyEmail() {
    const copyBtn = document.getElementById('btn-copy-email');
    const emailElem = document.getElementById('email-address-text');

    if (!copyBtn) return;

    copyBtn.addEventListener('click', async () => {
      const email = emailElem ? emailElem.textContent.trim() : 'niharika.joshi@example.com';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(email);
        } else {
          // Fallback
          const temp = document.createElement('textarea');
          temp.value = email;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
        }

        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        showToast('Email address copied to clipboard!');

        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.classList.remove('copied');
        }, 2200);
      } catch (err) {
        showToast('Could not copy email automatically.');
      }
    });
  }

  /* ------------------------------------------------------------------------
   * 10. RESUME PLACEHOLDER MODAL
   * ------------------------------------------------------------------------ */
  function initResumeModal() {
    const resumeBtn = document.getElementById('btn-hero-resume');
    const modal = document.getElementById('resume-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const dismissBtn = document.getElementById('modal-dismiss-btn');

    if (!modal) return;

    function openModal() {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (resumeBtn) resumeBtn.focus();
    }

    if (resumeBtn) {
      resumeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (dismissBtn) dismissBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  /* ------------------------------------------------------------------------
   * 11. CONTACT FORM REAL-TIME VALIDATION & SIMULATED DISPATCH
   * ------------------------------------------------------------------------ */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const submitBtn = document.getElementById('btn-submit-message');

    function validateField(input, condition) {
      const group = input.closest('.form-group');
      if (!group) return true;
      if (!condition) {
        group.classList.add('has-error');
        return false;
      } else {
        group.classList.remove('has-error');
        return true;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    nameInput?.addEventListener('input', () => {
      validateField(nameInput, nameInput.value.trim().length > 1);
    });

    emailInput?.addEventListener('input', () => {
      validateField(emailInput, emailRegex.test(emailInput.value.trim()));
    });

    messageInput?.addEventListener('input', () => {
      validateField(messageInput, messageInput.value.trim().length > 5);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateField(nameInput, nameInput.value.trim().length > 1);
      const isEmailValid = validateField(emailInput, emailRegex.test(emailInput.value.trim()));
      const isMsgValid = validateField(messageInput, messageInput.value.trim().length > 5);

      if (!isNameValid || !isEmailValid || !isMsgValid) {
        showToast('Please correct errors before submitting.');
        return;
      }

      // Simulate sending state
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Transmitting telemetry...</span>`;

      setTimeout(() => {
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        showToast('Message dispatched! Thank you for reaching out.');
      }, 1000);
    });
  }

  /* ------------------------------------------------------------------------
   * 12. DYNAMIC YEAR UPDATE
   * ------------------------------------------------------------------------ */
  function initCurrentYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }

  /* ------------------------------------------------------------------------
   * INITIALIZATION ENTRY POINT
   * ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    new CrystalsCanvas('crystals-canvas');
    initScrollProgress();
    initHeaderAndNav();
    initMobileMenu();
    initScrollReveal();
    initProjectFilters();
    initCardSpotlights();
    initCopyEmail();
    initResumeModal();
    initContactForm();
    initCurrentYear();
  });
})();

