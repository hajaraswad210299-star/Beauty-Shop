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
