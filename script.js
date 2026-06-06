/**
 * LUMIÈRE BEAUTY — script.js
 * Funcionalidades:
 *   - Header scrolled state
 *   - Menu mobile toggle
 *   - Hero parallax / Ken Burns
 *   - Reveal on scroll (IntersectionObserver)
 *   - Carrossel de depoimentos
 *   - Ano dinâmico no rodapé
 *   - Scroll suave para âncoras
 */

'use strict';

/* ─── DOM REFERENCES ──────────────────────────────────────── */
const header       = document.getElementById('header');
const menuBtn      = document.getElementById('menuBtn');
const mobileMenu   = document.getElementById('mobileMenu');
const mobileLinks  = document.querySelectorAll('.mobile-link');
const heroSection  = document.querySelector('.hero');
const revealEls    = document.querySelectorAll('.reveal');
const footerYear   = document.getElementById('footerYear');

// Carrossel
const track        = document.getElementById('depoimentosTrack');
const prevBtn      = document.getElementById('prevBtn');
const nextBtn      = document.getElementById('nextBtn');
const dotsWrap     = document.getElementById('depoimentosDots');

/* ─── ANO DINÂMICO NO RODAPÉ ──────────────────────────────── */
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

/* ─── HEADER: ESTADO AO ROLAR ─────────────────────────────── */
function handleHeaderScroll() {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll(); // verificar estado inicial

/* ─── MENU MOBILE ─────────────────────────────────────────── */
function toggleMenu(open) {
  const isOpen = typeof open === 'boolean' ? open : !mobileMenu.classList.contains('open');
  mobileMenu.classList.toggle('open', isOpen);
  menuBtn.classList.toggle('open', isOpen);
  menuBtn.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

menuBtn.addEventListener('click', () => toggleMenu());

// Fechar ao clicar em links do menu mobile
mobileLinks.forEach(link => {
  link.addEventListener('click', () => toggleMenu(false));
});

// Fechar ao clicar fora
document.addEventListener('click', (e) => {
  if (
    mobileMenu.classList.contains('open') &&
    !mobileMenu.contains(e.target) &&
    !menuBtn.contains(e.target)
  ) {
    toggleMenu(false);
  }
});

// Fechar com tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
    toggleMenu(false);
    menuBtn.focus();
  }
});

/* ─── HERO: KEN BURNS / ZOOM SUAVE ───────────────────────── */
if (heroSection) {
  // Trigger da animação de zoom após carregamento
  window.addEventListener('load', () => {
    heroSection.classList.add('loaded');
  });
}

/* ─── REVEAL ON SCROLL ────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Parar de observar após revelar (performance)
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  }
);

revealEls.forEach(el => revealObserver.observe(el));

/* ─── SCROLL SUAVE PARA ÂNCORAS ───────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const headerHeight = header.offsetHeight;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth'
    });
  });
});

/* ─── CARROSSEL DE DEPOIMENTOS ────────────────────────────── */
(function initCarousel() {
  if (!track || !dotsWrap) return;

  const cards        = Array.from(track.querySelectorAll('.depoimento-card'));
  let currentIndex   = 0;
  let autoPlayTimer  = null;
  let isAnimating    = false;
  let touchStartX    = 0;
  let touchEndX      = 0;

  // Determina quantos cards ficam visíveis baseado na largura
  function getVisibleCount() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  // Cria dots de navegação
  function buildDots() {
    dotsWrap.innerHTML = '';
    const total = cards.length - getVisibleCount() + 1;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.classList.add('depoimentos__dot');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Depoimento ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = dotsWrap.querySelectorAll('.depoimentos__dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
      dot.setAttribute('aria-selected', String(i === currentIndex));
    });
  }

  function getCardWidth() {
    if (!cards.length) return 0;
    const card = cards[0];
    const style = window.getComputedStyle(card);
    return card.offsetWidth + parseFloat(style.marginRight || 0) + 24; // 24 = gap
  }

  function goTo(index) {
    if (isAnimating) return;
    isAnimating = true;

    const maxIndex = cards.length - getVisibleCount();
    currentIndex = Math.max(0, Math.min(index, maxIndex));

    const offset = currentIndex * getCardWidth();
    track.style.transform = `translateX(-${offset}px)`;

    updateDots();

    // Atualizar estado dos botões
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
    prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
    nextBtn.style.opacity = currentIndex >= maxIndex ? '0.4' : '1';

    // Resetar flag após transição
    setTimeout(() => { isAnimating = false; }, 650);

    resetAutoPlay();
  }

  function goNext() {
    const maxIndex = cards.length - getVisibleCount();
    goTo(currentIndex < maxIndex ? currentIndex + 1 : 0);
  }

  function goPrev() {
    const maxIndex = cards.length - getVisibleCount();
    goTo(currentIndex > 0 ? currentIndex - 1 : maxIndex);
  }

  function startAutoPlay() {
    autoPlayTimer = setInterval(goNext, 5000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  // Botões de navegação
  if (nextBtn) nextBtn.addEventListener('click', goNext);
  if (prevBtn) prevBtn.addEventListener('click', goPrev);

  // Swipe touch
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
  }, { passive: true });

  // Pausar autoplay ao focar/hover no carrossel
  track.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
  track.addEventListener('mouseleave', startAutoPlay);

  // Keyboard navigation
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });

  // Recalcular ao redimensionar
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(0); // resetar para o início ao redimensionar
    }, 200);
  });

  // Inicializar
  buildDots();
  goTo(0);
  startAutoPlay();
})();

