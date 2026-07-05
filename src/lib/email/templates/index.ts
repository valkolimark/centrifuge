/* Email templates (UI-2 §3) — Liquid + inline-CSS HTML with a plain-text twin each.
 * Exported as strings so they bundle cleanly into serverless functions. Render via
 * ../render then send via ../twilio. Keep every referenced variable supplied at call site. */
import type { EmailTemplate } from '../render'

// Shared branded shell. `{{ body }}` is pre-rendered inner HTML injected via Liquid raw.
const BAND = '#12356E,#1B4FA0 55%,#2A6AD1'
const shell = (inner: string) => `<!doctype html><html><body style="margin:0;background:#EEF3F6;font-family:-apple-system,Segoe UI,Inter,Arial,sans-serif;color:#152238">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF3F6;padding:24px 0"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 6px 24px rgba(7,37,70,.10)">
      <tr><td style="background:linear-gradient(90deg,${BAND});padding:18px 28px">
        <span style="font-family:'Rajdhani',Arial,sans-serif;font-weight:700;font-size:20px;letter-spacing:.04em;color:#fff">CENTRIFUGE <span style="color:#9FD0FF">WORLD</span></span>
        <span style="display:block;font-size:10px;letter-spacing:.18em;color:#BFD8F5;text-transform:uppercase;margin-top:2px">Est. 1939 · Industrial Centrifuge Repair & Rebuild</span>
      </td></tr>
      <tr><td style="padding:28px">${inner}</td></tr>
      <tr><td style="background:#F2F6FC;padding:14px 28px;font-size:11px;color:#5E6C85">
        centrifuge.com · Rosharon TX · Franklin Park IL · Alsip IL · 24/7 emergency {{ emergencyDisplay }}
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#00719C;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 22px;border-radius:4px">${label}</a>`

// ── form-lead-internal — internal alert to all four recipients ────────────────
export const formLeadInternal: EmailTemplate = {
  html: shell(`
    <div style="margin-bottom:6px">
      {% if isEmergency %}<span style="display:inline-block;background:#E11900;color:#fff;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:3px 10px;border-radius:5px">Emergency</span>
      {% else %}<span style="display:inline-block;background:#E6F0F7;color:#00719C;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:3px 10px;border-radius:5px">{{ formTypeLabel }}</span>{% endif %}
    </div>
    <h1 style="font-size:20px;margin:6px 0 2px">{{ name | default: 'New lead' }}</h1>
    <div style="color:#5E6C85;font-size:14px;margin-bottom:16px">{{ company }}{% if receivedAt %} · {{ receivedAt }}{% endif %}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:13px;border-collapse:collapse">
      {% for f in fields %}<tr>
        <td style="padding:7px 0;color:#5E6C85;width:150px;vertical-align:top;border-bottom:1px solid #EDF1F6">{{ f.label }}</td>
        <td style="padding:7px 0;color:#152238;border-bottom:1px solid #EDF1F6">{{ f.value }}</td>
      </tr>{% endfor %}
    </table>
    {% if message %}<div style="margin:16px 0;padding:12px 14px;background:#F5F8FB;border-left:3px solid #00719C;border-radius:0 6px 6px 0;font-size:13.5px;line-height:1.6;color:#2A3646">{{ message }}</div>{% endif %}
    <div style="margin-top:22px">${btn('{{ leadUrl }}', 'Open in Mission Control ▸')}</div>
    <p style="font-size:12px;color:#8A98AC;margin-top:18px">Reply directly to this email to respond to {{ name | default: 'the submitter' }}.</p>
  `),
  text: `{% if isEmergency %}[EMERGENCY] {% endif %}{{ formTypeLabel }} — {{ name }}{% if company %} ({{ company }}){% endif %}
{% if receivedAt %}Received: {{ receivedAt }}
{% endif %}
{% for f in fields %}{{ f.label }}: {{ f.value }}
{% endfor %}{% if message %}
Message:
{{ message }}
{% endif %}
Open in Mission Control: {{ leadUrl }}
Reply to this email to respond directly to the submitter.`,
}

