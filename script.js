/* ══════════════════════════════════════════════════════════════
   ILYANNA 18 ANS — Faire-part numérique
   script.js — Animations, Confettis, Countdown, RSVP, Audio
   ══════════════════════════════════════════════════════════════ */

'use strict';

/* ────────────────────────────────────────────────────────────
   1. NAVBAR — fond au défilement
   ──────────────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


/* ────────────────────────────────────────────────────────────
   2. COMPTE À REBOURS
   ── Modifiez EVENT_DATE pour correspondre à la vraie date ──
   ──────────────────────────────────────────────────────────── */
const EVENT_DATE = new Date('2026-05-09T19:00:00');

function pad(n) {
  return String(n).padStart(2, '0');
}

function updateCountdown() {
  const now  = new Date();
  const diff = EVENT_DATE - now;

  if (diff <= 0) {
    // L'événement est arrivé : afficher un message festif
    const wrap = document.getElementById('countdown-wrap');
    if (wrap) {
      wrap.innerHTML =
        '<p style="color:var(--gold);font-family:var(--font-serif);font-size:1.4rem;font-style:italic;">🎉 C\'est aujourd\'hui !</p>';
    }
    return;
  }

  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000)  / 60000);
  const seconds = Math.floor((diff % 60000)    / 1000);

  document.getElementById('cd-days').textContent    = pad(days);
  document.getElementById('cd-hours').textContent   = pad(hours);
  document.getElementById('cd-minutes').textContent = pad(minutes);
  document.getElementById('cd-seconds').textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);


/* ────────────────────────────────────────────────────────────
   3. RÉVÉLATION AU SCROLL (Intersection Observer)
   ──────────────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Désobserver après révélation (optimisation)
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal-section').forEach((el) => {
  revealObserver.observe(el);
});


/* ────────────────────────────────────────────────────────────
   4. CONFETTIS — Effet canvas doré / festif
   ──────────────────────────────────────────────────────────── */
(function initConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Couleurs festives (or, champagne, blanc, or rosé)
  const COLORS = [
    '#c9a84c', '#e8c96d', '#d4af37',
    '#f0e8d0', '#ffffff', '#e8c4b0',
    '#f5d78e', '#b89030',
  ];

  const TOTAL  = 110;  // Nombre de particules
  const SPAWN_DURATION = 6000; // Durée de génération en ms

  let W, H;
  let particles   = [];
  let spawning    = true;
  let rafId       = null;

  /* Redimensionnement */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* Nombre aléatoire entre a et b */
  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  /* Créer une nouvelle particule depuis le haut */
  function newParticle(scatter) {
    return {
      x:        rand(0, W),
      y:        scatter ? rand(-300, H * 0.6) : rand(-60, -5),
      vx:       rand(-0.9, 0.9),
      vy:       rand(1.4, 3.6),
      size:     rand(5, 12),
      color:    COLORS[(Math.random() * COLORS.length) | 0],
      opacity:  scatter ? rand(0.5, 1) : rand(0.7, 1),
      rotation: rand(0, Math.PI * 2),
      spin:     rand(-0.05, 0.05),
      isCircle: Math.random() > 0.55,
    };
  }

  /* Initialiser les particules (dispersées pour l'effet immédiat) */
  for (let i = 0; i < TOTAL; i++) {
    particles.push(newParticle(true));
  }

  /* Arrêter la génération après SPAWN_DURATION ms */
  setTimeout(() => { spawning = false; }, SPAWN_DURATION);

  /* Boucle d'animation */
  function animate() {
    ctx.clearRect(0, 0, W, H);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Mise à jour physique
      p.x        += p.vx;
      p.y        += p.vy;
      p.rotation += p.spin;

      // Fondu progressif quand on ne génère plus
      if (!spawning) {
        p.opacity -= 0.0022;
      }

      // Supprimer ou recycler la particule
      if (p.opacity <= 0 || p.y > H + 20) {
        if (spawning) {
          particles[i] = newParticle(false);
        } else {
          particles.splice(i, 1);
        }
        continue;
      }

      // Dessin
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle   = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.isCircle) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Rectangle aplati (confetti classique)
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }

      ctx.restore();
    }

    // Continuer tant qu'il reste des particules
    if (particles.length > 0) {
      rafId = requestAnimationFrame(animate);
    }
  }

  animate();
})();


/* ────────────────────────────────────────────────────────────
   4b. DIAPORAMA PHOTOS
   ──────────────────────────────────────────────────────────── */
(function initSlideshow() {
  const slides   = document.querySelectorAll('.slide');
  const dotsWrap = document.getElementById('slide-dots');
  const prevBtn  = document.getElementById('slide-prev');
  const nextBtn  = document.getElementById('slide-next');
  if (!slides.length || !dotsWrap) return;

  let current = 0;
  let timer   = null;
  const DELAY = 4000; // ms entre chaque photo

  /* Créer les dots */
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Photo ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(index) {
    slides[current].classList.remove('active');
    dotsWrap.children[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsWrap.children[current].classList.add('active');
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), DELAY);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  /* Swipe tactile */
  let touchStartX = 0;
  const track = document.getElementById('slideshow-track');
  if (track) {
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
    }, { passive: true });
  }

  resetTimer();
})();


/* ────────────────────────────────────────────────────────────
   5. FORMULAIRE RSVP — envoi par SMS
   ── Remplacez le numéro ci-dessous par le bon numéro ──
   ──────────────────────────────────────────────────────────── */

// ⚠️ MODIFIEZ CE NUMÉRO (format international, ex: +33612345678)
const SMS_PHONE = '+33695380597';

