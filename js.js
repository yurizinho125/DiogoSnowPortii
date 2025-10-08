/*
  Lógica:
  - IntersectionObserver detecta quando cada .skill aparece
  - Ao aparecer, animamos a largura da .bar-fill e contamos o número até o valor final
  - Respeita prefers-reduced-motion (sem animação)
*/

(function(){
  const skills = document.querySelectorAll('.skill');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateNumber(el, start, end, duration) {
    if (reduceMotion) {
      el.textContent = end + '%';
      return;
    }
    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(start + (end - start) * progress);
      el.textContent = value + '%';
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function animateBar(skillEl) {
    const target = Number(skillEl.getAttribute('data-percent')) || 0;
    const fill = skillEl.querySelector('.bar-fill');
    const percentLabel = skillEl.querySelector('.skill-percent');

    // acessibilidade: atualiza aria-valuenow
    fill.setAttribute('aria-valuenow', 0);

    if (reduceMotion) {
      // sem animação: mostra final
      fill.style.width = target + '%';
      fill.setAttribute('aria-valuenow', target);
      percentLabel.textContent = target + '%';
      return;
    }

    // anima a largura (CSS transition cuidará da suavidade)
    requestAnimationFrame(() => {
      void fill.offsetWidth; // força reflow
      fill.style.width = target + '%';
      fill.setAttribute('aria-valuenow', target);
    });

    // anima o número
    animateNumber(percentLabel, 0, target, 1000 + target * 6);
  }

  // IntersectionObserver: anima quando 40% do elemento está visível
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateBar(entry.target);
        obs.unobserve(entry.target); // anima só uma vez
      }
    });
  }, { threshold: 0.4 });

  skills.forEach(s => io.observe(s));
})();

