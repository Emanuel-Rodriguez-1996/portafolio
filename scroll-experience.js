(() => {
  const sections = [
    { el: document.querySelector('#inicio'), label: 'INICIO' },
    { el: document.querySelector('#proyects'), label: 'PROYECTOS' },
    { el: document.querySelector('#skills'), label: 'HABILIDADES' },
    { el: document.querySelector('#sobreMi'), label: 'SOBRE MÍ' },
    { el: document.querySelector('#contacto'), label: 'CONTACTO' }
  ].filter(item => item.el);

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.innerHTML = '<span></span>';
  document.body.append(progress);

  const chapterNav = document.createElement('nav');
  chapterNav.className = 'scroll-chapter';
  chapterNav.setAttribute('aria-label', 'Progreso del portafolio');
  sections.forEach(({ el, label }) => {
    const dot = document.createElement('a');
    dot.href = `#${el.id}`;
    dot.setAttribute('aria-label', label);
    dot.dataset.label = label;
    chapterNav.append(dot);
  });
  document.body.append(chapterNav);
  const dots = [...chapterNav.querySelectorAll('a')];
  const linkMap = new Map(sections.map(({ el }, i) => [el, dots[i]]));

  const revealTargets = [...document.querySelectorAll('.article1, .proyectos-section > h2, .skill-section > .container > h2, #sobreMi .descripcion h2, #sobreMi .descripcion-texto, #sobreMi .social, .contact-copy, .contact-aside, body > footer')];
  revealTargets.forEach((el, i) => {
    el.classList.add('scroll-reveal');
    el.style.setProperty('--reveal-delay', `${Math.min(i % 5, 4) * 75}ms`);
  });
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px -8% 0px' });
  revealTargets.forEach(el => revealObserver.observe(el));

  // Projects enter from alternating screen edges; skill groups fall in and bounce as the scroll advances.
  const projectItems = [...document.querySelectorAll('.proyecto-item')];
  const skillItems = [...document.querySelectorAll('.skill-category')];
  const projectDirections = ['right', 'left'];
  projectItems.forEach((el, i) => {
    el.classList.add('scroll-reveal', 'scroll-scrubbed', 'project-arrival');
    el.dataset.revealDirection = projectDirections[i % projectDirections.length];
  });
  skillItems.forEach(el => el.classList.add('scroll-reveal', 'scroll-scrubbed', 'skill-drop'));
  const progressiveItems = [...projectItems, ...skillItems];
  progressiveItems.forEach((el, i) => {
    el.dataset.scrollOrder = String(i);
    el.style.setProperty('--reveal-opacity', '0');
    el.style.setProperty('--reveal-x', '0px');
    el.style.setProperty('--reveal-y', '0px');
    el.style.setProperty('--reveal-tilt', '7deg');
    el.style.setProperty('--reveal-rotate', '0deg');
    el.style.setProperty('--reveal-scale', '.95');
    el.style.setProperty('--reveal-blur', '5px');
  });

  function animateSkillIcons(category) {
    const images = [...category.querySelectorAll('.tecnologias img, .herramientas img')];
    images.forEach((img, i) => {
      const animate = () => {
        if (typeof img.animate !== 'function') return;
        img.getAnimations().forEach(animation => animation.cancel());
        const rect = img.getBoundingClientRect();
        const fall = rect.bottom + 60;
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const spin = reduced ? 0 : (i % 2 ? -18 : 18);
        img.animate([
          { offset: 0, transform: `translate3d(0,${-fall}px,0) rotate(${spin}deg) scale(.62)`, opacity: 0, filter: 'blur(6px)' },
          { offset: .68, transform: `translate3d(0,46px,0) rotate(${-spin * .3}deg) scale(1.22)`, opacity: 1, filter: 'blur(0)' },
          { offset: .80, transform: `translate3d(0,-30px,0) rotate(${spin * .16}deg) scale(.90)`, opacity: 1 },
          { offset: .90, transform: 'translate3d(0,16px,0) scale(1.08)', opacity: 1 },
          { offset: .96, transform: 'translate3d(0,-6px,0) scale(.97)', opacity: 1 },
          { offset: 1, transform: 'translate3d(0,0,0) rotate(0deg) scale(1)', opacity: 1, filter: 'blur(0)' }
        ], { duration: reduced ? 1400 : 3800, delay: i * (reduced ? 80 : 145), easing: 'cubic-bezier(.16,.72,.23,1)', fill: 'backwards' });
      };
      if (!img.complete) img.addEventListener('load', animate, { once: true });
      else animate();
    });
  }
  const about = document.querySelector('#sobreMi');
  const cursorSections = [...document.querySelectorAll('#proyects, #skills, #sobreMi, #contacto')];
  cursorSections.forEach(section => {
    section.classList.add('cursor-lit');
    section.addEventListener('pointermove', e => {
      const r = section.getBoundingClientRect();
      const x = `${((e.clientX - r.left) / r.width) * 100}%`;
      const y = `${((e.clientY - r.top) / r.height) * 100}%`;
      section.style.setProperty('--cursor-x', x);
      section.style.setProperty('--cursor-y', y);
      if (section.id === 'sobreMi') {
        section.style.setProperty('--about-x', x);
        section.style.setProperty('--about-y', y);
      }
    });
    section.addEventListener('pointerleave', () => {
      section.style.setProperty('--cursor-x', '50%');
      section.style.setProperty('--cursor-y', '45%');
      if (section.id === 'sobreMi') {
        section.style.setProperty('--about-x', '72%');
        section.style.setProperty('--about-y', '42%');
      }
    });
  });

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      dots.forEach(dot => dot.setAttribute('aria-current', 'false'));
      linkMap.get(entry.target)?.setAttribute('aria-current', 'true');
      document.querySelectorAll('.main-nav a').forEach(link => {
        const href = link.getAttribute('href');
        const active = href === `#${entry.target.id}` || (entry.target.id === 'skills' && href === '#proyects');
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      document.body.dataset.chapter = entry.target.id;
    });
  }, { threshold: .005 });
  sections.forEach(({ el }) => sectionObserver.observe(el));

  const bar = progress.firstElementChild;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking = false;
  let previousScrollY = scrollY;
  let scrollDirection = 0;
  // Use untransformed layout coordinates so each card's own transform cannot move its trigger.
  function layoutRect(el) {
    let top = 0, left = 0, node = el;
    while (node) { top += node.offsetTop; left += node.offsetLeft; node = node.offsetParent; }
    const width = el.offsetWidth, height = el.offsetHeight;
    left -= scrollX; top -= scrollY;
    return { left, top, right: left + width, bottom: top + height, width, height };
  }
  function renderScroll() {
    const nowScrollY = scrollY;
    scrollDirection = nowScrollY > previousScrollY ? 1 : nowScrollY < previousScrollY ? -1 : 0;
    previousScrollY = nowScrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;

    progressiveItems.forEach((el, i) => {
      const r = layoutRect(el);
      const order = Number(el.dataset.scrollOrder || i);
      const rowDelay = el.classList.contains('project-arrival') ? (order % 2) * .045 : (order % 2) * .12;
      const isProject = el.classList.contains('project-arrival');
      const entryStart = innerHeight * (isProject ? 1.05 : .91);
      const settleTop = isProject
        ? Math.max(18, Math.min(innerHeight * .26, innerHeight - r.height - 44))
        : Math.max(12, Math.min(innerHeight * .42, innerHeight - r.height - 36));
      const entryRange = Math.max(innerHeight * (isProject ? .82 : 0), entryStart - settleTop);
      const raw = Math.max(0, Math.min(1, (entryStart - r.top) / entryRange - rowDelay));
      const t = isProject ? (raw < .5 ? 16 * raw ** 5 : 1 - Math.pow(-2 * raw + 2, 5) / 2) : raw * raw * (3 - 2 * raw);
      el.style.setProperty('--reveal-opacity', String(t));
      if (el.classList.contains('skill-drop')) {
        el.dataset.entryProgress = String(t);
        if (t < .68 && scrollDirection < 0) delete el.dataset.iconsPlayed;
        if (t >= .68 && !el.dataset.iconsPlayed && scrollDirection >= 0) {
          el.dataset.iconsPlayed = 'true';
          animateSkillIcons(el);
        }
      }
      if (el.classList.contains('skill-drop') && t >= .68 && !el.dataset.iconsStarted) {
        el.dataset.iconsStarted = 'true';
        animateSkillIcons(el);
      }
      el.style.setProperty('--reveal-scale', String(.95 + .05 * t));
      el.style.setProperty('--reveal-blur', `${(reducedMotion ? 0 : 5) * (1 - t)}px`);

      if (el.classList.contains('skill-drop')) {
        // The category itself glides into place; its icons animate after this reaches 100%.
        el.style.setProperty('--reveal-x', '0px');
        el.style.setProperty('--reveal-y', `${(reducedMotion ? 20 : 42) * (1 - t)}px`);
        el.style.setProperty('--reveal-tilt', `${(reducedMotion ? 0 : 2.5 * (1 - t))}deg`);
        el.style.setProperty('--reveal-rotate', '0deg');
      } else {
        const gap = 42;
        const directions = {
          top: [0, -r.bottom - gap],
          right: [innerWidth - r.left + gap, 0],
          bottom: [0, innerHeight - r.top + gap],
          left: [-r.right - gap, 0],
          'top-left': [-r.right - gap, -r.bottom - gap],
          'bottom-right': [innerWidth - r.left + gap, innerHeight - r.top + gap]
        };
        const [x, y] = directions[el.dataset.revealDirection] || directions.bottom;
        el.style.setProperty('--reveal-x', `${x * (1 - t)}px`);
        el.style.setProperty('--reveal-y', `${y * (1 - t)}px`);
        const scale = .95 + .05 * t;
        const visualLeft = r.left + x * (1 - t), visualTop = r.top + y * (1 - t);
        const cardWidth = r.width * scale, cardHeight = r.height * scale;
        const insideX = Math.max(0, Math.min(visualLeft + cardWidth, innerWidth) - Math.max(visualLeft, 0)) / Math.max(cardWidth, 1);
        const insideY = Math.max(0, Math.min(visualTop + cardHeight, innerHeight) - Math.max(visualTop, 0)) / Math.max(cardHeight, 1);
        const inside = Math.max(0, Math.min(1, (Math.min(insideX, insideY) - .66) / .34));
        const gate = inside * inside * (3 - 2 * inside);
        el.style.setProperty('--reveal-opacity', String(t * gate));
        el.style.setProperty('--reveal-tilt', `${(reducedMotion ? 0 : 7 * (1 - t))}deg`);
        el.style.setProperty('--reveal-rotate', `${(reducedMotion ? 0 : ((order % 2 ? 1 : -1) * 4 * (1 - t)))}deg`);
      }
    });

    if (about) {
      const r = about.getBoundingClientRect();
      const phase = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height)));
      about.style.setProperty('--about-turn', `${phase * 260}deg`);
      about.style.setProperty('--about-progress', String(phase));
      about.style.setProperty('--about-alpha', String(.34 + phase * .55));
    }
    ticking = false;
  }
  addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(renderScroll);
    ticking = true;
  }, { passive: true });
  addEventListener('resize', renderScroll, { passive: true });
  renderScroll();

  // The cards also lean toward the cursor on desktop; this combines with their scroll tilt.
  if (matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.proyecto-item').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - .5) * -3;
        const ry = ((e.clientX - r.left) / r.width - .5) * 4;
        card.style.setProperty('--pointer-rx', `${rx}deg`);
        card.style.setProperty('--pointer-ry', `${ry}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--pointer-rx', '0deg');
        card.style.setProperty('--pointer-ry', '0deg');
      });
    });
  }
})();


























