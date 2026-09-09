/* ============================================================
   VELVETY — Shop page interactions (after script.js)
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Category tabs horizontal scroll ---------- */
  const tabs = $("#filterTabs");
  const scrollBtn = $("#tabsScroll");
  if (tabs && scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      const atEnd = tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 8;
      tabs.scrollBy({ left: atEnd ? -tabs.clientWidth : tabs.clientWidth * 0.8, behavior: "smooth" });
    });
    // drag to scroll
    let down = false, sx, sl;
    tabs.addEventListener("pointerdown", (e) => { down = true; sx = e.pageX; sl = tabs.scrollLeft; });
    window.addEventListener("pointerup", () => (down = false));
    tabs.addEventListener("pointermove", (e) => { if (down) tabs.scrollLeft = sl - (e.pageX - sx); });
  }

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
  // sort option select -> update label + active
  const sortDD = $('.filter-dd[data-dd="sort"]');
  if (sortDD) {
    const label = sortDD.querySelector(".sort-label");
    $$(".fm-opt", sortDD).forEach((opt) =>
      opt.addEventListener("click", () => {
        $$(".fm-opt", sortDD).forEach((o) => o.classList.remove("is-active"));
        opt.classList.add("is-active");
        if (label) label.textContent = opt.textContent;
        sortDD.classList.remove("open");
      })
    );
  }
  // filter clear/apply
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
    if (clear) clear.addEventListener("click", () => { $$("input", filterDD).forEach((i) => (i.checked = false)); updateBadge(); });
    if (apply) apply.addEventListener("click", () => filterDD.classList.remove("open"));
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

  /* ---------- Blogs carousel (reused markup) ---------- */
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
