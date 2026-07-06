/* eslint-disable @next/next/no-html-link-for-pages -- every /admin/* link targets the Payload app (full navigation required), not Next page routes */
'use client'
/* Leads & Quotes workspace (Cycle UI-2) — the interactive Mission Control client island.
   Renders the real read model (src/lib/leads-quotes/workspace.ts) into the mockup's markup
   (classes scoped under .cw-lq in leads-quotes.css) and wires every action to real data:
     · pipeline drag-drop → PATCH /api/leads/:id { pipelineStage }
     · Mark Contacted → PATCH /api/leads/:id
     · New Quote / Save Draft → POST /api/quotes  (hooks auto-gen number, viewToken, totals)
     · Send to Client → POST /api/quotes/:id/send (real sendQuote flow; dry-run aware)
   All fetches are same-origin so they ride the admin session cookie + collection access. */
import { useMemo, useRef, useState } from 'react'
import type { WorkspaceData, StageColumn, LeadCard, QuoteRow } from '@/lib/leads-quotes/shared'
import { PIPELINE_STAGES } from '@/lib/leads-quotes/shared'
import './leads-quotes.css'

// ---------- formatting ----------
const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US')
const usdK = (n: number) =>
  n >= 1e6 ? '$' + (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? '$' + Math.round(n / 1e3) + 'k' : '$' + Math.round(n)
const colValue = (count: number, sum: number) => {
  if (!sum) return String(count)
  const k = sum / 1000
  const money = k >= 1000 ? '$' + (k / 1000).toFixed(1) + 'M' : '$' + (k % 1 ? k.toFixed(1) : k.toFixed(0)) + 'k'
  return `${count} · ${money}`
}
const shortDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : '—'
const num = (v: string) => (parseFloat(v) || 0)

const recount = (c: StageColumn): StageColumn => ({
  ...c,
  count: c.leads.length,
  valueSum: c.leads.reduce((s, l) => s + (l.estimatedValue || 0), 0),
})
// Pure board move: pull a lead out of its column and prepend it to the target column.
function moveInBoard(cols: StageColumn[], id: string, to: string): StageColumn[] {
  let moved: LeadCard | null = null
  const stripped = cols.map((c) => ({
    ...c,
    leads: c.leads.filter((l) => (l.id === id ? ((moved = l), false) : true)),
  }))
  return stripped.map((c) => (c.stage === to && moved ? { ...c, leads: [moved, ...c.leads] } : c)).map(recount)
}

type Tab = 'pipeline' | 'forms' | 'quotes' | 'archive' | 'builder' | 'routing'
type BuilderLine = { d: string; q: string; u: string }

const RAIL = [
  { key: 'dash', href: '/admin', title: 'Dashboard', d: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z' },
  { key: 'crm', href: null, title: 'Leads & Quotes', on: true, d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-.001M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  { key: 'content', href: '/admin/collections/pages', title: 'Content Studio', d: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z' },
  { key: 'res', href: '/admin/collections/media', title: 'Resources / PDF Studio', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6' },
]

export default function LeadsQuotesClient({ data, userName }: { data: WorkspaceData; userName: string }) {
  const initialTab = (typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('tab') as Tab | null)
    : null) || 'pipeline'

  const [tab, setTab] = useState<Tab>(initialTab)
  const [pipeline, setPipeline] = useState<StageColumn[]>(data.pipeline)
  const [flash, setFlash] = useState<string | null>(null)
  const draggedRef = useRef<{ id: string; from: string } | null>(null)
  const [overStage, setOverStage] = useState<string | null>(null)

  // drawers
  const [openLead, setOpenLead] = useState<LeadCard | null>(null)
  const [openQuote, setOpenQuote] = useState<QuoteRow | null>(null)

  // filters
  const [formFilter, setFormFilter] = useState('all')
  const [qStatus, setQStatus] = useState('all')
  const [qYear, setQYear] = useState('all')
  const [qText, setQText] = useState('')

  // builder
  const [bLeadId, setBLeadId] = useState('')
  const [bName, setBName] = useState('')
  const [bCompany, setBCompany] = useState('')
  const [bEmail, setBEmail] = useState('')
  const [bScope, setBScope] = useState('')
  const [bLines, setBLines] = useState<BuilderLine[]>([{ d: '', q: '1', u: '0' }])
  const [bTax, setBTax] = useState('8.25')
  const [bDays, setBDays] = useState('30')
  const [bTerms, setBTerms] = useState(
    '50% deposit on approval, balance net 30 on completion. Freight to/from Rosharon facility included within 150 miles. Quote excludes parts found damaged beyond inspection scope; change orders issued for approval before work proceeds.',
  )
  const [sending, setSending] = useState(false)

  const allLeads = useMemo(() => pipeline.flatMap((c) => c.leads), [pipeline])
  const kpis = useMemo(() => {
    const by = (s: string) => pipeline.find((c) => c.stage === s)
    const open = ['new', 'contacted', 'quoting', 'quote-sent'].reduce((sum, s) => sum + (by(s)?.valueSum || 0), 0)
    const won = by('won')
    const lost = by('lost')
    const decided = (won?.count || 0) + (lost?.count || 0)
    return {
      newCount: by('new')?.count || 0,
      openValue: open,
      wonValue: won?.valueSum || 0,
      winRate: decided ? Math.round(((won?.count || 0) / decided) * 100) : null,
    }
  }, [pipeline])

  function toast(msg: string) {
    setFlash(msg)
    window.clearTimeout((toast as any)._t)
    ;(toast as any)._t = window.setTimeout(() => setFlash(null), 3800)
  }

  // ---------- pipeline drag-drop (persists stage) ----------
  async function moveLead(id: string, from: string, to: string) {
    if (from === to) return
    const prev = pipeline
    setPipeline(moveInBoard(pipeline, id, to))
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ pipelineStage: to }),
      })
      if (!res.ok) throw new Error(String(res.status))
      toast(`Moved to ${PIPELINE_STAGES.find((s) => s.stage === to)?.label}`)
    } catch {
      setPipeline(prev)
      toast('Move failed — reverted')
    }
  }

  async function markContacted(id: string) {
    const col = pipeline.find((c) => c.leads.some((l) => l.id === id))
    setOpenLead(null)
    if (col) await moveLead(id, col.stage, 'contacted')
  }

  function startQuoteFor(lead: LeadCard) {
    setBLeadId(lead.id)
    setBName(lead.name)
    setBCompany(lead.company === '—' ? '' : lead.company)
    setBEmail(lead.email || '')
    setBScope(lead.message ? lead.message.slice(0, 80) : '')
    setOpenLead(null)
    setTab('builder')
  }

  // ---------- builder persistence ----------
  const subtotal = useMemo(() => bLines.reduce((s, li) => s + num(li.q) * num(li.u), 0), [bLines])
  const taxAmt = (subtotal * num(bTax)) / 100
  const validUntilLabel = useMemo(() => {
    const dt = new Date()
    dt.setDate(dt.getDate() + (parseInt(bDays) || 30))
    return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  }, [bDays])

  async function persistQuote(status: 'draft'): Promise<any> {
    const body = {
      ...(bLeadId ? { lead: bLeadId } : {}),
      client: { contactName: bName, company: bCompany, email: bEmail },
      scopeTitle: bScope,
      lineItems: bLines.filter((li) => li.d.trim()).map((li) => ({ description: li.d, qty: num(li.q), unitPrice: num(li.u) })),
      taxRate: num(bTax),
      validDays: parseInt(bDays) || 30,
      terms: bTerms,
      status,
    }
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.errors?.[0]?.message || json?.message || 'Create failed')
    return json.doc
  }

  async function saveDraft() {
    try {
      const doc = await persistQuote('draft')
      toast(`Draft ${doc.quoteNumber} saved`)
    } catch (e: any) {
      toast('Save failed: ' + e.message)
    }
  }

  async function sendToClient() {
    if (!bEmail.trim()) return toast('Client email is required to send')
    setSending(true)
    try {
      const doc = await persistQuote('draft')
      const res = await fetch('/quote-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ quoteId: String(doc.id) }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result?.error || 'Send failed')
      toast(result.dryRun ? `${doc.quoteNumber}: rendered + snapshotted (DRY RUN — no email sent)` : `${doc.quoteNumber} sent to ${bEmail}`)
    } catch (e: any) {
      toast('Send failed: ' + (e?.message || 'unknown error'))
    } finally {
      setSending(false)
    }
  }

  // ---------- derived table rows ----------
  const formRows = data.formLeads.filter((r) => formFilter === 'all' || r.sourceTag === formFilter)
  const quoteRows = data.quotes.filter((q) => {
    const okS = qStatus === 'all' || q.status === qStatus
    const okY = qYear === 'all' || q.year === qYear
    const okT = !qText || `${q.quoteNumber} ${q.clientCompany} ${q.clientContact} ${q.scope}`.toLowerCase().includes(qText)
    return okS && okY && okT
  })
  const quoteYears = useMemo(() => Array.from(new Set(data.quotes.map((q) => q.year))).sort().reverse(), [data.quotes])

  const boardTotal = pipeline.reduce((s, c) => s + c.count, 0)

  return (
    <div className="cw-lq">
      <div className="app">
        {/* ===== topbar ===== */}
        <div className="topbar">
          <div className="lockup">
            <div className="mark">
              <svg viewBox="0 0 147 148" xmlns="http://www.w3.org/2000/svg">
                <defs><linearGradient id="cwlqg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#63A5FF" /><stop offset="1" stopColor="#2F7BF6" /></linearGradient></defs>
                <path d="M73.5 8C38 8 9 37.3 9 74c0 36.7 29 66 64.5 66 27 0 50-16.8 59.6-40.6-8.4 13.5-23.3 22.5-40.2 22.5-26.2 0-47.5-21.4-47.5-47.9S66.7 26 92.9 26c16.9 0 31.8 9 40.2 22.6C123.5 24.8 100.5 8 73.5 8z" fill="url(#cwlqg)" />
                <circle cx="92" cy="74" r="20" fill="none" stroke="url(#cwlqg)" strokeWidth="9" />
              </svg>
            </div>
            <div className="wordmark"><b>CENTRIFUGE <i>world</i></b><span>Estd 1939 · Mission Control</span></div>
          </div>
          <div className="crumb">
            <a href="/admin">◂ Dashboard</a>
            <span className="sep">/</span>
            <span className="here">Leads &amp; Quotes</span>
          </div>
          <div className="grow" />
          {flash ? <div className="tw-status" style={{ borderColor: 'var(--blue2)', color: 'var(--ink)' }}><span className="dot" /> {flash}</div> : null}
          <div className="tw-status"><span className="dot" /> {data.totals.leads} LEADS · {data.totals.quotes} QUOTES</div>
          <div className="user">{(userName[0] || 'M').toUpperCase()}</div>
        </div>

        {/* ===== icon rail ===== */}
        <div className="rail">
          {RAIL.map((r) =>
            r.href ? (
              <a key={r.key} href={r.href} title={r.title} className={r.on ? 'on' : undefined}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={r.d} /></svg>
              </a>
            ) : (
              <button key={r.key} className={r.on ? 'on' : undefined} title={r.title}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={r.d} /></svg>
              </button>
            ),
          )}
          <div className="spacer" />
          <a href="/admin/globals/site-settings" title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          </a>
        </div>

        {/* ===== main ===== */}
        <div className="main">
          <div className="subnav">
            <button className={tab === 'pipeline' ? 'on' : ''} onClick={() => setTab('pipeline')}>Pipeline <span className="count">{boardTotal}</span></button>
            <button className={tab === 'forms' ? 'on' : ''} onClick={() => setTab('forms')}>Form Leads <span className="count">{data.formLeads.length}</span></button>
            <button className={tab === 'quotes' ? 'on' : ''} onClick={() => setTab('quotes')}>Quotes <span className="count">{data.quotes.length}</span></button>
            <button className={tab === 'archive' ? 'on' : ''} onClick={() => setTab('archive')}>Archive <span className="count">{data.totals.quotes}</span></button>
            <button className={tab === 'builder' ? 'on' : ''} onClick={() => setTab('builder')}>Quote Builder</button>
            <button className={tab === 'routing' ? 'on' : ''} onClick={() => setTab('routing')}>Routing &amp; Delivery</button>
            <div className="grow" />
            <button className="btn primary" onClick={() => setTab('builder')}>＋ New Quote</button>
          </div>

          {/* ---- PIPELINE ---- */}
          {tab === 'pipeline' && (
            <div className="view on">
              <div className="kpis">
                <div className="kpi"><div className="lbl">New Leads</div><div className="val">{kpis.newCount}</div><div className="sub">awaiting first touch</div></div>
                <div className="kpi"><div className="lbl">Open Pipeline Value</div><div className="val">{usdK(kpis.openValue)}</div><div className="sub">new → quote sent</div></div>
                <div className="kpi"><div className="lbl">Won (value)</div><div className="val">{usdK(kpis.wonValue)}</div><div className="sub">closed won</div></div>
                <div className="kpi"><div className="lbl">Win Rate</div><div className="val">{kpis.winRate === null ? '—' : kpis.winRate + '%'}</div><div className="sub">won vs lost</div></div>
              </div>
              <div className="board">
                {pipeline.map((col) => (
                  <div
                    key={col.stage}
                    className="col"
                    onDragOver={(e) => { e.preventDefault(); setOverStage(col.stage) }}
                    onDragLeave={() => setOverStage((s) => (s === col.stage ? null : s))}
                    onDrop={(e) => { e.preventDefault(); setOverStage(null); const d = draggedRef.current; if (d) moveLead(d.id, d.from, col.stage) }}
                  >
                    <div className="col-h"><span className="bar" style={{ background: col.color }} /><span className="nm">{col.label}</span><span className="n">{colValue(col.count, col.valueSum)}</span></div>
                    <div className={`col-body${overStage === col.stage ? ' over' : ''}`}>
                      {col.leads.map((l) => (
                        <div
                          key={l.id}
                          className="card"
                          draggable
                          onDragStart={() => { draggedRef.current = { id: l.id, from: col.stage } }}
                          onDragEnd={() => { draggedRef.current = null }}
                          onClick={() => setOpenLead(l)}
                        >
                          <div className="who">{l.name}</div>
                          <div className="co">{l.company}</div>
                          <div className="meta">
                            <span className={`tag ${l.quoteNumber ? 'quote' : l.sourceTag}`}>{l.quoteNumber || l.source}</span>
                            {l.estimatedValue ? <span className="val">{l.quoteNumber ? usd(l.estimatedValue) : '~' + usdK(l.estimatedValue)}</span> : null}
                            {l.ageLabel ? <span className={`age${l.isHot ? ' hot' : ''}`}>{l.ageLabel}</span> : null}
                          </div>
                        </div>
                      ))}
                      {col.leads.length === 0 ? <div style={{ color: 'var(--faint)', fontSize: 12, padding: '10px 4px' }}>No leads</div> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- FORM LEADS ---- */}
          {tab === 'forms' && (
            <div className="view on">
              <div className="panel">
                <div className="panel-h">
                  <h3>Form Lead Tracker</h3>
                  <span className="mono">every submission → routed via Twilio Email to all 4 recipients</span>
                  <div className="grow" />
                  <div className="chips">
                    {[['all', 'All'], ['quote', 'Quote Request'], ['contact', 'Contact'], ['emergency', 'Emergency Service']].map(([f, label]) => (
                      <button key={f} className={`chip${formFilter === f ? ' on' : ''}`} onClick={() => setFormFilter(f)}>{label}</button>
                    ))}
                  </div>
                </div>
                <table>
                  <thead><tr><th>Received</th><th>Form</th><th>Lead</th><th>Message</th><th>Routed To</th><th>Pipeline</th><th /></tr></thead>
                  <tbody>
                    {formRows.map((r) => (
                      <tr className="row" key={r.id}>
                        <td className="mono">{new Date(r.receivedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</td>
                        <td><span className={`tag ${r.sourceTag}`}>{r.source}</span></td>
                        <td><div className="who">{r.name}</div><div className="co">{r.company}</div></td>
                        <td><div className="msg">{r.message || '—'}</div></td>
                        <td>
                          <div className="route">
                            {r.delivery.length ? r.delivery.map((dd, i) => (
                              <span key={i} className={`rd ${dd.status.startsWith('deliver') ? 'ok' : dd.status.includes('fail') || dd.status.includes('bounce') ? 'f' : 'q'}`} data-tip={`${dd.recipient} · ${dd.status}`}>{dd.initial}</span>
                            )) : <span className="mono" style={{ color: 'var(--faint)' }}>—</span>}
                          </div>
                        </td>
                        <td><span className="pill new">{r.pipelineLabel}</span></td>
                        <td><a className="btn sm" href={`/admin/collections/leads/${r.id}`}>Open</a></td>
                      </tr>
                    ))}
                    {formRows.length === 0 ? <tr><td colSpan={7} style={{ color: 'var(--faint)', padding: 20 }}>No form leads.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---- QUOTES ---- */}
          {tab === 'quotes' && (
            <div className="view on">
              <div className="kpis" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                <div className="kpi"><div className="lbl">Outstanding</div><div className="val">{usdK(data.kpis.openQuoteValue)}</div><div className="sub">{data.kpis.openQuoteCount} quotes awaiting decision</div></div>
                <div className="kpi"><div className="lbl">Accepted · 90d</div><div className="val">{usdK(data.kpis.acceptedValue90d)}</div><div className="sub">{data.kpis.winRate90d === null ? 'no decided quotes yet' : data.kpis.winRate90d + '% acceptance'}</div></div>
                <div className="kpi"><div className="lbl">Total Quotes</div><div className="val">{data.totals.quotes}</div><div className="sub">all statuses</div></div>
                <div className="kpi"><div className="lbl">Expiring Soon</div><div className="val">{data.kpis.expiringSoon}</div><div className="sub">within 7 days — follow up</div></div>
              </div>
              <div className="panel">
                <div className="panel-h">
                  <h3>Quotes</h3>
                  <span className="mono">immutable snapshot per send · every version retained</span>
                  <div className="grow" />
                  <input value={qText} onChange={(e) => setQText(e.target.value.trim().toLowerCase())} placeholder="Search quote #, client, scope…" style={{ background: 'var(--bg)', border: '1px solid var(--line2)', borderRadius: 8, color: 'var(--ink)', padding: '7px 12px', fontFamily: 'var(--body)', fontSize: 12, width: 230 }} />
                </div>
                <div className="panel-h" style={{ paddingTop: 10, paddingBottom: 10 }}>
                  <div className="chips">
                    <button className={`chip${qYear === 'all' ? ' on' : ''}`} onClick={() => setQYear('all')}>All Years</button>
                    {quoteYears.map((y) => <button key={y} className={`chip${qYear === y ? ' on' : ''}`} onClick={() => setQYear(y)}>{y}</button>)}
                  </div>
                  <div className="grow" />
                  <div className="chips">
                    {['all', 'draft', 'sent', 'viewed', 'accepted', 'declined', 'expired'].map((s) => (
                      <button key={s} className={`chip${qStatus === s ? ' on' : ''}`} onClick={() => setQStatus(s)}>{s[0].toUpperCase() + s.slice(1)}</button>
                    ))}
                  </div>
                </div>
                <table>
                  <thead><tr><th>Quote №</th><th>Client</th><th>Scope</th><th>Total</th><th>Sent</th><th>Valid Until</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {quoteRows.map((q) => (
                      <tr className="row" key={q.id} onClick={() => setOpenQuote(q)}>
                        <td className="mono">{q.quoteNumber}</td>
                        <td><div className="who">{q.clientCompany}</div><div className="co">{q.clientContact}</div></td>
                        <td><div className="msg">{q.scope}</div></td>
                        <td className="mono">{usd(q.total)}</td>
                        <td className="mono">{shortDate(q.sentAt)}</td>
                        <td className="mono">{shortDate(q.validUntil)}</td>
                        <td><span className={`pill ${q.status}`}>{q.status[0].toUpperCase() + q.status.slice(1)}</span></td>
                        <td><a className="btn sm" href={`/admin/collections/quotes/${q.id}`} onClick={(e) => e.stopPropagation()}>Edit</a></td>
                      </tr>
                    ))}
                    {quoteRows.length === 0 ? <tr><td colSpan={8} style={{ color: 'var(--faint)', padding: 20 }}>No quotes yet — create one in the Quote Builder.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---- ARCHIVE ---- */}
          {tab === 'archive' && (
            <div className="view on">
              <div className="panel">
                <div className="panel-h"><h3>Quote Archive</h3><span className="mono">every sent version snapshotted with its PDF + integrity hash</span></div>
                <table>
                  <thead><tr><th>Quote №</th><th>Client</th><th>Scope</th><th>Total</th><th>Sent</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {data.quotes.map((q) => (
                      <tr className="row" key={q.id} onClick={() => setOpenQuote(q)}>
                        <td className="mono">{q.quoteNumber}</td>
                        <td><div className="who">{q.clientCompany}</div><div className="co">{q.clientContact}</div></td>
                        <td><div className="msg">{q.scope}</div></td>
                        <td className="mono">{usd(q.total)}</td>
                        <td className="mono">{shortDate(q.sentAt)}</td>
                        <td><span className={`pill ${q.status}`}>{q.status[0].toUpperCase() + q.status.slice(1)}</span></td>
                        <td><a className="btn sm" href={`/admin/collections/quotes/${q.id}`} onClick={(e) => e.stopPropagation()}>Record</a></td>
                      </tr>
                    ))}
                    {data.quotes.length === 0 ? <tr><td colSpan={7} style={{ color: 'var(--faint)', padding: 20 }}>The archive is empty — sent quotes are retained here permanently once you send your first.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---- QUOTE BUILDER ---- */}
          {tab === 'builder' && (
            <div className="view on">
              <div className="builder">
                <div>
                  <div className="panel" style={{ padding: '16px 18px 18px' }}>
                    <div className="field"><label>Linked Lead</label>
                      <select value={bLeadId} onChange={(e) => {
                        const id = e.target.value
                        setBLeadId(id)
                        const l = allLeads.find((x) => x.id === id)
                        if (l) { setBName(l.name); setBCompany(l.company === '—' ? '' : l.company); setBEmail(l.email || '') }
                      }}>
                        <option value="">— No linked lead (manual quote) —</option>
                        {allLeads.slice(0, 300).map((l) => <option key={l.id} value={l.id}>{l.name} — {l.company} ({l.source})</option>)}
                      </select>
                    </div>
                    <div className="f2">
                      <div className="field"><label>Client Contact</label><input value={bName} onChange={(e) => setBName(e.target.value)} /></div>
                      <div className="field"><label>Company</label><input value={bCompany} onChange={(e) => setBCompany(e.target.value)} /></div>
                    </div>
                    <div className="f2">
                      <div className="field"><label>Client Email</label><input value={bEmail} onChange={(e) => setBEmail(e.target.value)} placeholder="required to send" /></div>
                      <div className="field"><label>Issuing Location — locked</label><input value="Rosharon, TX · all quotes issue from Rosharon" disabled style={{ opacity: 0.65, cursor: 'not-allowed' }} /></div>
                    </div>
                    <div className="field"><label>Project / Scope Title</label><input value={bScope} onChange={(e) => setBScope(e.target.value)} /></div>

                    <div style={{ margin: '16px 0 6px', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--faint)', fontWeight: 700 }}>Line Items</div>
                    <div className="li-head"><span>Description</span><span style={{ textAlign: 'right' }}>Qty</span><span style={{ textAlign: 'right' }}>Unit $</span><span /></div>
                    <div>
                      {bLines.map((li, i) => (
                        <div className="li-row" key={i}>
                          <input className="d" value={li.d} placeholder="Description" onChange={(e) => setBLines((p) => p.map((x, j) => (j === i ? { ...x, d: e.target.value } : x)))} />
                          <input className="num q" value={li.q} onChange={(e) => setBLines((p) => p.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} />
                          <input className="num u" value={li.u} onChange={(e) => setBLines((p) => p.map((x, j) => (j === i ? { ...x, u: e.target.value } : x)))} />
                          <button className="rm" onClick={() => setBLines((p) => (p.length > 1 ? p.filter((_, j) => j !== i) : p))}>×</button>
                        </div>
                      ))}
                    </div>
                    <button className="addline" onClick={() => setBLines((p) => [...p, { d: '', q: '1', u: '0' }])}>＋ Add line item</button>

                    <div className="f2" style={{ marginTop: 14 }}>
                      <div className="field"><label>Tax Rate %</label><input className="num" value={bTax} onChange={(e) => setBTax(e.target.value)} style={{ fontFamily: 'var(--mono)' }} /></div>
                      <div className="field"><label>Valid For (days)</label><input value={bDays} onChange={(e) => setBDays(e.target.value)} style={{ fontFamily: 'var(--mono)' }} /></div>
                    </div>
                    <div className="field"><label>Terms &amp; Notes</label><textarea rows={3} value={bTerms} onChange={(e) => setBTerms(e.target.value)} /></div>
                  </div>
                </div>

                <div className="paper-wrap">
                  <div className="paper-bar">
                    <span className="t">Live Preview — branded PDF &amp; hosted quote page</span>
                    <div className="grow" />
                    <button className="btn sm" onClick={saveDraft} disabled={sending}>Save Draft</button>
                    <button className="btn sm primary" onClick={sendToClient} disabled={sending}>{sending ? 'Sending…' : 'Send to Client ▸'}</button>
                  </div>
                  <div className="paper">
                    <div className="p-head">
                      <div className="logo-fb" style={{ display: 'flex' }}>
                        <div className="mark"><svg viewBox="0 0 147 148" xmlns="http://www.w3.org/2000/svg"><path d="M73.5 8C38 8 9 37.3 9 74c0 36.7 29 66 64.5 66 27 0 50-16.8 59.6-40.6-8.4 13.5-23.3 22.5-40.2 22.5-26.2 0-47.5-21.4-47.5-47.9S66.7 26 92.9 26c16.9 0 31.8 9 40.2 22.6C123.5 24.8 100.5 8 73.5 8z" fill="#1B4FA0" /><circle cx="92" cy="74" r="20" fill="none" stroke="#1B4FA0" strokeWidth="9" /></svg></div>
                        <b>CENTRIFUGE WORLD</b>
                      </div>
                      <div className="qn"><span>Quotation</span><b>Draft</b></div>
                    </div>
                    <div className="p-rule" />
                    <div className="p-body">
                      <div className="p-meta">
                        <div><div className="t">Prepared For</div><div className="v"><b>{bName || '—'}</b><br /><span>{bCompany || '—'}</span><br /><span style={{ color: 'var(--paper-dim)' }}>{bEmail || '—'}</span></div></div>
                        <div><div className="t">Scope</div><div className="v">{bScope || '—'}</div></div>
                        <div><div className="t">Issued / Valid Until</div><div className="v">{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}<br /><b>Valid through {validUntilLabel}</b><br /><span style={{ color: 'var(--paper-dim)' }}>Issued from Rosharon, TX</span></div></div>
                      </div>
                      <table className="p-table">
                        <thead><tr><th>Description</th><th className="n">Qty</th><th className="n">Unit</th><th className="n">Amount</th></tr></thead>
                        <tbody>
                          {bLines.map((li, i) => (
                            <tr key={i}><td>{li.d || '—'}</td><td className="n">{num(li.q)}</td><td className="n">{usd(num(li.u))}</td><td className="n">{usd(num(li.q) * num(li.u))}</td></tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="p-totals">
                        <table>
                          <tbody>
                            <tr><td className="k">Subtotal</td><td className="n">{usd(subtotal)}</td></tr>
                            <tr><td className="k">Tax ({bTax || 0}%)</td><td className="n">{usd(taxAmt)}</td></tr>
                            <tr className="grand"><td>Total</td><td className="n">{usd(subtotal + taxAmt)}</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="p-terms"><b>Terms</b><span>{bTerms}</span></div>
                      <div className="p-emerg">24/7 Emergency breakdown line: <b>832-338-4990</b> — staffed 365 days a year · Office Mon–Fri 6:00am–6:00pm</div>
                    </div>
                    <div className="p-foot"><span>centrifuge.com</span><span>quotes@centrifuge.com</span><span>Rosharon TX · Franklin Park IL · Alsip IL</span><span style={{ marginLeft: 'auto' }}>Page 1 of 1</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---- ROUTING ---- */}
          {tab === 'routing' && (
            <div className="view on">
              <div className="note"><b>Routing rule — locked:</b> every form submission is delivered via the Twilio Email API to <b>all four recipients below</b> in a single batch send. Delivery is confirmed per-recipient by polling the Twilio Operation resource; failures auto-retry with backoff and surface in the Form Lead Tracker.</div>
              <div className="rgrid">
                {[['Mark', 'mark@p5400.com', 'Site admin · primary owner'], ['Ron', 'ron@p5400.com', 'Sales · quote follow-up'], ['David', 'david@p5400.com', 'Operations · scheduling'], ['Cynthia', 'cynthia@p5400.com', 'Office · records & intake']].map(([nm, em, role]) => (
                  <div className="rcard" key={em}><div className="av" style={{ background: 'linear-gradient(135deg,#2F7BF6,#63A5FF)' }}>{nm[0]}</div><div className="nm">{nm}</div><div className="em">{em}</div><div className="role">{role}</div><div className="stat"><span className="dot" /> ROUTED ON EVERY SUBMISSION</div></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== scrim + lead drawer ===== */}
      <div className={`scrim${openLead || openQuote ? ' on' : ''}`} onClick={() => { setOpenLead(null); setOpenQuote(null) }} />

      <div className={`drawer${openLead ? ' on' : ''}`}>
        {openLead && (
          <>
            <div className="drawer-h">
              <button className="x" onClick={() => setOpenLead(null)}>✕</button>
              <h3>{openLead.name}</h3>
              <div className="co">{openLead.company} · {openLead.source}</div>
            </div>
            <div className="drawer-body">
              <div className="dsec"><div className="t">Lead Details</div>
                <div className="kv">
                  <span className="k">Email</span><span className="v mono">{openLead.email || '—'}</span>
                  <span className="k">Phone</span><span className="v mono">{openLead.phone || '—'}</span>
                  <span className="k">Source form</span><span className="v">{openLead.source}</span>
                  <span className="k">Age</span><span className="v mono">{openLead.ageLabel}</span>
                  <span className="k">Est. value</span><span className="v mono">{openLead.estimatedValue ? usd(openLead.estimatedValue) : '—'}</span>
                  {openLead.quoteNumber ? <><span className="k">Linked quote</span><span className="v mono">{openLead.quoteNumber}</span></> : null}
                </div>
              </div>
              <div className="dsec"><div className="t">Message</div><div className="msgbox">{openLead.message || 'No message captured.'}</div></div>
            </div>
            <div className="drawer-f">
              <button className="btn" onClick={() => markContacted(openLead.id)}>Mark Contacted</button>
              <button className="btn primary" onClick={() => startQuoteFor(openLead)}>Create Quote ▸</button>
            </div>
          </>
        )}
      </div>

      {/* ===== record drawer (quote) ===== */}
      <div className={`drawer${openQuote ? ' on' : ''}`}>
        {openQuote && (
          <>
            <div className="drawer-h">
              <button className="x" onClick={() => setOpenQuote(null)}>✕</button>
              <h3>{openQuote.quoteNumber}</h3>
              <div className="co">{openQuote.clientCompany} · {openQuote.clientContact}</div>
            </div>
            <div className="drawer-body">
              <div className="dsec"><div className="t">Record</div>
                <div className="kv">
                  <span className="k">Scope</span><span className="v">{openQuote.scope}</span>
                  <span className="k">Total</span><span className="v mono">{usd(openQuote.total)}</span>
                  <span className="k">Sent</span><span className="v mono">{shortDate(openQuote.sentAt)}</span>
                  <span className="k">Valid until</span><span className="v mono">{shortDate(openQuote.validUntil)}</span>
                  <span className="k">Status</span><span className="v">{openQuote.status}</span>
                </div>
              </div>
            </div>
            <div className="drawer-f">
              <a className="btn primary" href={`/admin/collections/quotes/${openQuote.id}`}>Open full record ▸</a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
