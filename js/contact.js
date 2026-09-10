/* ============================================================
   VELVETY — Contact form (AJAX submit via FormSubmit → email)
   ============================================================ */
(function () {
  "use strict";
  const form = document.getElementById("contactForm");
  if (!form) return;
  const status = document.getElementById("contactStatus");
  const btn = form.querySelector(".contact__send");
  const ENDPOINT = "https://formsubmit.co/ajax/hajaraswad210299@gmail.com";

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

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json.success === true || json.success === "true")) {
        form.reset();
        setStatus("Thank you! Your message has been sent — we’ll get back to you within 24 hours.", "is-ok");
      } else {
        throw new Error(json.message || "Request failed");
      }
    } catch (err) {
      setStatus("Sorry, something went wrong. Please email us directly at hajaraswad210299@gmail.com.", "is-err");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = label; }
    }
  });
})();