/* ─── GALERIA: LIGHTBOX SIMPLES ───────────────────────────── */
(function initGallery() {
  const galeriaItems = document.querySelectorAll('.galeria__item');
  if (!galeriaItems.length) return;

  // Criar lightbox
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Visualização de imagem');
  lightbox.innerHTML = `
    <div class="lightbox__overlay"></div>
    <div class="lightbox__content">
      <button class="lightbox__close" aria-label="Fechar">✕</button>
      <img src="" alt="" class="lightbox__img" />
    </div>
  `;

  // Estilos inline do lightbox (sem poluir style.css com estado JS)
  const style = document.createElement('style');
  style.textContent = `
    #lightbox {
      position: fixed; inset: 0; z-index: 9999;
      display: none; align-items: center; justify-content: center;
    }
    #lightbox.open { display: flex; }
    .lightbox__overlay {
      position: absolute; inset: 0;
      background: rgba(20,14,8,0.9);
      backdrop-filter: blur(6px);
    }
    .lightbox__content {
      position: relative; z-index: 1;
      max-width: 90vw; max-height: 90vh;
      border-radius: 12px; overflow: hidden;
      animation: lbIn .3s ease;
    }
    @keyframes lbIn { from { opacity:0; transform:scale(.92); } to { opacity:1; transform:scale(1); } }
    .lightbox__img {
      display: block;
      max-width: 90vw; max-height: 85vh;
      object-fit: contain;
    }
    .lightbox__close {
      position: absolute; top: 12px; right: 14px;
      background: rgba(0,0,0,0.6); color: #fff;
      border: none; cursor: pointer;
      width: 36px; height: 36px; border-radius: 50%;
      font-size: 1rem; display: flex; align-items: center; justify-content: center;
      transition: background .2s ease; z-index: 2;
    }
    .lightbox__close:hover { background: rgba(201,168,106,0.9); }
  `;
  document.head.appendChild(style);
  document.body.appendChild(lightbox);

  const lbImg   = lightbox.querySelector('.lightbox__img');
  const lbClose = lightbox.querySelector('.lightbox__close');

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  galeriaItems.forEach(item => {
    const img = item.querySelector('img');
    if (!img) return;
    item.style.cursor = 'zoom-in';
    item.addEventListener('click', () => openLightbox(img.src, img.alt));
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Ampliar: ${img.alt}`);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(img.src, img.alt);
      }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox__overlay').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
})();

/* ─── BOTÃO WHATSAPP FLUTUANTE: OCULTAR NO TOPO ───────────── */
(function floatingBtn() {
  const floatBtn = document.querySelector('.whatsapp-float');
  if (!floatBtn) return;

  // Ocultar no topo da página (já tem botão no hero)
  function toggleFloatBtn() {
    if (window.scrollY > 400) {
      floatBtn.style.opacity = '1';
      floatBtn.style.pointerEvents = 'auto';
      floatBtn.style.transform = '';
    } else {
      floatBtn.style.opacity = '0';
      floatBtn.style.pointerEvents = 'none';
      floatBtn.style.transform = 'translateY(20px)';
    }
  }

  floatBtn.style.transition = 'opacity 0.4s ease, transform 0.4s ease, box-shadow 0.3s ease';
  window.addEventListener('scroll', toggleFloatBtn, { passive: true });
  toggleFloatBtn();
})();

/* ─── ACTIVE NAV LINK AO SCROLLAR ────────────────────────── */
(function activeNav() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.header__nav-link');

  if (!sections.length || !navLinks.length) return;

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(section => sectionObserver.observe(section));
})();
