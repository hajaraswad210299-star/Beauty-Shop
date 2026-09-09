/* ============================================================
   VELVETY — Checkout / Checkout PayPal / Confirmation shared logic
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const KEY = "velvety_cart";
  const SHIPPING = 10, TAX = 5;

  let raw = null; try { raw = localStorage.getItem(KEY); } catch (e) {}
  let cart;
  if (raw === null) {
    cart = [
      { name: "HARMONY", cat: "Protect", old: 32, price: 25, img: "assets/img/bottle_chicori.png", qty: 1 },
      { name: "LUXE", cat: "Regenerates", price: 22, img: "assets/img/bottle_notorious.png", qty: 1 },
      { name: "OPULENT", cat: "Revitalizes", price: 17.5, img: "assets/img/bottle_holocena.png", qty: 1 },
    ];
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {}
  } else { try { cart = JSON.parse(raw) || []; } catch (e) { cart = []; } }

  const money2 = (n) => "$" + (+n).toFixed(2);
  const money = (n) => "$" + (Number.isInteger(n) ? n : (+n).toFixed(2).replace(/0$/, ""));

  /* nav count */
  const nq = cart.reduce((s, i) => s + i.qty, 0);
  $$(".nav__link").forEach((a) => { if (/CART/i.test(a.textContent)) a.textContent = "CART (" + nq + ")"; });

  /* order summary */
  const sumItems = $("#sumItems");
  if (sumItems) {
    sumItems.innerHTML = cart.map((it) =>
      '<div class="ordersum__row"><span class="lbl">' + it.name + '</span><b>' + money2(it.price * it.qty) + "</b></div>"
    ).join("");
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const beforeTax = subtotal + SHIPPING;
    const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
    set("#sumShipping", money2(SHIPPING));
    set("#sumTax", money2(TAX));
    set("#sumBeforeTax", money2(beforeTax));
    set("#sumTotal", money2(beforeTax + TAX));
  }

  /* items in order */
  const coItems = $("#coItems");
  if (coItems) {
    coItems.innerHTML = cart.map((it) =>
      '<div class="co-item"><div class="co-item__img"><img src="' + it.img + '" alt="' + it.name + '"></div>' +
      '<div class="co-item__info"><h4>' + it.name + "</h4><p>" + (it.cat || "") + "</p><p>Quantity: " + it.qty + "</p></div>" +
      '<div class="co-item__price">' + money(it.price) + "</div></div>"
    ).join("");
  }

  /* shipping method radios */
  $$(".ship-opt").forEach((opt) => opt.addEventListener("click", () => {
    $$(".ship-opt").forEach((o) => o.classList.remove("is-active"));
    opt.classList.add("is-active");
  }));

  /* pay buttons feedback */
  $$(".co__express, .ordersum__checkout").forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-disabled")) return;
      const t = btn.innerHTML;
      btn.innerHTML = "Processing…";
      setTimeout(() => { window.location.href = "confirmation.html"; }, 900);
      setTimeout(() => { btn.innerHTML = t; }, 3000);
    });
  });
})();
