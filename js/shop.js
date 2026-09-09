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
