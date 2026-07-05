/* Liquid rendering for email templates (UI-2 §3). Templates are Liquid + inline-CSS
 * strings with a plain-text twin; we render app-side and send the final HTML+text via
 * the Twilio operator. liquidjs is Liquid syntax (NOT Handlebars) per the cycle spec. */
import { Liquid } from 'liquidjs'

const engine = new Liquid({ strictVariables: false, strictFilters: false, jsTruthy: true })

export type EmailTemplate = { html: string; text: string }

export async function renderTemplate(tpl: EmailTemplate, data: Record<string, unknown>): Promise<{ html: string; text: string }> {
  const [html, text] = await Promise.all([
    engine.parseAndRender(tpl.html, data),
    engine.parseAndRender(tpl.text, data),
  ])
  return { html, text }
}
