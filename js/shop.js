/* ============================================================
   VELVETY — Shop page: dropdowns, working filter/sort, add-to-cart
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const grid = $(".shop-grid");
  const countEl = $(".shop-count");
  const num = (t) => parseFloat((t || "").replace(/[^0-9.]/g, "")) || 0;

  /* read a product's data from its card */
  const readProduct = (card) => {
    const nameEl = card.querySelector(".shop-card__name h3, .shop-card__desc h3");
    const nowEl = card.querySelector(".shop-card__price .now") || card.querySelector(".shop-card__price");
    const oldEl = card.querySelector(".shop-card__price .old");
    const rnumEl = card.querySelector(".rnum");
    const img = card.querySelector(".bottle");
    return {
      name: nameEl ? nameEl.textContent.trim() : "Product",
      price: num(nowEl && nowEl.textContent),
      old: oldEl ? num(oldEl.textContent) : undefined,
      rating: num(rnumEl && rnumEl.textContent),
      img: img ? img.getAttribute("src") : "assets/img/bottle_chicori.png",
      cat: card.dataset.cat || "",
    };
  };

  /* ---------- assign categories + add-to-cart buttons ---------- */
  const cats = $$("#filterTabs .pill").slice(1).map((b) => b.textContent.trim());
  const cards = grid ? $$(".shop-card", grid) : [];
  cards.forEach((card, i) => {
    if (cats.length) card.dataset.cat = cats[i % cats.length];
    const imgBox = card.querySelector(".shop-card__img");
    if (imgBox && !imgBox.querySelector(".card-add")) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card-add";
      btn.setAttribute("aria-label", "Add to cart");
      btn.innerHTML = "<span>Add to cart</span>";
      imgBox.appendChild(btn);
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const p = readProduct(card);
        if (window.VelvetyCart) window.VelvetyCart.add({ name: p.name, price: p.price, old: p.old, img: p.img, cat: p.cat, qty: 1 });
        btn.classList.add("added");
        const t = btn.innerHTML;
        btn.innerHTML = "<span>Added ✓</span>";
        setTimeout(() => { btn.classList.remove("added"); btn.innerHTML = t; }, 1100);
      });
    }
  });
  const cardData = cards.map((card) => ({ card, p: readProduct(card) }));

  /* ---------- apply filter + sort ---------- */
  function applyFilterSort() {
    if (!grid) return;
    const activePill = (($("#filterTabs .pill.is-active") || {}).textContent || "All needs").trim();
    const checks = $$('.filter-dd[data-dd="filter"] input:checked').map((i) => i.closest("label").textContent.trim());
    const onSale = checks.includes("On sale");
    const priceRanges = [];
    if (checks.some((c) => c.includes("Under"))) priceRanges.push((v) => v < 20);
    if (checks.some((c) => c.includes("–"))) priceRanges.push((v) => v >= 20 && v <= 30);
    if (checks.some((c) => c.includes("Over"))) priceRanges.push((v) => v > 30);
    let minRating = 0;
    if (checks.some((c) => c.includes("4.5"))) minRating = 4.5;
    else if (checks.some((c) => c.includes("4.0"))) minRating = 4.0;
    const sort = (($('.filter-dd[data-dd="sort"] .fm-opt.is-active') || {}).textContent || "Featured").trim();

    let list = cardData.filter(({ p }) => {
      if (activePill !== "All needs" && p.cat !== activePill) return false;
      if (onSale && !p.old) return false;
      if (priceRanges.length && !priceRanges.some((fn) => fn(p.price))) return false;
      if (p.rating < minRating) return false;
      return true;
    });

    if (sort === "Price: Low to High") list.sort((a, b) => a.p.price - b.p.price);
    else if (sort === "Price: High to Low") list.sort((a, b) => b.p.price - a.p.price);
    else if (sort === "Top Rated") list.sort((a, b) => b.p.rating - a.p.rating);
    else if (sort === "Newest") list = list.slice().reverse();

    cardData.forEach(({ card }) => { card.style.display = "none"; });
    list.forEach(({ card }) => { card.style.display = ""; grid.appendChild(card); });
    if (countEl) countEl.textContent = "Showing " + list.length + " of 100";
  }

  /* ---------- Category tabs: scroll + filter ---------- */
  const tabs = $("#filterTabs");
  const scrollBtn = $("#tabsScroll");
  if (tabs && scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      const atEnd = tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 8;
      tabs.scrollBy({ left: atEnd ? -tabs.clientWidth : tabs.clientWidth * 0.8, behavior: "smooth" });
    });
    let down = false, sx, sl;
    tabs.addEventListener("pointerdown", (e) => { down = true; sx = e.pageX; sl = tabs.scrollLeft; });
    window.addEventListener("pointerup", () => (down = false));
    tabs.addEventListener("pointermove", (e) => { if (down) tabs.scrollLeft = sl - (e.pageX - sx); });
  }
  $$("#filterTabs .pill").forEach((pill) => pill.addEventListener("click", () => setTimeout(applyFilterSort, 0)));

  /* ---------- Filter / Sort dropdowns ---------- */
  const dds = $$(".filter-dd");
  dds.forEach((dd) => {
    const btn = dd.querySelector(".filter-btn");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !dd.classList.contains("open");
      dds.forEach((d) => { d.classList.remove("open"); const b = d.querySelector(".filter-btn"); if (b) b.setAttribute("aria-expanded", "false"); });
      dd.classList.toggle("open", willOpen);
      btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
    dd.querySelector(".filter-menu").addEventListener("click", (e) => e.stopPropagation());
  });

  const sortDD = $('.filter-dd[data-dd="sort"]');
  if (sortDD) {
    const label = sortDD.querySelector(".sort-label");
    $$(".fm-opt", sortDD).forEach((opt) =>
      opt.addEventListener("click", () => {
        $$(".fm-opt", sortDD).forEach((o) => o.classList.remove("is-active"));
        opt.classList.add("is-active");
        if (label) label.textContent = opt.textContent;
        sortDD.classList.remove("open");
        applyFilterSort();
      })
    );
  }

  const filterDD = $('.filter-dd[data-dd="filter"]');
  if (filterDD) {
    const clear = filterDD.querySelector(".fm-clear");
    const apply = filterDD.querySelector(".fm-apply");
    const badge = filterDD.querySelector(".fm-badge");
    const updateBadge = () => {
      const n = $$("input:checked", filterDD).length;
      if (badge) { badge.textContent = n; badge.hidden = n === 0; }
    };
    $$("input", filterDD).forEach((i) => i.addEventListener("change", updateBadge));
    if (clear) clear.addEventListener("click", () => { $$("input", filterDD).forEach((i) => (i.checked = false)); updateBadge(); applyFilterSort(); });
    if (apply) apply.addEventListener("click", () => { filterDD.classList.remove("open"); updateBadge(); applyFilterSort(); });
    updateBadge();
  }

  document.addEventListener("click", () => dds.forEach((d) => { d.classList.remove("open"); const b = d.querySelector(".filter-btn"); if (b) b.setAttribute("aria-expanded", "false"); }));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") dds.forEach((d) => d.classList.remove("open")); });

  /* ---------- Pagination active ---------- */
  $$(".page-num").forEach((n) =>
    n.addEventListener("click", () => {
      $$(".page-num").forEach((x) => x.classList.remove("is-active"));
      n.classList.add("is-active");
    })
  );

  /* ---------- Blogs carousel ---------- */
  const track = $(".blogs__track");
  if (track) {
    const step = () => (track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width + 32 : 340);
    const prev = $(".bl-prev"), next = $(".bl-next");
    if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    if (next) next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    let d = false, sx, sl;
    track.addEventListener("pointerdown", (e) => { d = true; sx = e.pageX; sl = track.scrollLeft; track.style.cursor = "grabbing"; });
    window.addEventListener("pointerup", () => { d = false; track.style.cursor = ""; });
    track.addEventListener("pointermove", (e) => { if (d) track.scrollLeft = sl - (e.pageX - sx); });
  }
})();
