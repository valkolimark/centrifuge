/* Quote PDF generation (UI-2 §5). Renders the shared QuoteDocument to HTML and prints it
 * to PDF with headless Chrome — the SAME component as the preview/hosted page, so output
 * is pixel-consistent. Serverless (Vercel) uses @sparticuz/chromium; local dev uses an
 * installed Chrome (CHROME_PATH override). Returns the PDF bytes + the SHA-256 of the HTML. */
import { renderToStaticMarkup } from 'react-dom/server'
import crypto from 'crypto'
import { QuoteDocument } from '@/components/quote/QuoteDocument'
import type { QuoteView } from './view'

const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'

export function quoteHtml(view: QuoteView): string {
  const body = renderToStaticMarkup(<QuoteDocument view={view} />)
  return `<!doctype html><html><head><meta charset="utf-8"><link href="${FONTS}" rel="stylesheet">
<style>@page{size:Letter;margin:14mm}html,body{margin:0;background:#fff}</style></head><body>${body}</body></html>`
}

const isServerless = () => !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
const LOCAL_CHROME =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

async function launch() {
  const puppeteer = await import('puppeteer-core')
  if (isServerless()) {
    const chromium = (await import('@sparticuz/chromium')).default
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }
  return puppeteer.launch({ headless: true, executablePath: LOCAL_CHROME, args: ['--no-sandbox'] })
}

export type QuotePdf = { pdf: Buffer; htmlHash: string; bytes: number }

export async function renderQuotePdf(view: QuoteView): Promise<QuotePdf> {
  const html = quoteHtml(view)
  const htmlHash = crypto.createHash('sha256').update(html).digest('hex')
  const browser = await launch()
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    // Ensure web fonts have loaded before printing so the PDF matches the preview.
    await page.evaluate(() => (document as any).fonts?.ready).catch(() => {})
    const bytes = await page.pdf({ printBackground: true, preferCSSPageSize: true })
    const pdf = Buffer.from(bytes)
    return { pdf, htmlHash, bytes: pdf.length }
  } finally {
    await browser.close()
  }
}

export const quotePdfFilename = (quoteNumber: string, version: number) => `${quoteNumber}-v${version}.pdf`
