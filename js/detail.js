/* ============================================================
   VELVETY — Product Detail interactions (after script.js)
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Gallery thumbnails ---------- */
  const main = $("#pdMain");
  $$(".pd__thumb").forEach((t) =>
    t.addEventListener("click", () => {
      $$(".pd__thumb").forEach((x) => x.classList.remove("is-active"));
      t.classList.add("is-active");
      const img = t.querySelector("img");
      if (main && img) {
        main.style.opacity = 0;
        setTimeout(() => { main.src = img.src; main.style.transition = "opacity .35s ease"; main.style.opacity = 1; }, 150);
      }
    })
  );

  /* ---------- Quantity stepper ---------- */
  const qtyEl = $("#qty");
  let qty = 1;
  const setQty = (v) => { qty = Math.max(1, Math.min(27, v)); qtyEl.textContent = qty; };
  const m = $("#qtyMinus"), p = $("#qtyPlus");
  if (m) m.addEventListener("click", () => setQty(qty - 1));
  if (p) p.addEventListener("click", () => setQty(qty + 1));

  /* ---------- Purchase options ---------- */
  $$(".pd__opt").forEach((o) =>
    o.addEventListener("click", () => {
      $$(".pd__opt").forEach((x) => x.classList.remove("is-active"));
      o.classList.add("is-active");
    })
  );

  /* ---------- Tabs ---------- */
  const bodies = { use: "#tabUse", benefit: "#tabBenefit", ingredients: "#tabIngredients", return: "#tabReturn" };
  $$(".pd__tabnav button").forEach((b) =>
    b.addEventListener("click", () => {
      $$(".pd__tabnav button").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      Object.values(bodies).forEach((sel) => { const el = $(sel); if (el) el.hidden = true; });
      const target = $(bodies[b.dataset.tab]);
      if (target) target.hidden = false;
    })
  );

  /* ---------- Add to cart feedback ---------- */
  const cart = $(".btn-cart");
  if (cart) cart.addEventListener("click", () => {
    const original = cart.textContent;
    cart.textContent = "Added to cart ✓";
    setTimeout(() => (cart.textContent = original), 1600);
  });
  const fav = $(".btn-fav");
  if (fav) fav.addEventListener("click", () => fav.classList.toggle("is-active"));

  /* ---------- Related carousel ---------- */
  const track = $(".pdrel__track");
  if (track) {
    const step = () => (track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width : 300);
    const prev = $(".rel-prev"), next = $(".rel-next");
    if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    if (next) next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    let d = false, sx, sl;
    track.addEventListener("pointerdown", (e) => { d = true; sx = e.pageX; sl = track.scrollLeft; track.style.cursor = "grabbing"; });
    window.addEventListener("pointerup", () => { d = false; track.style.cursor = ""; });
    track.addEventListener("pointermove", (e) => { if (d) track.scrollLeft = sl - (e.pageX - sx); });
  }
})();
