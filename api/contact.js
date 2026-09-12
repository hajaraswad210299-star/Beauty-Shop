/* ============================================================
   VELVETY — Contact form handler (Vercel Serverless Function)
   Sends a branded HTML email via Resend.
   Requires env var: RESEND_API_KEY  (set in Vercel → Settings → Environment Variables)
   ============================================================ */

const TO = "hajaraswad210299@gmail.com";
const FROM = "VELVETY Contact <onboarding@resend.dev>";

const esc = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");

function buildHtml(d) {
  const fullName = [d["First Name"], d["Last Name"]].filter(Boolean).join(" ") || "—";
  const rows = [
    ["Name", fullName],
    ["Email", d["Email"]],
    ["Reason", d["Reason"]],
    ["Phone", d["Phone"]],
  ]
    .filter(([, v]) => v)
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #E4EADF;font-size:12px;letter-spacing:.6px;text-transform:uppercase;color:#7C8A76;width:120px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;">${esc(k)}</td>
        <td style="padding:12px 0;border-bottom:1px solid #E4EADF;font-size:15px;color:#213721;font-family:Arial,Helvetica,sans-serif;">${esc(v)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#EDF2E9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDF2E9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#F7FAF4;border-radius:16px;overflow:hidden;box-shadow:0 20px 48px -24px rgba(16,28,16,.35);">

        <!-- Header -->
        <tr><td style="background:#213721;padding:40px 40px 34px;text-align:center;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:34px;letter-spacing:6px;color:#F2F6EF;font-weight:400;">VELVETY</div>
          <div style="font-family:Georgia,serif;font-style:italic;font-size:14px;letter-spacing:1px;color:#AFC2A5;margin-top:6px;">Facial &amp; skincare</div>
        </td></tr>

        <!-- Eyebrow -->
        <tr><td style="padding:36px 40px 0;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#8AA07E;">New submission</div>
          <div style="font-family:Georgia,serif;font-size:26px;color:#213721;margin-top:8px;line-height:1.25;">You've got a new message<br>from your Contact page</div>
        </td></tr>

        <!-- Details -->
        <tr><td style="padding:24px 40px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>

        <!-- Message -->
        <tr><td style="padding:20px 40px 8px;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.6px;text-transform:uppercase;color:#7C8A76;margin-bottom:10px;">Message</div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3A4A37;background:#EDF2E9;border-left:4px solid #213721;border-radius:0 10px 10px 0;padding:18px 20px;">${esc(d["Message"]) || "—"}</div>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:24px 40px 40px;">
          <a href="mailto:${esc(d["Email"])}" style="display:inline-block;background:#213721;color:#F2F6EF;font-family:Arial,Helvetica,sans-serif;font-size:14px;text-decoration:none;padding:14px 28px;border-radius:40px;">Reply to ${esc(d["First Name"]) || "sender"}</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#213721;padding:22px 40px;text-align:center;">
          <div style="font-family:Georgia,serif;font-style:italic;font-size:13px;color:#AFC2A5;">© Designed with curiosity · Crafted with intention.</div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ success: false, message: "Email service not configured" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  // Honeypot
  if (body["_honey"]) return res.status(200).json({ success: true });

  if (!body["First Name"] || !body["Email"] || !body["Message"]) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: body["Email"],
        subject: `✨ New message from ${[body["First Name"], body["Last Name"]].filter(Boolean).join(" ")}`,
        html: buildHtml(body),
      }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return res.status(502).json({ success: false, message: "Email send failed", detail });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};
