/* Email templates (UI-2 §3) — Liquid + inline-CSS HTML with a plain-text twin each.
 * Exported as strings so they bundle cleanly into serverless functions. Render via
 * ../render then send via ../twilio. Keep every referenced variable supplied at call site. */
import type { EmailTemplate } from '../render'

// Shared branded shell. `{{ body }}` is pre-rendered inner HTML injected via Liquid raw.
const shell = (inner: string) => `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#EEF3F6;font-family:-apple-system,Segoe UI,Inter,Arial,sans-serif;color:#152238">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF3F6;padding:24px 0"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#fff;border:1px solid #C2D0D8;border-radius:6px;overflow:hidden">
      <tr><td style="background:#00415A;padding:18px 28px">
        <span style="font-family:Archivo,Arial,sans-serif;font-weight:700;font-size:18px;letter-spacing:.06em;color:#fff">CENTRIFUGE <span style="color:#00B8FF">WORLD</span></span>
        <span style="display:block;font-size:10px;letter-spacing:.18em;color:#C2D0D8;text-transform:uppercase;margin-top:2px">Est. 1939 · Industrial Centrifuge Repair & Rebuild</span>
      </td></tr>
      <tr><td style="padding:28px">${inner}</td></tr>
      <tr><td style="background:#EEF3F6;padding:14px 28px;font-size:11px;color:#5C7078">
        centrifuge.com · Rosharon TX · Franklin Park IL · Alsip IL · 24/7 emergency {{ emergencyDisplay }}
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#00719C;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 22px;border-radius:4px">${label}</a>`

// ── form-lead-internal — internal alert to all four recipients ────────────────
// Own layout (not shell): reading order follows the next action — who, call/email, what they
// need, their words, their files, contact. Data comes pre-shaped from lib/email/lead-view.
// Every customer-supplied value is `| escape`d in HTML (Liquid does not auto-escape).
const C = { navy: '#00415A', deep: '#001F2B', blue: '#00719C', bright: '#00B8FF', s100: '#EEF3F6', s300: '#C2D0D8', s500: '#5C7078', s700: '#16303B', red: '#E11900' }
const sectionLabel = (t: string) =>
  `<div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${C.s500};margin:0 0 10px">${t}</div>`
const section = (inner: string) => `<tr><td class="px" style="padding:22px 28px;border-top:1px solid ${C.s100}">${inner}</td></tr>`
const actionBtn = (href: string, label: string, bg: string, fg: string, border: string) =>
  `<a href="${href}" style="display:inline-block;background:${bg};color:${fg};border:2px solid ${border};text-decoration:none;font-weight:700;font-size:15px;padding:11px 20px;border-radius:4px;margin:0 8px 8px 0">${label}</a>`
const labelCell = `padding:8px 12px 8px 0;font-size:13px;color:${C.s500};width:140px;vertical-align:top`

