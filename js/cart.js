/* ============================================================
   VELVETY — Cart page (after script.js + ui.js)
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const KEY = "velvety_cart";
  const SHIPPING = 10, TAX = 5;

  const trash = '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const mark = '<svg viewBox="0 0 24 24"><path d="M6 4h12v16l-6-4-6 4V4z" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const bag = '<svg viewBox="0 0 24 24"><path d="M6 8h12l-1 12H7L6 8z" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 8V6a3 3 0 0 1 6 0v2" stroke-linecap="round"/></svg>';

  // Seed a default cart (matching the design) only on the very first visit.
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) {}
  let cart;
  if (raw === null) {
    cart = [
      { name: "HARMONY", cat: "Protect", old: 32, price: 25, img: "assets/img/bottle_chicori.png", qty: 1 },
      { name: "LUXE", cat: "Regenerates", price: 22, img: "assets/img/bottle_notorious.png", qty: 1 },
      { name: "OPULENT", cat: "Revitalizes", price: 17.5, img: "assets/img/bottle_holocena.png", qty: 1 },
    ];
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {}
  } else {
    try { cart = JSON.parse(raw) || []; } catch (e) { cart = []; }
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  const money = (n) => "$" + (Number.isInteger(n) ? n : (+n).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1"));
  const money2 = (n) => "$" + (+n).toFixed(2);

  const listEl = $("#cartList");
  const titleCount = $("#cartTitleCount");
  const sumItems = $("#sumItems");

  function syncNav() {
    const n = cart.reduce((s, i) => s + i.qty, 0);
    $$(".nav__link").forEach((a) => { if (/CART/i.test(a.textContent)) a.textContent = "CART (" + n + ")"; });
  }

  function render() {
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    if (titleCount) titleCount.textContent = "(" + totalQty + ")";
    syncNav();

    if (!cart.length) {
      listEl.innerHTML = '<div class="cartempty"><div class="cartempty__bag">' + bag + "</div>" +
        "<p>There are no items in your bag.</p><a href=\"shop.html\">Shop now</a></div>";
      if (sumItems) sumItems.innerHTML = "";
      ["#sumShipping", "#sumBeforeTax", "#sumTax", "#sumTotal"].forEach((s) => { const e = $(s); if (e) e.textContent = "-"; });
      const co0 = $(".ordersum__checkout"); if (co0) co0.classList.add("is-disabled");
      return;
    }
    const co1 = $(".ordersum__checkout"); if (co1) co1.classList.remove("is-disabled");

    listEl.innerHTML = cart.map((it, i) =>
      '<div class="cartrow" data-i="' + i + '">' +
      '<div class="cartrow__img"><img src="' + it.img + '" alt="' + it.name + '"></div>' +
      '<div class="cartrow__main"><div class="cartrow__top">' +
      '<div class="cartrow__name"><h3>' + it.name + "</h3><p>" + (it.cat || "") + "</p></div>" +
      '<div class="cartrow__price">' + (it.old ? '<span class="old">' + money(it.old) + "</span>" : "") +
      '<span class="now">' + money(it.price) + "</span></div></div>" +
      '<div class="cartrow__bottom"><div class="cartrow__acts">' +
      '<button class="cr-del" aria-label="Remove">' + trash + "</button>" +
      '<button class="cr-save" aria-label="Save">' + mark + "</button></div>" +
      '<div class="cartrow__step"><button class="cr-minus" aria-label="Decrease">&minus;</button>' +
      '<span class="q">' + it.qty + '</span><button class="cr-plus" aria-label="Increase">+</button></div>' +
      "</div></div></div>"
    ).join("");

    $$(".cartrow", listEl).forEach((row) => {
      const i = +row.dataset.i;
      $(".cr-plus", row).addEventListener("click", () => { cart[i].qty++; save(); render(); });
      $(".cr-minus", row).addEventListener("click", () => { cart[i].qty--; if (cart[i].qty < 1) cart.splice(i, 1); save(); render(); });
      $(".cr-del", row).addEventListener("click", () => { cart.splice(i, 1); save(); render(); });
      $(".cr-save", row).addEventListener("click", (e) => e.currentTarget.classList.toggle("is-active"));
    });

    // order summary line items
    sumItems.innerHTML = cart.map((it) =>
      '<div class="ordersum__row"><span class="lbl">' + it.name + '</span><b>' + money2(it.price * it.qty) + "</b></div>"
    ).join("");
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const beforeTax = subtotal + SHIPPING;
    $("#sumShipping").textContent = money2(SHIPPING);
    $("#sumTax").textContent = money2(TAX);
    $("#sumBeforeTax").textContent = money2(beforeTax);
    $("#sumTotal").textContent = money2(beforeTax + TAX);
  }
  render();

  /* checkout → checkout page */
  const co = $(".ordersum__checkout");
  if (co) co.addEventListener("click", () => { if (cart.length) window.location.href = "checkout.html"; });
  const pp = $(".ordersum__paypal");
  if (pp) pp.addEventListener("click", () => { if (cart.length) window.location.href = "checkout-paypal.html"; });

  /* related carousel */
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
