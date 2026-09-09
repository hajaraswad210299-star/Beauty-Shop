/* ============================================================
   VELVETY — About page interactions (loads after script.js)
   ============================================================ */
(function () {
  "use strict";
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ---------- Horizontal carousels (Explore + Blogs) ---------- */
  const wireCarousel = (track, prevBtn, nextBtn, step) => {
    if (!track) return;
    const amount = () => step || track.firstElementChild.getBoundingClientRect().width + 32;
    if (prevBtn) prevBtn.addEventListener("click", () => track.scrollBy({ left: -amount() * 1, behavior: "smooth" }));
    if (nextBtn) nextBtn.addEventListener("click", () => track.scrollBy({ left: amount() * 1, behavior: "smooth" }));
  };

  $$(".excat").forEach((cat) => {
    wireCarousel(cat.querySelector(".excat__track"), cat.querySelector(".ex-prev"), cat.querySelector(".ex-next"));
  });
  const blogTrack = document.querySelector(".blogs__track");
  wireCarousel(blogTrack, document.querySelector(".bl-prev"), document.querySelector(".bl-next"));

  /* drag-to-scroll for tracks (desktop nicety) */
  $$(".excat__track, .blogs__track").forEach((t) => {
    let down = false, startX, startL;
    t.addEventListener("pointerdown", (e) => { down = true; startX = e.pageX; startL = t.scrollLeft; t.style.cursor = "grabbing"; });
    window.addEventListener("pointerup", () => { down = false; t.style.cursor = ""; });
    t.addEventListener("pointermove", (e) => { if (!down) return; t.scrollLeft = startL - (e.pageX - startX); });
  });

  /* ---------- Stats count-up ---------- */
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const isFloat = !Number.isInteger(target);
    const dur = 1400;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = (isFloat ? target.toFixed(1) : target) + suffix;
    };
    requestAnimationFrame(tick);
  };
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        if (!reduce) $$("b[data-count]", e.target).forEach(animateCount);
        statObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  const statsSection = document.querySelector(".stats");
  if (statsSection) statObs.observe(statsSection);
})();