// ── form-lead-ack — auto-acknowledgement to the submitter ─────────────────────
export const formLeadAck: EmailTemplate = {
  html: shell(`
    <h1 style="font-size:20px;margin:0 0 10px">Thanks{% if name %}, {{ name }}{% endif %} — we've got your request.</h1>
    <p style="font-size:14px;line-height:1.65;color:#2A3646;margin:0 0 14px">A member of our team will follow up shortly. If this is a breakdown that can't wait, call our 24/7 emergency line and we'll get a technician moving.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:13.5px;margin:8px 0 18px">
      <tr><td style="padding:5px 0;color:#5E6C85;width:150px">Office hours</td><td style="padding:5px 0;color:#152238">{{ hoursDisplay }}</td></tr>
      <tr><td style="padding:5px 0;color:#5E6C85">On-call</td><td style="padding:5px 0;color:#152238">{{ oncallDisplay }}</td></tr>
      <tr><td style="padding:5px 0;color:#5E6C85">Phone</td><td style="padding:5px 0;color:#152238">{{ phoneDisplay }}</td></tr>
      <tr><td style="padding:5px 0;color:#5E6C85">24/7 emergency</td><td style="padding:5px 0;color:#E11900;font-weight:600">{{ emergencyDisplay }}</td></tr>
    </table>
    <p style="font-size:12px;color:#8A98AC;margin:0">Centrifuge World — repair, rebuilds, balancing, parts, and field service for 45+ OEM brands.</p>
  `),
  text: `Thanks{% if name %}, {{ name }}{% endif %} — we've got your request.

A member of our team will follow up shortly. For a breakdown that can't wait, call our 24/7 emergency line.

Office hours: {{ hoursDisplay }}
On-call: {{ oncallDisplay }}
Phone: {{ phoneDisplay }}
24/7 emergency: {{ emergencyDisplay }}

Centrifuge World — repair, rebuilds, balancing, parts, and field service for 45+ OEM brands.`,
}

// ── quote-delivery — branded quote email to the client (CC team) ──────────────
export const quoteDelivery: EmailTemplate = {
  html: shell(`
    <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#1B4FA0;font-weight:700">Quotation {{ quoteNumber }}</div>
    <h1 style="font-size:20px;margin:6px 0 4px">{{ scopeTitle }}</h1>
    <div style="color:#5E6C85;font-size:14px;margin-bottom:18px">Prepared for {{ clientName }}{% if clientCompany %} · {{ clientCompany }}{% endif %}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin-bottom:18px">
      <tr><td style="padding:8px 0;color:#5E6C85;border-bottom:1px solid #EDF1F6">Total</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#1B4FA0;border-bottom:1px solid #EDF1F6">{{ total }}</td></tr>
      <tr><td style="padding:8px 0;color:#5E6C85;border-bottom:1px solid #EDF1F6">Valid until</td><td style="padding:8px 0;text-align:right;border-bottom:1px solid #EDF1F6">{{ validUntil }}</td></tr>
      <tr><td style="padding:8px 0;color:#5E6C85">Issued from</td><td style="padding:8px 0;text-align:right">Rosharon, TX</td></tr>
    </table>
    <div style="margin:6px 0 16px">${btn('{{ viewUrl }}', 'View Quote ▸')}</div>
    <p style="font-size:13px;color:#2A3646;line-height:1.6;margin:0">{% if hasPdf %}Your quote PDF is attached, and you can also view it online at the link above.{% else %}View your full quote at the link above.{% endif %} Questions? Reply to this email and it reaches your account rep directly.</p>
  `),
  text: `Quotation {{ quoteNumber }} — {{ scopeTitle }}
Prepared for {{ clientName }}{% if clientCompany %} · {{ clientCompany }}{% endif %}

Total: {{ total }}
Valid until: {{ validUntil }}
Issued from Rosharon, TX

View your quote: {{ viewUrl }}
{% if hasPdf %}(A PDF copy is attached.){% endif %}
Reply to this email with any questions — it reaches your account rep directly.`,
}

// ── quote-reminder — follow-up before expiry (manual trigger v1) ──────────────
export const quoteReminder: EmailTemplate = {
  html: shell(`
    <h1 style="font-size:20px;margin:0 0 8px">A quick follow-up on quote {{ quoteNumber }}</h1>
    <p style="font-size:14px;line-height:1.65;color:#2A3646;margin:0 0 14px">Hi {{ clientName }}, your quote for <b>{{ scopeTitle }}</b> ({{ total }}) is valid through <b>{{ validUntil }}</b>{% if daysLeft %} — {{ daysLeft }} day{% if daysLeft != 1 %}s{% endif %} left{% endif %}. We're glad to answer questions or adjust scope.</p>
    <div style="margin:6px 0 16px">${btn('{{ viewUrl }}', 'View Quote ▸')}</div>
    <p style="font-size:12px;color:#8A98AC;margin:0">Reply to this email to reach your account rep directly.</p>
  `),
  text: `Following up on quote {{ quoteNumber }} — {{ scopeTitle }} ({{ total }}).
Valid through {{ validUntil }}{% if daysLeft %} — {{ daysLeft }} day{% if daysLeft != 1 %}s{% endif %} left{% endif %}.

View your quote: {{ viewUrl }}
Reply to this email to reach your account rep directly.`,
}

export const TEMPLATES = {
  'form-lead-internal': formLeadInternal,
  'form-lead-ack': formLeadAck,
  'quote-delivery': quoteDelivery,
  'quote-reminder': quoteReminder,
} as const

export type TemplateName = keyof typeof TEMPLATES
