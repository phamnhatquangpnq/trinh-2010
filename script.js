// Standardized to production level
// Purpose: Hiệu ứng cuộn, cánh hoa rơi, tim bay, pháo hoa cho trang chúc 20/10
'use strict';

(() => {
  const $ = (s) => document.querySelector(s);
  const rand = (a, b) => Math.random() * (a - b) + b;

  /* Stars */
  document.querySelectorAll('.stars').forEach((el) => {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 90; i++) {
      const s = document.createElement('i');
      s.style.cssText = `left:${rand(0, 100)}%;top:${rand(0, 100)}%;animation-delay:${rand(0, 3)}s`;
      frag.appendChild(s);
    }
    el.appendChild(frag);
  });

  /* Name letters */
  const nameEl = $('#typeName');
  if (nameEl) {
    [...(nameEl.dataset.text || '')].forEach((c, i) => {
      const span = document.createElement('span');
      span.className = 'ch';
      span.textContent = c === ' ' ? '\u00A0' : c;
      span.style.animationDelay = `${0.3 + i * 0.12}s`;
      nameEl.appendChild(span);
    });
  }

  /* Scroll reveal */
  const video = document.querySelector('video');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in-view');
      if (e.target.id === 's4') startHearts();
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.scene').forEach((s) => io.observe(s));
  if (video) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) video.play().catch(() => { /* autoplay bị chặn – người dùng tự bấm */ });
      else video.pause();
    }, { threshold: 0.5 }).observe(video);
  }

  /* Progress bar */
  const bar = $('#progressBar');
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar && max > 0) bar.style.width = `${(scrollY / max) * 100}%`;
  }, { passive: true });

  /* Hearts */
  let heartsOn = false;
  function startHearts() {
    if (heartsOn) return;
    heartsOn = true;
    const box = $('#hearts');
    const icons = ['💗', '💖', '💕', '🤍', '💓'];
    setInterval(() => {
      if (!box || document.hidden) return;
      const h = document.createElement('span');
      h.textContent = icons[Math.floor(Math.random() * icons.length)];
      h.style.cssText = `left:${rand(0, 100)}%;font-size:${rand(14, 32)}px;animation-duration:${rand(5, 9)}s`;
      box.appendChild(h);
      setTimeout(() => h.remove(), 9000);
    }, 450);
  }

  /* Petals canvas */
  const pc = $('#petals');
  const pctx = pc && pc.getContext('2d');
  let petals = [];
  const resize = () => { if (pc) { pc.width = innerWidth; pc.height = innerHeight; } };
  resize();
  window.addEventListener('resize', resize);
  const count = innerWidth < 700 ? 18 : 32;
  for (let i = 0; i < count; i++) {
    petals.push({ x: rand(0, innerWidth), y: rand(-innerHeight, innerHeight), r: rand(6, 12), s: rand(0.5, 1.4), a: rand(0, 6.28), w: rand(0.01, 0.03), hue: rand(330, 360) });
  }
  function drawPetals() {
    if (!pctx) return;
    pctx.clearRect(0, 0, pc.width, pc.height);
    for (const p of petals) {
      p.y += p.s; p.a += p.w; p.x += Math.sin(p.a) * 0.8;
      if (p.y > pc.height + 20) { p.y = -20; p.x = rand(0, pc.width); }
      pctx.save();
      pctx.translate(p.x, p.y);
      pctx.rotate(p.a);
      pctx.fillStyle = `hsla(${p.hue},85%,78%,0.75)`;
      pctx.beginPath();
      pctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
      pctx.fill();
      pctx.restore();
    }
    requestAnimationFrame(drawPetals);
  }
  drawPetals();

  /* Fireworks */
  const fc = $('#fireworks');
  const fctx = fc && fc.getContext('2d');
  let sparks = [];
  let fwRunning = false;
  function burst(x, y) {
    const hue = rand(0, 360);
    for (let i = 0; i < 70; i++) {
      const ang = rand(0, Math.PI * 2), sp = rand(1, 6);
      sparks.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, hue: hue + rand(-20, 20) });
    }
  }
  function drawFw() {
    if (!fctx) return;
    fctx.globalCompositeOperation = 'destination-out';
    fctx.fillStyle = 'rgba(0,0,0,0.22)';
    fctx.fillRect(0, 0, fc.width, fc.height);
    fctx.globalCompositeOperation = 'lighter';
    sparks = sparks.filter((s) => s.life > 0);
    for (const s of sparks) {
      s.x += s.vx; s.y += s.vy; s.vy += 0.05; s.vx *= 0.985; s.life -= 0.012;
      fctx.fillStyle = `hsla(${s.hue},100%,65%,${s.life})`;
      fctx.beginPath(); fctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2); fctx.fill();
    }
    requestAnimationFrame(drawFw);
  }

  const gift = $('#giftBtn');
  gift && gift.addEventListener('click', () => {
    if (gift.classList.contains('open')) return;
    gift.classList.add('open');
    $('#giftHint').style.display = 'none';
    setTimeout(() => { gift.style.display = 'none'; $('#finalMsg').classList.add('show'); }, 900);
    if (!fc || fwRunning) return;
    fwRunning = true;
    fc.width = fc.offsetWidth; fc.height = fc.offsetHeight;
    drawFw();
    let n = 0;
    const t = setInterval(() => {
      burst(rand(fc.width * 0.15, fc.width * 0.85), rand(fc.height * 0.15, fc.height * 0.5));
      if (++n > 14) clearInterval(t);
    }, 380);
  });
})();
