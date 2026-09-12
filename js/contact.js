/* ============================================================
   VELVETY — Contact form (AJAX submit via FormSubmit → email)
   ============================================================ */
(function () {
  "use strict";
  const form = document.getElementById("contactForm");
  if (!form) return;
  const status = document.getElementById("contactStatus");
  const btn = form.querySelector(".contact__send");
  const API = "/api/contact"; // Vercel function → branded Resend email
  const FALLBACK = "https://formsubmit.co/ajax/hajaraswad210299@gmail.com";

  const toObject = (fd) => { const o = {}; fd.forEach((v, k) => (o[k] = v)); return o; };

  const setStatus = (msg, type) => {
    if (!status) return;
    status.textContent = msg;
    status.classList.remove("is-ok", "is-err");
    if (type) status.classList.add(type);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (typeof form.reportValidity === "function" && !form.reportValidity()) return;

    const label = btn ? btn.textContent : "";
    if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
    setStatus("", null);

    const payload = toObject(new FormData(form));

    const sendVia = async (url, isApi) => {
      const res = await fetch(url, {
        method: "POST",
        headers: isApi
          ? { "Content-Type": "application/json", Accept: "application/json" }
          : { Accept: "application/json" },
        body: isApi
          ? JSON.stringify(payload)
          : (() => { const d = new FormData(form); d.set("_template", "box"); d.set("_subject", "New message from VELVETY Contact Us"); d.set("_captcha", "false"); return d; })(),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !(json.success === true || json.success === "true")) throw new Error(json.message || "Request failed");
    };

    try {
      try {
        await sendVia(API, true); // branded email via Vercel + Resend
      } catch (apiErr) {
        await sendVia(FALLBACK, false); // fallback to FormSubmit if API unavailable
      }
      form.reset();
      setStatus("Message sent — redirecting…", "is-ok");
      window.location.href = "message-sent.html";
    } catch (err) {
      setStatus("Sorry, something went wrong. Please email us directly at hajaraswad210299@gmail.com.", "is-err");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = label; }
    }
  });
})();

/* ============================================================
   Custom styled dropdown — wraps native <select> (kept for
   form submit + validation) with a VELVETY-themed UI.
   ============================================================ */
(function () {
  "use strict";
  const selects = document.querySelectorAll(".contact .field select");
  selects.forEach((sel) => {
    const field = sel.closest(".field");
    if (!field || field.classList.contains("has-selectui")) return;
    field.classList.add("has-selectui");

    const opts = [...sel.options];
    const placeholder = opts.find((o) => o.disabled) || opts[0];

    const ui = document.createElement("div");
    ui.className = "select-ui";
    ui.innerHTML =
      '<button type="button" class="select-ui__trigger" aria-haspopup="listbox" aria-expanded="false">' +
      '<span class="select-ui__value"></span>' +
      '<svg class="select-ui__caret" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>' +
      "</button>" +
      '<ul class="select-ui__menu" role="listbox" tabindex="-1"></ul>';
    const trigger = ui.querySelector(".select-ui__trigger");
    const valueEl = ui.querySelector(".select-ui__value");
    const menu = ui.querySelector(".select-ui__menu");

    opts.forEach((o) => {
      if (o.disabled) return;
      const li = document.createElement("li");
      li.className = "select-ui__opt";
      li.setAttribute("role", "option");
      li.dataset.value = o.value || o.textContent;
      li.textContent = o.textContent;
      menu.appendChild(li);
    });
    const items = [...menu.children];

    const render = () => {
      const val = sel.value;
      const chosen = val ? opts.find((o) => (o.value || o.textContent) === val) : null;
      valueEl.textContent = chosen ? chosen.textContent : placeholder.textContent;
      valueEl.classList.toggle("is-placeholder", !chosen);
      items.forEach((li) => {
        const on = li.dataset.value === val;
        li.classList.toggle("is-selected", on);
        li.setAttribute("aria-selected", on ? "true" : "false");
      });
    };

    let activeIdx = -1;
    const setActive = (i) => {
      activeIdx = Math.max(0, Math.min(items.length - 1, i));
      items.forEach((li, n) => li.classList.toggle("is-active", n === activeIdx));
      items[activeIdx].scrollIntoView({ block: "nearest" });
    };
    const open = () => {
      ui.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      const cur = items.findIndex((li) => li.dataset.value === sel.value);
      setActive(cur >= 0 ? cur : 0);
    };
    const close = () => {
      ui.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      items.forEach((li) => li.classList.remove("is-active"));
    };
    const toggle = () => (ui.classList.contains("is-open") ? close() : open());
    const choose = (li) => {
      sel.value = li.dataset.value;
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      render();
      close();
      trigger.focus();
    };

    trigger.addEventListener("click", (e) => { e.stopPropagation(); toggle(); });
    items.forEach((li, i) => {
      li.addEventListener("click", (e) => { e.stopPropagation(); choose(li); });
      li.addEventListener("mousemove", () => setActive(i));
    });
    trigger.addEventListener("keydown", (e) => {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        if (!ui.classList.contains("is-open")) return open();
      }
      if (e.key === "ArrowDown") setActive(activeIdx + 1);
      else if (e.key === "ArrowUp") setActive(activeIdx - 1);
      else if (e.key === "Enter" || e.key === " ") { if (ui.classList.contains("is-open")) choose(items[activeIdx]); }
      else if (e.key === "Escape") close();
    });
    document.addEventListener("click", (e) => { if (!ui.contains(e.target)) close(); });

    sel.parentNode.insertBefore(ui, sel);
    render();
  });
})();
