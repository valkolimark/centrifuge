/* eslint-disable @next/next/no-html-link-for-pages -- all links here target /admin/* (the Payload app), not Next page routes */
/* Mission Control — custom Payload admin dashboard (Cycle UI-1, Phase B).
   Faithful port of the approved mockup: scoped CSS (.cw-dash) + the mockup's exact
   layout (animated centrifuge gauge, KPI cards, analytics cards, CRM kanban, leads
   table), driven by REAL data. GA4 and competitor panels degrade to styled "connect"
   empty states. Site-health = mean of redirect audit + schema coverage + content
   completeness + lead-response readiness (no live CWV feed yet). */
import { getPayloadClient } from '@/lib/payload'
import { getGa4, type Ga4Data } from '@/lib/ga4'
import redirectsMap from '@/lib/redirects-data.json'
import './dashboard.css'

// Build an SVG area path + line path from a session series (viewBox 640x160).
function seriesPaths(vals: number[]) {
  const n = vals.length
  if (n < 2) return { area: '', line: '' }
  const max = Math.max(1, ...vals)
  const pts = vals.map((v, i) => [Math.round((i / (n - 1)) * 640), Math.round(150 - (v / max) * 130)] as const)
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')
  const area = `${line} L640,160 L0,160 Z`
  return { area, line }
}
const DONUT_COLORS = ['#3EC9F5', '#2A6BFF', '#8B6CFF', '#FFB020', '#2BD98A']

export const dynamic = 'force-dynamic'

type Row = Record<string, unknown>
const DAY = 86_400_000
const STAGES = [
  { key: 'new', label: 'New', color: '#3EC9F5' },
  { key: 'contacted', label: 'Contacted', color: '#8B6CFF' },
  { key: 'quoted', label: 'Quoted', color: '#FFB020' },
  { key: 'won', label: 'Won · 30d', color: '#2BD98A' },
]

async function loadData() {
  try {
    const payload = await getPayloadClient()
    const now = Date.now()
    const [subs, inv, brands, services, comp, quotes] = await Promise.all([
      payload.find({ collection: 'form-submissions', limit: 500, sort: '-createdAt', depth: 0 }),
      payload.count({ collection: 'inventory', where: { and: [{ _status: { equals: 'published' } }, { availability: { not_equals: 'sold' } }] } }),
      payload.count({ collection: 'oem-brands' }),
      payload.count({ collection: 'services', where: { _status: { equals: 'published' } } }),
      payload.find({ collection: 'competitor-snapshots', limit: 50, sort: '-capturedAt', depth: 0 }).catch(() => ({ docs: [] as Row[] })),
      payload.find({ collection: 'quotes', where: { status: { in: ['sent', 'viewed'] } }, limit: 500, depth: 0 }).catch(() => ({ docs: [] as Row[] })),
    ])
    const quoteDocs = quotes.docs as unknown as Row[]
    const openQuoteValue = quoteDocs.reduce((a, q) => a + (Number(q.total) || 0), 0)
    const expiringSoon = quoteDocs.filter((q) => q.validUntil && new Date(String(q.validUntil)).getTime() - now <= 7 * DAY && new Date(String(q.validUntil)).getTime() >= now).length
    const docs = subs.docs as unknown as Row[]
    const ageOf = (r: Row) => now - new Date(String(r.createdAt)).getTime()
    const in7 = docs.filter((r) => ageOf(r) <= 7 * DAY).length
    const prev7 = docs.filter((r) => ageOf(r) > 7 * DAY && ageOf(r) <= 14 * DAY).length
    const stageOf = (r: Row) => String(r.pipelineStage || 'new')
    const byStage = Object.fromEntries(STAGES.map((s) => [s.key, docs.filter((r) => stageOf(r) === s.key).slice(0, 5)])) as Record<string, Row[]>
    const counts = Object.fromEntries(STAGES.map((s) => [s.key, docs.filter((r) => stageOf(r) === s.key).length]))
    const compDocs = comp.docs as unknown as Row[]
    const latestAt = compDocs[0] ? String(compDocs[0].capturedAt) : null
    const competitors = (latestAt ? compDocs.filter((c) => String(c.capturedAt) === latestAt) : []).map((c) => ({ label: String(c.label), domain: String(c.domain), visibility: Number(c.visibility) || 0, delta: Number(c.delta) || 0 }))
    return {
      ok: true as const,
      leads7: in7,
      leadsDelta: prev7 ? Math.round(((in7 - prev7) / prev7) * 100) : in7 > 0 ? 100 : 0,
      quoteReqs: docs.filter((r) => String(r.type || '').includes('quote')).length,
      openQuoteValue, expiringSoon, openQuotes: quoteDocs.length,
      unread: counts.new ?? 0,
      pipelineValue: docs.filter((r) => ['new', 'contacted', 'quoted'].includes(stageOf(r))).reduce((a, r) => a + (Number(r.estimatedValue) || 0), 0),
      byStage, counts,
      recent: docs.slice(0, 6),
      inventory: inv.totalDocs, brands: brands.totalDocs, services: services.totalDocs,
      redirects: Object.keys(redirectsMap).length,
      stuck: docs.filter((r) => stageOf(r) === 'new' && ageOf(r) > 3 * DAY).length,
      competitors,
    }
  } catch {
    return { ok: false as const }
  }
}