const rsvpForm       = document.getElementById('rsvp-form');
const confirmation   = document.getElementById('confirmation');
const guestsGroup    = document.getElementById('guests-group');
const presenceRadios = document.querySelectorAll('input[name="presence"]');

/* Masquer "nombre de personnes" si la personne répond Non */
presenceRadios.forEach((radio) => {
  radio.addEventListener('change', () => {
    if (guestsGroup) {
      guestsGroup.style.display = radio.value === 'non' ? 'none' : 'block';
    }
  });
});

/* Soumission : construction du SMS et ouverture de l'app SMS native */
rsvpForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const prenom     = document.getElementById('prenom').value.trim();
  const presenceEl = document.querySelector('input[name="presence"]:checked');
  const guests     = document.getElementById('guests').value;

  /* Validation */
  if (!prenom) {
    shakeField('prenom');
    return;
  }

  if (!presenceEl) {
    document.querySelector('.radio-group').style.outline =
      '1px solid rgba(201,168,76,0.6)';
    document.querySelector('.radio-group').style.borderRadius = '10px';
    setTimeout(() => {
      document.querySelector('.radio-group').style.outline = '';
    }, 1800);
    return;
  }

  const presence = presenceEl.value;
  const nb       = parseInt(guests, 10);

  /* Construire le corps du SMS */
  let smsBody;
  if (presence === 'oui') {
    const label = nb > 1 ? `${nb} personnes` : '1 personne';
    smsBody =
      `Bonjour, je suis ${prenom} 🎉 Je confirme ma présence à l'anniversaire d'Ilyanna le 9 Mai 2026. ` +
      `Nous serons ${label}. À très bientôt !`;
  } else {
    smsBody =
      `Bonjour, je suis ${prenom}. Je suis désolé(e) mais je ne pourrai malheureusement pas être présent(e) ` +
      `à l'anniversaire d'Ilyanna le 9 Mai 2026. Bonne fête à elle ! 💛`;
  }

  /* Ouvrir l'application SMS native
     iOS utilise & comme séparateur, Android/autres utilisent ? */
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const sep   = isIOS ? '&' : '?';
  window.location.href = `sms:${SMS_PHONE}${sep}body=${encodeURIComponent(smsBody)}`;

  /* Message de confirmation visuel sur la page */
  if (presence === 'oui') {
    confirmation.className = 'confirmation success visible';
    confirmation.innerHTML =
      `<strong>🎉 Merci ${escapeHtml(prenom)} !</strong>
       Votre SMS a été préparé — envoyez-le pour confirmer votre présence.
       <em>Nous avons hâte de vous retrouver !</em>`;
  } else {
    confirmation.className = 'confirmation regret visible';
    confirmation.innerHTML =
      `<strong>Merci ${escapeHtml(prenom)} pour votre réponse.</strong>
       Votre SMS a été préparé — envoyez-le pour nous prévenir. 💛`;
  }

  confirmation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  setTimeout(() => {
    rsvpForm.reset();
    if (guestsGroup) guestsGroup.style.display = 'block';
  }, 600);
});

/* Animation de secousse pour champ invalide */
function shakeField(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.transition = 'transform 0.07s ease';
  let count = 0;
  const shake = setInterval(() => {
    el.style.transform = count % 2 === 0 ? 'translateX(6px)' : 'translateX(-6px)';
    count++;
    if (count > 5) {
      clearInterval(shake);
      el.style.transform = '';
      el.focus();
    }
  }, 70);
}

/* Échappement HTML (sécurité : prévention XSS dans innerHTML) */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


/* ────────────────────────────────────────────────────────────
   6. LECTEUR AUDIO
   ── Remplacez music.mp3 par votre fichier audio ──
   ──────────────────────────────────────────────────────────── */
const audio        = document.getElementById('bg-audio');
const playBtn      = document.getElementById('play-btn');
const playIcon     = document.getElementById('play-icon');
const progressBar  = document.getElementById('audio-progress');

let isPlaying = false;

/* ── Splash screen + démarrage audio ──
   Le clic sur "Entrer" constitue une interaction utilisateur valide,
   ce qui permet de contourner la restriction autoplay des navigateurs. */
const splash    = document.getElementById('splash');
const splashBtn = document.getElementById('splash-btn');

splashBtn.addEventListener('click', () => {
  // Fermer le splash avec fondu
  splash.classList.add('hidden');

  // Démarrer la musique (interaction garantie → jamais bloquée)
  audio.play().then(() => {
    setPlayState(true);
  }).catch(() => {
    // Cas extrêmement rare (pas de fichier audio présent, etc.)
    setPlayState(false);
  });
}, { once: true });

/* Lecture / Pause */
playBtn.addEventListener('click', () => {
  if (isPlaying) {
    audio.pause();
    setPlayState(false);
  } else {
    audio.play().catch(() => {});
    setPlayState(true);
  }
});

function setPlayState(playing) {
  isPlaying = playing;
  playIcon.textContent = playing ? '⏸' : '▶';
  playBtn.dataset.playing = playing;
  playBtn.setAttribute(
    'aria-label',
    playing ? 'Mettre en pause la musique' : 'Jouer la musique d\'ambiance'
  );
}

/* Barre de progression */
audio.addEventListener('timeupdate', () => {
  if (audio.duration && progressBar) {
    const pct = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${pct}%`;
  }
}, { passive: true });

/* Fin de lecture */
audio.addEventListener('ended', () => {
  setPlayState(false);
  if (progressBar) progressBar.style.width = '0%';
});