export const formLeadInternal: EmailTemplate = {
  html: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>@media (max-width:480px){.px{padding-left:18px!important;padding-right:18px!important}.card{width:100%!important}}</style></head>
<body style="margin:0;background:${C.s100};font-family:Inter,-apple-system,'Segoe UI',Arial,sans-serif;color:${C.s700}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.s100};padding:20px 0"><tr><td align="center" style="padding:0 8px">
<table role="presentation" class="card" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#FFFFFF;border:1px solid ${C.s300};border-radius:6px;overflow:hidden">
  {% if isEmergency %}<tr><td style="background:${C.red};padding:12px 28px;color:#FFFFFF;font-size:14px;font-weight:700;letter-spacing:.02em">EMERGENCY — equipment down. Call back now.</td></tr>{% endif %}
  <tr><td style="background:${C.navy};padding:16px 28px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-family:Archivo,Arial,sans-serif;font-weight:700;font-size:17px;letter-spacing:.06em;color:#FFFFFF">CENTRIFUGE <span style="color:${C.bright}">WORLD</span></td>
      <td align="right"><span style="display:inline-block;background:{% if isEmergency %}${C.red}{% else %}${C.deep}{% endif %};color:#FFFFFF;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 10px;border-radius:4px">{{ formLabel | escape }}</span></td>
    </tr></table>
  </td></tr>
  <tr><td class="px" style="padding:26px 28px 18px">
    <div style="font-size:12px;color:${C.s500};margin-bottom:6px">New lead #{{ leadId }} · {{ receivedAt }}</div>
    <div style="font-family:Archivo,Arial,sans-serif;font-size:26px;line-height:1.2;font-weight:700;color:${C.s700}">{{ name | escape }}</div>
    {% if subline %}<div style="font-size:15px;color:${C.s500};margin:4px 0 0">{{ subline | escape }}</div>{% endif %}
    <div style="margin-top:18px">
      {% if phone %}${actionBtn('tel:{{ phoneHref }}', 'Call {{ phone | escape }}', '{% if isEmergency %}' + C.red + '{% else %}' + C.blue + '{% endif %}', '#FFFFFF', '{% if isEmergency %}' + C.red + '{% else %}' + C.blue + '{% endif %}')}{% endif %}
      {% if mailtoHref %}${actionBtn('{{ mailtoHref | escape }}', 'Email {{ firstName | escape }}', '#FFFFFF', C.blue, C.blue)}{% else %}<span style="display:inline-block;font-size:13px;color:${C.s500};padding:13px 0">No email given — phone only</span>{% endif %}
    </div>
  </td></tr>
  {% if whatHappened %}${section(`${sectionLabel('What happened')}<div style="font-size:16px;line-height:1.55;color:${C.s700};background:#FFF4F2;border:1px solid #F5C6BF;border-radius:6px;padding:14px 16px">{{ whatHappened | escape | newline_to_br }}</div>`)}{% endif %}
  {% if machine %}${section(`${sectionLabel('Machine requested · {{ machine.inventoryId | escape }}')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.s300};border-radius:6px"><tr><td style="padding:14px 16px">
      <div style="font-size:16px;font-weight:700;color:${C.s700}">{{ machine.title | escape }}</div>
      {% if machine.specsLine %}<div style="font-size:13px;color:${C.s500};margin:2px 0 0">{{ machine.specsLine | escape }}</div>{% endif %}
      <div style="margin-top:8px"><a href="{{ machine.url | escape }}" style="font-size:14px;font-weight:600;color:${C.blue}">View listing</a></div>
    </td></tr></table>`)}{% endif %}
  {% if request.size > 0 %}${section(`${sectionLabel('What they need')}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">{% for r in request %}<tr>
      <td style="${labelCell};border-bottom:1px solid ${C.s100}">{{ r.label | escape }}</td>
      <td style="padding:8px 0;font-size:15px;color:${C.s700};font-weight:600;border-bottom:1px solid ${C.s100}">{% if r.tone == 'crit' %}<span style="display:inline-block;background:${C.red};color:#FFFFFF;font-weight:700;font-size:12px;padding:3px 9px;border-radius:4px">{{ r.value | escape }}</span>{% elsif r.tone == 'warn' %}<span style="display:inline-block;background:#FFF2D6;color:#7A4B00;font-weight:700;font-size:12px;padding:3px 9px;border-radius:4px">{{ r.value | escape }}</span>{% elsif r.tone == 'ok' %}<span style="display:inline-block;background:#E3F3EB;color:#1E6B47;font-weight:700;font-size:12px;padding:3px 9px;border-radius:4px">{{ r.value | escape }}</span>{% else %}{{ r.value | escape }}{% endif %}</td>
    </tr>{% endfor %}</table>`)}{% endif %}
  {% if message %}${section(`${sectionLabel('Their message')}<div style="font-size:15px;line-height:1.6;color:${C.s700};background:${C.s100};border-radius:6px;padding:14px 16px">{{ message | escape | newline_to_br }}</div>`)}{% endif %}
  {% if photoCount > 0 %}${section(`${sectionLabel('Attachments ({{ photoCount }}) — open without logging in')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">{% for ph in photos %}<tr>
      <td width="64" style="padding:6px 12px 6px 0;vertical-align:middle"><a href="{{ ph.url | escape }}"><img src="{{ ph.thumb | escape }}" alt="" width="56" height="56" style="display:block;width:56px;height:56px;object-fit:cover;border-radius:4px;border:1px solid ${C.s300};background:${C.s100}" /></a></td>
      <td style="padding:6px 0;vertical-align:middle"><div style="font-size:14px;font-weight:600;color:${C.s700};word-break:break-all">{{ ph.name | escape }}</div>{% if ph.meta %}<div style="font-size:12px;color:${C.s500}">{{ ph.meta }}</div>{% endif %}</td>
      <td align="right" style="padding:6px 0 6px 8px;vertical-align:middle;white-space:nowrap"><a href="{{ ph.url | escape }}" style="font-size:14px;font-weight:600;color:${C.blue};text-decoration:none">View</a><span style="color:${C.s300}">&nbsp;|&nbsp;</span><a href="{{ ph.downloadUrl | escape }}" style="font-size:14px;font-weight:600;color:${C.blue};text-decoration:none">Download</a></td>
    </tr>{% endfor %}</table>`)}{% endif %}
  ${section(`${sectionLabel('Contact')}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="${labelCell}">Phone</td><td style="padding:8px 0;font-size:14px">{% if phone %}<a href="tel:{{ phoneHref }}" style="color:${C.blue};font-weight:600">{{ phone | escape }}</a>{% else %}<span style="color:${C.s500}">Not provided</span>{% endif %}</td></tr>
    <tr><td style="${labelCell}">Email</td><td style="padding:8px 0;font-size:14px">{% if email %}<a href="mailto:{{ email | escape }}" style="color:${C.blue};font-weight:600">{{ email | escape }}</a>{% else %}<span style="color:${C.s500}">Not provided</span>{% endif %}</td></tr>
    {% if company %}<tr><td style="${labelCell}">Company</td><td style="padding:8px 0;font-size:14px;color:${C.s700}">{{ company | escape }}</td></tr>{% endif %}
    {% if location %}<tr><td style="${labelCell}">Location</td><td style="padding:8px 0;font-size:14px;color:${C.s700}">{{ location | escape }}</td></tr>{% endif %}
    {% if pageUrl %}<tr><td style="${labelCell}">Submitted from</td><td style="padding:8px 0;font-size:13px;word-break:break-all"><a href="{{ pageUrl | escape }}" style="color:${C.blue}">{{ pagePath | escape }}</a></td></tr>{% endif %}
  </table>`)}
  <tr><td class="px" style="background:${C.s100};padding:16px 28px;font-size:12px;line-height:1.6;color:${C.s500}">
    <a href="{{ leadUrl }}" style="color:${C.blue};font-weight:600">Open lead #{{ leadId }} in Mission Control</a> (login required){% if recipientsLine %} · Sent to {{ recipientsLine | escape }}{% endif %}<br>
    24/7 emergency line {{ emergencyDisplay }} · {{ hoursDisplay }}, {{ oncallDisplay }}
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  text: `{% if isEmergency %}*** EMERGENCY — equipment down. Call back now. ***

{% endif %}{{ formLabel | upcase }} — Lead #{{ leadId }}
{{ receivedAt }}

{{ name }}
{% if subline %}{{ subline }}
{% endif %}Call:  {% if phone %}{{ phone }}{% else %}not provided{% endif %}
Email: {% if email %}{{ email }}{% else %}not provided{% endif %}
{% if whatHappened %}
WHAT HAPPENED
-------------
{{ whatHappened }}
{% endif %}{% if machine %}
MACHINE REQUESTED — {{ machine.inventoryId }}
---------------------
{{ machine.title }}
{% if machine.specsLine %}{{ machine.specsLine }}
{% endif %}{{ machine.url }}
{% endif %}{% if request.size > 0 %}
WHAT THEY NEED
--------------
{% for r in request %}{{ r.label }}: {{ r.value }}
{% endfor %}{% endif %}{% if message %}
THEIR MESSAGE
-------------
{{ message }}
{% endif %}{% if photoCount > 0 %}
ATTACHMENTS ({{ photoCount }}) — no login needed
----------------------------
{% for ph in photos %}{{ ph.name }}{% if ph.meta %} ({{ ph.meta }}){% endif %}
  {{ ph.url }}
{% endfor %}{% endif %}
{% if pageUrl %}Submitted from: {{ pageUrl }}
{% endif %}Open in Mission Control: {{ leadUrl }}

24/7 emergency line {{ emergencyDisplay }}`,
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