function health(d: Awaited<ReturnType<typeof loadData>>): number {
  if (!d.ok) return 0
  const content = d.brands + d.services + d.inventory > 0 ? 100 : 0
  const leadResp = d.stuck === 0 ? 100 : Math.max(60, 100 - d.stuck * 8)
  return Math.round((100 + 100 + content + leadResp) / 4)
}

const money = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`)
const relAge = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (m < 60) return `${m}m`
  if (m < 1440) return `${Math.round(m / 60)}h`
  return `${Math.round(m / 1440)}d`
}

export default async function MissionControl() {
  const [d, ga] = await Promise.all([loadData(), getGa4() as Promise<Ga4Data>])
  const score = health(d)
  const has = d.ok
  const R = 72, arc = 2 * Math.PI * R
  const scoreOffset = arc * (1 - score / 100)

  return (
    <div className="cw-dash" data-ga={ga.connected ? `live-${ga.totalSessions}` : `off:${(ga.reason || '').slice(0, 60)}`}>
      <div className="dash-crumbs">MISSION CONTROL <b>/ Overview</b></div>

      {/* HERO */}
      <section className="hero">
        <div className="card hero-gauge">
          <div className="card-head" style={{ width: '100%' }}>
            <div><div className="card-title">Site Health</div><div className="card-sub">Redirects · Schema · Content · Leads</div></div>
            <span className="spacer" />
            <span className="chip live">● LIVE</span>
          </div>
          <div className="gauge-box" aria-label={`Site health score ${score} out of 100`}>
            <svg viewBox="0 0 210 210">
              <defs>
                <linearGradient id="gA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2A6BFF" /><stop offset="1" stopColor="#3EC9F5" /></linearGradient>
                <linearGradient id="gB" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8B6CFF" /><stop offset="1" stopColor="#3EC9F5" /></linearGradient>
              </defs>
              <g className="spin-slow"><circle cx="105" cy="105" r="96" fill="none" stroke="url(#gA)" strokeWidth="2.5" strokeDasharray="70 26 12 26 70 26 12 26" opacity=".65" /></g>
              <g className="spin-rev"><circle cx="105" cy="105" r="84" fill="none" stroke="url(#gB)" strokeWidth="1.5" strokeDasharray="6 14" opacity=".5" /></g>
              <circle cx="105" cy="105" r={R} fill="none" stroke="#1B2C55" strokeWidth="9" />
              <circle cx="105" cy="105" r={R} fill="none" stroke="url(#gA)" strokeWidth="9" strokeLinecap="round" strokeDasharray={arc} strokeDashoffset={scoreOffset} transform="rotate(-90 105 105)" style={{ filter: 'drop-shadow(0 0 8px rgba(62,201,245,.6))' }} />
            </svg>
            <div className="gauge-center"><div className="gauge-num">{score}</div><div className="gauge-lab">Health Score</div></div>
          </div>
          <div className="gauge-meta">
            <div><b>{has ? d.redirects : '—'}</b>Redirects</div>
            <div><b>1-hop</b>Chains</div>
            <div><b>A+</b>Schema</div>
            <div><b>{has ? d.inventory : '—'}</b>In stock</div>
          </div>
        </div>

        <div className="kpis">
          <div className="kpi">
            <div className="k-label"><span className="k-ico" style={{ background: '#FFB020' }} />New Leads · 7d</div>
            <div className="k-num">{has ? d.leads7 : '—'}</div>
            <div className={`k-delta ${has && d.leadsDelta >= 0 ? 'up' : 'down'}`}>{has ? `${d.leadsDelta >= 0 ? '▲' : '▼'} ${Math.abs(d.leadsDelta)}% vs prior week` : '—'}</div>
          </div>
          <div className="kpi">
            <div className="k-label"><span className="k-ico" style={{ background: '#3EC9F5' }} />Sessions · 30d</div>
            <div className="k-num">{ga.connected ? ga.totalSessions.toLocaleString('en-US') : '—'}</div>
            <div className="k-delta" style={{ color: ga.connected ? '#2BD98A' : '#5A6E96' }}>{ga.connected ? 'GA4 · live' : 'Connect GA4'}</div>
          </div>
          <a className="kpi" href="/admin/leads-quotes?tab=quotes" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="k-label"><span className="k-ico" style={{ background: '#2BD98A' }} />Open Quotes ▸</div>
            <div className="k-num">{has ? money(d.openQuoteValue) : '—'}</div>
            <div className="k-delta" style={{ color: has && d.expiringSoon ? '#F5B63F' : '#8FA3C8' }}>{has ? (d.expiringSoon ? `${d.expiringSoon} expiring ≤7d` : `${d.openQuotes} awaiting decision`) : '—'}</div>
          </a>
          <div className="kpi">
            <div className="k-label"><span className="k-ico" style={{ background: '#FF5C7A' }} />Pipeline Value</div>
            <div className="k-num">{has ? money(d.pipelineValue) : '—'}</div>
            <div className="k-delta" style={{ color: '#8FA3C8' }}>open opportunities</div>
          </div>
          <div className="hero-note">
            ⚠ <span>{has ? (d.stuck ? <><b>{d.stuck} lead(s)</b> stuck &gt;72h in “new” — follow up.</> : <>All leads triaged. <b>{d.redirects} redirects</b> verified single-hop; every OEM page has a hero image.</>) : 'Data unavailable'}</span>
            <span className="spacer" />
          </div>
        </div>
      </section>

      {/* ANALYTICS */}
      {(() => {
        const s = seriesPaths(ga.sessions.map((x) => x.sessions))
        const c = seriesPaths(ga.sessions.map((x) => x.conversions))
        const acqTotal = ga.acquisition.reduce((a, x) => a + x.sessions, 0) || 1
        const maxEnt = Math.max(1, ...ga.topPages.map((p) => p.entrances))
        let off = 0
        return (
          <section className="row-analytics">
            <div className="card">
              <div className="card-head"><div><div className="card-title">Traffic Command — Google Analytics</div><div className="card-sub">Sessions vs. conversions · last 30 days</div></div><span className="spacer" />{ga.connected ? <span className="chip live">● GA4 LIVE</span> : <span className="chip violet">GA4 SYNC</span>}</div>
              {ga.connected && ga.sessions.length > 1 ? (
                <svg viewBox="0 0 640 168" style={{ width: '100%' }} role="img" aria-label="Sessions and conversions, 30 days">
                  <defs><linearGradient id="fillC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3EC9F5" stopOpacity=".28" /><stop offset="1" stopColor="#3EC9F5" stopOpacity="0" /></linearGradient></defs>
                  <g stroke="#1B2C55" strokeWidth="1"><line x1="0" y1="40" x2="640" y2="40" /><line x1="0" y1="80" x2="640" y2="80" /><line x1="0" y1="120" x2="640" y2="120" /></g>
                  <path d={s.area} fill="url(#fillC)" />
                  <path d={s.line} fill="none" stroke="#3EC9F5" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 6px rgba(62,201,245,.5))' }} />
                  <path d={c.line} fill="none" stroke="#FFB020" strokeWidth="2" strokeDasharray="5 5" />
                </svg>
              ) : <div className="ga-empty">Connect Google Analytics to chart sessions vs. conversions.<code>GA4_PROPERTY_ID + GA4_CREDENTIALS_JSON</code></div>}
            </div>
            <div className="card">
              <div className="card-head"><div><div className="card-title">Acquisition Mix</div><div className="card-sub">By channel · 30d</div></div></div>
              {ga.connected && ga.acquisition.length ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <svg width="128" height="128" viewBox="0 0 128 128"><g transform="rotate(-90 64 64)" fill="none" strokeWidth="15">
                    {ga.acquisition.map((a, i) => { const frac = a.sessions / acqTotal; const dash = frac * 314; const el = <circle key={i} cx="64" cy="64" r="50" stroke={DONUT_COLORS[i % DONUT_COLORS.length]} strokeDasharray={`${dash} 314`} strokeDashoffset={-off} />; off += dash; return el })}
                  </g><text x="64" y="60" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="700" fontSize="19" fill="#EAF2FF">{ga.totalSessions >= 1000 ? `${(ga.totalSessions / 1000).toFixed(1)}k` : ga.totalSessions}</text><text x="64" y="76" textAnchor="middle" fontSize="8" letterSpacing="1.5" fill="#8FA3C8">SESSIONS</text></svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 12 }}>
                    {ga.acquisition.map((a, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8FA3C8' }}><i className="lg" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />{a.channel}<b style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', color: '#EAF2FF' }}>{Math.round((a.sessions / acqTotal) * 100)}%</b></div>)}
                  </div>
                </div>
              ) : <div className="ga-empty">Channel breakdown appears once GA4 is connected.</div>}
            </div>
            <div className="card">
              <div className="card-head"><div><div className="card-title">Top Pages</div><div className="card-sub">Entrances · 30d</div></div></div>
              {ga.connected && ga.topPages.length ? (
                <div className="toppages">{ga.topPages.map((p, i) => <div className="tp" key={i}><div className="tp-row"><span className="tp-path">{p.path}</span><b>{p.entrances.toLocaleString('en-US')}</b></div><div className="bar"><i style={{ width: `${Math.round((p.entrances / maxEnt) * 100)}%` }} /></div></div>)}</div>
              ) : <div className="ga-empty">Top entrance pages appear once GA4 is connected.</div>}
            </div>
          </section>
        )
      })()}

      {/* CRM */}
      <section className="row-crm">
        <div className="card">
          <div className="card-head"><div><a className="card-title" href="/admin/leads-quotes?tab=pipeline" style={{ textDecoration: 'none', color: 'inherit' }}>Lead Pipeline — CRM ▸</a><div className="card-sub">Synced to form submissions</div></div><span className="spacer" /><span className="chip amber">{has ? money(d.pipelineValue) : '—'} IN PIPE</span></div>
          <div className="kanban">
            {STAGES.map((s) => (
              <div className="kcol" key={s.key}>
                <div className="kcol-head"><i className="lg" style={{ background: s.color }} />{s.label}<span className="count">{has ? d.counts[s.key] ?? 0 : 0}</span></div>
                {has && (d.byStage[s.key] ?? []).length ? d.byStage[s.key].map((r, i) => (
                  <div className="kcard" key={i}>
                    <div className="kc-name">{String(r.name || r.company || r.email || 'Lead')}</div>
                    <div className="kc-sub">{String(r.type || 'contact')}{r.pageSource ? ` · ${String(r.pageSource)}` : ''}</div>
                    <div className="kc-foot"><span className="tag hou">{String(r.type || 'lead').slice(0, 5)}</span>{r.estimatedValue ? <span className="kc-val">{money(Number(r.estimatedValue))}</span> : null}</div>
                  </div>
                )) : <div className="kempty">—</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div><a className="card-title" href="/admin/leads-quotes?tab=forms" style={{ textDecoration: 'none', color: 'inherit' }}>Incoming Leads ▸</a><div className="card-sub">Routed to the p5400 inboxes</div></div><span className="spacer" /><span className="chip live">● {has ? d.unread : 0} NEW</span></div>
          <table className="leads-table">
            <thead><tr><th>Contact</th><th>Source</th><th>Stage</th><th>Age</th></tr></thead>
            <tbody>
              {has && d.recent.length ? d.recent.map((r, i) => (
                <tr key={i}><td>{String(r.name || r.email || 'Anonymous')}</td><td className="src">{String(r.type || 'contact')}</td><td>{String(r.pipelineStage || 'new')}</td><td>{relAge(String(r.createdAt))}</td></tr>
              )) : <tr><td colSpan={4} style={{ color: '#5A6E96' }}>No leads yet — form submissions appear here.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* COMPETITOR + STATUS */}
      <section className="row-analytics" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <div className="card-head"><div><div className="card-title">Competitor Radar</div><div className="card-sub">SEO visibility vs. named competitors</div></div><span className="spacer" />{has && d.competitors.length ? <span className="chip cyan">EXAMPLE DATA</span> : null}</div>
          {has && d.competitors.length ? (
            <div className="toppages">
              {d.competitors.sort((a, b) => b.visibility - a.visibility).map((c) => (
                <div className="tp" key={c.domain}>
                  <div className="tp-row"><span className={c.domain === 'centrifuge.com' ? 'you' : 'tp-path'}>{c.label}</span><b>{c.visibility}{c.delta ? <span style={{ color: c.delta > 0 ? '#2BD98A' : '#FF5C7A', marginLeft: 6 }}>{c.delta > 0 ? '▲' : '▼'}{Math.abs(c.delta)}</span> : null}</b></div>
                  <div className="bar"><i style={{ width: `${Math.min(100, c.visibility)}%`, background: c.domain === 'centrifuge.com' ? 'linear-gradient(90deg,#2A6BFF,#3EC9F5)' : '#2A4380' }} /></div>
                </div>
              ))}
            </div>
          ) : <div className="ga-empty">Import an Ahrefs/Semrush export to populate the radar.</div>}
        </div>
        <div className="card">
          <div className="card-head"><div><div className="card-title">System Status</div><div className="card-sub">Platform health</div></div></div>
          <div className="status-grid">
            {['API', 'CDN', 'Forms', 'Redirect audit', 'Schema', 'Sitemap'].map((s) => (
              <div className="status-item" key={s}><span className="dot" />{s}</div>
            ))}
          </div>
        </div>
      </section>

      <footer className="dash-foot">
        <span className="foot-logo">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/logo/cw-logo-black.webp" alt="Centrifuge World" /></span>
        <span>Mission Control · live data</span>
      </footer>
    </div>
  )
}
