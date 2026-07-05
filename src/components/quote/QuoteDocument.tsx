/* QuoteDocument — the single source of truth for the branded quote (UI-2 §5).
 * The SAME component renders the admin live preview, the hosted /quote/[token] page, and
 * the print-to-PDF output, so all three are pixel-consistent. Self-contained (inline
 * <style> + data-URI logo) so it renders identically with no external CSS. Faithful port
 * of the mockup's `.paper`. NAP values come from the view model (data/nap.json). */
import { CW_LOGO_DATA_URI } from './logo'
import type { QuoteView } from '@/lib/quotes/view'

const STYLE = `
.qdoc{--ink:#152238;--dim:#5E6C85;--line:#DDE4EF;--blue:#1B4FA0;
  font-family:'Inter',system-ui,-apple-system,Segoe UI,sans-serif;color:var(--ink);font-size:12px;line-height:1.5}
.qdoc *{box-sizing:border-box}
.qdoc .paper{background:#fff;color:var(--ink);border-radius:6px;overflow:hidden;max-width:660px;margin:0 auto}
.qdoc .p-head{padding:22px 30px 16px;display:flex;align-items:center;gap:14px}
.qdoc .p-head img.logo{height:44px;width:auto;display:block;object-fit:contain}
.qdoc .p-head .qn{margin-left:auto;text-align:right}
.qdoc .p-head .qn b{font-family:'JetBrains Mono',monospace;font-size:14px;display:block;color:var(--ink)}
.qdoc .p-head .qn span{font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--blue);font-weight:700}
.qdoc .p-rule{height:5px;background:linear-gradient(90deg,#12356E,#1B4FA0 55%,#2A6AD1)}
.qdoc .p-body{padding:24px 30px 24px}
.qdoc .p-meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px}
.qdoc .p-meta .t{font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--dim);font-weight:700;margin-bottom:3px}
.qdoc .p-meta .v{font-size:12px;line-height:1.5}
.qdoc .p-meta .v b{font-weight:600}
.qdoc .p-table{width:100%;border-collapse:collapse;margin-bottom:4px}
.qdoc .p-table th{font-size:8.5px;letter-spacing:.16em;color:var(--blue);border-bottom:2px solid var(--blue);padding:7px 6px;text-transform:uppercase;text-align:left}
.qdoc .p-table th.n{text-align:right}
.qdoc .p-table td{border-bottom:1px solid var(--line);padding:9px 6px;font-size:11.5px;color:var(--ink)}
.qdoc .p-table td.n{font-family:'JetBrains Mono',monospace;font-size:10.5px;text-align:right;white-space:nowrap}
.qdoc .p-totals{display:flex;justify-content:flex-end;margin-top:8px}
.qdoc .p-totals table{width:250px;border-collapse:collapse}
.qdoc .p-totals td{padding:5px 6px;font-size:11.5px;border:none}
.qdoc .p-totals td.k{color:var(--dim)}
.qdoc .p-totals td.n{font-family:'JetBrains Mono',monospace;text-align:right}
.qdoc .p-totals tr.grand td{border-top:2px solid var(--blue);font-weight:700;font-size:13px;padding-top:8px}
.qdoc .p-totals tr.grand td.n{color:var(--blue)}
.qdoc .p-terms{margin-top:22px;padding-top:14px;border-top:1px solid var(--line);font-size:10px;color:var(--dim);line-height:1.65}
.qdoc .p-terms b{color:var(--ink);font-size:10px;letter-spacing:.12em;text-transform:uppercase;display:block;margin-bottom:4px}
.qdoc .p-locs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-top:22px;padding-top:14px;border-top:1px solid var(--line)}
.qdoc .p-locs .l{font-size:9.5px;color:var(--dim);line-height:1.55}
.qdoc .p-locs .l .t{font-size:8.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--blue);font-weight:700;margin-bottom:2px}
.qdoc .p-locs .l .t.home::after{content:' ● issuing';color:var(--dim);letter-spacing:.08em;font-weight:600}
.qdoc .p-locs .l b{color:var(--ink);font-weight:600;font-family:'JetBrains Mono',monospace;font-size:9.5px}
.qdoc .p-emerg{margin-top:10px;font-size:9.5px;color:var(--ink);background:#F2F6FC;border-radius:5px;padding:7px 12px;display:flex;gap:6px;align-items:center}
.qdoc .p-emerg b{font-family:'JetBrains Mono',monospace;color:var(--blue)}
.qdoc .p-foot{background:#F2F6FC;padding:12px 30px;display:flex;gap:18px;font-size:9.5px;color:var(--dim);font-family:'JetBrains Mono',monospace}
.qdoc .p-foot .end{margin-left:auto}
`

export function QuoteDocument({ view }: { view: QuoteView }) {
  return (
    <div className="qdoc">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="paper">
        <div className="p-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo" src={CW_LOGO_DATA_URI} alt="Centrifuge World" />
          <div className="qn">
            <span>Quotation</span>
            <b>{view.quoteNumber}</b>
          </div>
        </div>
        <div className="p-rule" />
        <div className="p-body">
          <div className="p-meta">
            <div>
              <div className="t">Prepared For</div>
              <div className="v">
                <b>{view.client.contactName}</b>
                {view.client.company ? <><br />{view.client.company}</> : null}
                {view.client.email ? <><br /><span style={{ color: '#5E6C85' }}>{view.client.email}</span></> : null}
              </div>
            </div>
            <div>
              <div className="t">Scope</div>
              <div className="v">{view.scopeTitle}</div>
            </div>
            <div>
              <div className="t">Issued / Valid Until</div>
              <div className="v">
                {view.issuedDate}
                {view.validUntil ? <><br /><b>Valid through {view.validUntil}</b></> : null}
                <br />
                <span style={{ color: '#5E6C85' }}>Issued from Rosharon, TX</span>
              </div>
            </div>
          </div>

          <table className="p-table">
            <thead>
              <tr><th>Description</th><th className="n">Qty</th><th className="n">Unit</th><th className="n">Amount</th></tr>
            </thead>
            <tbody>
              {view.lines.map((li, i) => (
                <tr key={i}>
                  <td>{li.description}</td>
                  <td className="n">{li.qty}</td>
                  <td className="n">{li.unitPrice}</td>
                  <td className="n">{li.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-totals">
            <table>
              <tbody>
                <tr><td className="k">Subtotal</td><td className="n">{view.subtotal}</td></tr>
                <tr><td className="k">Tax ({view.taxRate}%)</td><td className="n">{view.tax}</td></tr>
                <tr className="grand"><td>Total</td><td className="n">{view.total}</td></tr>
              </tbody>
            </table>
          </div>

          {view.terms ? (
            <div className="p-terms"><b>Terms</b>{view.terms}</div>
          ) : null}

          <div className="p-locs">
            {view.locations.map((loc, i) => (
              <div className="l" key={i}>
                <div className={`t${loc.issuing ? ' home' : ''}`}>{loc.heading}</div>
                {loc.addressLines.map((line, j) => (
                  <span key={j}>{line}<br /></span>
                ))}
                <b>{loc.phone}</b>
              </div>
            ))}
          </div>
          <div className="p-emerg">24/7 Emergency breakdown line: <b>{view.emergencyDisplay}</b> — staffed 365 days a year · Office {view.hoursDisplay}</div>
        </div>
        <div className="p-foot">
          {view.footerLines.map((f, i) => <span key={i}>{f}</span>)}
          <span className="end">Page 1 of 1</span>
        </div>
      </div>
    </div>
  )
}
