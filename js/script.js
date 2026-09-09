/* ============================================================
   VELVETY — interactions & animations
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ---------- Navbar: solid on scroll ---------- */
  const nav = $("#nav");
  const hero = $("#hero");
  const onScroll = () => {
    const trigger = (hero ? hero.offsetHeight : 500) - 90;
    nav.classList.toggle("is-solid", window.scrollY > trigger);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$(".nav__menu a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Hero headline staggered reveal ---------- */
  const heroTitle = $(".reveal-hero");
  if (heroTitle) {
    $$(".line > *", heroTitle).length ||
      $$(".line", heroTitle).forEach((l) => {
        const span = document.createElement("span");
        span.textContent = l.textContent;
        l.textContent = "";
        l.appendChild(span);
      });
    $$(".line > *", heroTitle).forEach((s, i) => {
      s.style.transitionDelay = 0.15 + i * 0.13 + "s";
    });
    requestAnimationFrame(() => heroTitle.classList.add("in"));
  }

  /* ---------- Staggered children inside revealed blocks ---------- */
  const stagger = (parentSel, childSel, step = 0.09) => {
    const parent = $(parentSel);
    if (!parent) return;
    $$(childSel, parent).forEach((c, i) => {
      c.style.transitionDelay = i * step + "s";
    });
  };
  stagger(".ingredients__right", ".ing-item");
  stagger(".featured__grid", ".product-lg", 0.12);
  stagger(".about__logos", "img", 0.08);

  /* ---------- Hero parallax (bottle + leaf + title) ---------- */
  const bottle = $(".hero__bottle");
  const leaf = $(".hero__leaf");
  const title = $(".hero__title");
  if (!reduce && hero) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < hero.offsetHeight + 200) {
            if (bottle) bottle.style.translate = "0 " + y * 0.12 + "px";
            if (leaf) leaf.style.translate = "0 " + y * 0.06 + "px";
            if (title) title.style.translate = "0 " + y * -0.04 + "px";
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* ---------- Category pills: single active ---------- */
  $$(".pill").forEach((p) =>
    p.addEventListener("click", () => {
      $$(".pill").forEach((x) => x.classList.remove("is-active"));
      p.classList.add("is-active");
    })
  );

  /* ---------- Testimonials: rotating quotes ---------- */
  const quotes = [
    {
      q: "“I’ve been feeling pretty stressed with my skin lately, so I picked up a set of HOLOCENA skincare. Oh my goodness!. It was AMAZING. My skin felt so soft and moisturized”",
      a: "- Customer Review",
    },
    {
      q: "“Velvety turned my daily routine into a ritual. The CHICORI serum absorbs instantly and my skin has never looked this calm and even.”",
      a: "- Amelia R.",
    },
    {
      q: "“Clean, honest ingredients that actually work. NOTORIOUS is now a permanent part of my nightstand — five stars without hesitation.”",
      a: "- Jonas M.",
    },
    {
      q: "“You can feel the craft in every bottle. Gentle, effective and beautifully made. Velvety is the real deal.”",
      a: "- Priya S.",
    },
  ];
  const qEl = $(".testi__quote");
  const aEl = $(".testi__author");
  const testiDots = $$(".testi__slider .dot");
  let qi = 0;
  const setQuote = (i) => {
    qi = (i + quotes.length) % quotes.length;
    if (!qEl) return;
    qEl.style.opacity = 0;
    qEl.style.transform = "translateY(10px)";
    if (aEl) aEl.style.opacity = 0;
    setTimeout(() => {
      qEl.textContent = quotes[qi].q;
      if (aEl) aEl.textContent = quotes[qi].a;
      qEl.style.transition = "opacity .5s ease, transform .5s ease";
      if (aEl) aEl.style.transition = "opacity .5s ease";
      qEl.style.opacity = 1;
      qEl.style.transform = "none";
      if (aEl) aEl.style.opacity = 1;
    }, 260);
    testiDots.forEach((d, k) => d.classList.toggle("is-active", k === qi));
  };
  const arrows = $$(".testi__slider .hero__arrow");
  if (arrows[0]) arrows[0].addEventListener("click", () => setQuote(qi + 1));
  if (arrows[1]) arrows[1].addEventListener("click", () => setQuote(qi - 1));
  testiDots.forEach((d, k) => d.addEventListener("click", () => setQuote(k)));

  /* ---------- Hero slider dots (visual demo) ---------- */
  const heroDots = $$(".hero__slider .dot");
  let hd = 0;
  if (heroDots.length && !reduce) {
    setInterval(() => {
      hd = (hd + 1) % heroDots.length;
      heroDots.forEach((d, k) => d.classList.toggle("is-active", k === hd));
    }, 3200);
  }

  /* ---------- Subscribe feedback ---------- */
  const subBtn = $(".subscribe__btn");
  const subInput = $(".subscribe__input input");
  if (subBtn && subInput) {
    subBtn.addEventListener("click", () => {
      if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(subInput.value.trim())) {
        subInput.value = "";
        subInput.placeholder = "Thank you — check your inbox ✦";
      } else {
        subInput.placeholder = "Please enter a valid email";
        subInput.focus();
      }
    });
  }

  /* ---------- Product cards → detail page ---------- */
  $$(".product-lg, .product-sm, .shop-card").forEach((card) => {
    card.classList.add("is-linked");
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    const go = () => { window.location.href = "detail.html"; };
    card.addEventListener("click", go);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
    });
  });
})();
