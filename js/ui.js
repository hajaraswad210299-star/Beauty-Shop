/* ============================================================
   VELVETY — PAGES dropdown + Cart drawer (shared across all pages)
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const path = location.pathname.split("/").pop() || "index.html";

  /* ---------- PAGES dropdown ---------- */
  const pagesBtn = $(".nav__pages");
  const navLeft = $(".nav__left");
  if (pagesBtn && navLeft) {
    const col1 = [
      ["Home", "index.html"], ["About", "about.html"], ["Shop", "shop.html"],
      ["Product Details", "detail.html"], ["Checkout", "#"], ["Checkout Paypal", "#"],
      ["Blog", "#"], ["Blog Detail", "#"],
    ];
    const col2 = [
      ["Order Confirmation", "#"], ["Licenses", "#"], ["Changelog", "#"],
      ["Contact Us", "#"], ["404", "#"], ["401", "#"], ["Styleguide", "#"],
    ];
    const mkCol = (items) => {
      const col = document.createElement("div");
      col.className = "pages-col";
      items.forEach(([label, href]) => {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = label;
        if (href === path) a.classList.add("is-active");
        col.appendChild(a);
      });
      return col;
    };
    const menu = document.createElement("div");
    menu.className = "pages-menu";
    menu.append(mkCol(col1), mkCol(col2));
    navLeft.appendChild(menu);

    pagesBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navLeft.classList.toggle("open");
    });
    menu.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", () => navLeft.classList.remove("open"));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") navLeft.classList.remove("open"); });
  }

  /* ---------- Icons ---------- */
  const ic = {
    close: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    mark: '<svg viewBox="0 0 24 24"><path d="M6 4h12v16l-6-4-6 4V4z" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M6 8h12l-1 12H7L6 8z" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 8V6a3 3 0 0 1 6 0v2" stroke-linecap="round"/></svg>',
  };

  const recProducts = [
    { name: "OPULENT", old: 23, price: 19, img: "assets/img/bottle_holocena.png" },
    { name: "GRACE", price: 13, img: "assets/img/bottle_inamorata.png" },
    { name: "VELVET", old: 30, price: 23, img: "assets/img/bottle_notorious.png" },
    { name: "IRIDESCENT", price: 25.9, img: "assets/img/hero_bottle.png" },
    { name: "SILKEN", price: 17.5, img: "assets/img/bottle_lightcool.png" },
  ];

  /* ---------- Cart state ---------- */
  const KEY = "velvety_cart";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  let cart = load();

  const money = (n) => "$" + (Number.isInteger(n) ? n : (+n).toFixed(1).replace(/\.0$/, ""));
  const totalQty = () => cart.reduce((s, i) => s + i.qty, 0);

  /* ---------- Build drawer ---------- */
  const overlay = document.createElement("div");
  overlay.className = "cart-overlay";
  const drawer = document.createElement("aside");
  drawer.className = "cart-drawer";
  drawer.setAttribute("aria-label", "Shopping cart");
  drawer.innerHTML =
    '<div class="cart-head"><h2>Cart&nbsp;<span class="cart-count">(0)</span></h2>' +
    '<button class="cart-close" aria-label="Close">' + ic.close + "</button></div>" +
    '<div class="cart-body"></div>';
  document.body.append(overlay, drawer);
  const body = $(".cart-body", drawer);
  const countEl = $(".cart-count", drawer);

  function renderNav() {
    const n = totalQty();
    $$(".nav__link").forEach((a) => {
      if (/CART/i.test(a.textContent)) a.textContent = "CART (" + n + ")";
    });
    if (countEl) countEl.textContent = "(" + n + ")";
  }

  function render() {
    renderNav();
    if (!cart.length) {
      body.innerHTML =
        '<div class="cart-empty"><div class="cart-empty__bag">' + ic.bag + "</div>" +
        "<p>There are no items in your bag.</p>" +
        '<a href="shop.html" class="cart-empty__shop">Shop now</a></div>' +
        '<div class="cart-rec"><div class="cart-rec__head"><h3>Recommended for you</h3>' +
        '<div class="cart-rec__nav"><button class="rprev" aria-label="prev"><img src="assets/svg/arrow_right.svg" alt=""></button>' +
        '<button class="rnext" aria-label="next"><img src="assets/svg/arrow_right.svg" alt=""></button></div></div>' +
        '<div class="cart-rec__track">' +
        recProducts.map((p) =>
          '<a class="cart-rec__card" href="detail.html"><div class="ph"><img src="' + p.img + '" alt="' + p.name + '"></div>' +
          "<h4>" + p.name + '</h4><div class="p">' +
          (p.old ? '<span class="old">' + money(p.old) + "</span>" : "") +
          '<span class="now">' + money(p.price) + "</span></div></a>"
        ).join("") +
        "</div></div>";
      const track = $(".cart-rec__track", body);
      $(".rprev", body).addEventListener("click", () => track.scrollBy({ left: -166, behavior: "smooth" }));
      $(".rnext", body).addEventListener("click", () => track.scrollBy({ left: 166, behavior: "smooth" }));
      return;
    }

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    body.innerHTML =
      '<div class="cart-items">' +
      cart.map((it, idx) =>
        '<div class="cart-item" data-i="' + idx + '">' +
        '<div class="cart-item__img"><img src="' + it.img + '" alt="' + it.name + '"></div>' +
        '<div class="cart-item__main"><div class="cart-item__top">' +
        '<div class="cart-item__name"><h3>' + it.name + "</h3><p>" + (it.cat || "") + "</p></div>" +
        '<div class="cart-item__price">' + (it.old ? '<span class="old">' + money(it.old) + "</span>" : "") +
        '<span class="now">' + money(it.price) + "</span></div></div>" +
        '<div class="cart-item__bottom"><div class="cart-item__acts">' +
        '<button class="ci-del" aria-label="Remove">' + ic.trash + "</button>" +
        '<button class="ci-save" aria-label="Save">' + ic.mark + "</button></div>" +
        '<div class="cart-step"><button class="ci-minus" aria-label="Decrease">&minus;</button>' +
        '<span class="q">' + it.qty + '</span><button class="ci-plus" aria-label="Increase">+</button></div>' +
        "</div></div></div>"
      ).join("") +
      "</div>" +
      '<div class="cart-foot"><div class="cart-subtotal"><span>Subtotal</span><b>' + money(subtotal) + "</b></div>" +
      '<button class="cart-checkout">Checkout now</button>' +
      '<a href="cart.html" class="cart-viewcart">View cart</a></div>';

    $$(".cart-item", body).forEach((row) => {
      const i = +row.dataset.i;
      $(".ci-plus", row).addEventListener("click", () => { cart[i].qty++; save(); render(); });
      $(".ci-minus", row).addEventListener("click", () => { cart[i].qty--; if (cart[i].qty < 1) cart.splice(i, 1); save(); render(); });
      $(".ci-del", row).addEventListener("click", () => { cart.splice(i, 1); save(); render(); });
      $(".ci-save", row).addEventListener("click", (e) => e.currentTarget.classList.toggle("is-active"));
    });
    const co = $(".cart-checkout", body);
    if (co) co.addEventListener("click", () => { co.textContent = "Order placed ✓"; setTimeout(() => (co.textContent = "Checkout now"), 1600); });
  }

  function openCart() { render(); overlay.classList.add("open"); drawer.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeCart() { overlay.classList.remove("open"); drawer.classList.remove("open"); document.body.style.overflow = ""; }
  $(".cart-close", drawer).addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

  /* open from nav CART link */
  $$(".nav__link").forEach((a) => {
    if (/CART/i.test(a.textContent)) a.addEventListener("click", (e) => { e.preventDefault(); openCart(); });
  });

  /* Add to cart on product detail page */
  const addBtn = $(".btn-cart");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const name = (($(".pd__title") || {}).textContent || "Product").trim();
      const price = parseFloat((($(".pd__price") || {}).textContent || "$0").replace(/[^0-9.]/g, "")) || 0;
      const cat = (($(".pd__meta span") || {}).textContent || "").trim();
      const mainImg = $("#pdMain");
      const img = mainImg ? mainImg.getAttribute("src") : "assets/img/bottle_chicori.png";
      const qty = parseInt((($("#qty") || {}).textContent || "1"), 10) || 1;
      const existing = cart.find((i) => i.name === name);
      if (existing) existing.qty += qty; else cart.push({ name, cat, price, img, qty });
      save();
      openCart();
    });
  }

  renderNav();
})();
