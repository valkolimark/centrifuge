// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client'
/* eslint-disable */
/* Leads & Quotes workspace (Cycle UI-2) — pixel-faithful port of
   mockups/centrifuge-world-leads-quotes-mockup.html. The mockup markup is rendered
   verbatim and its interaction script runs once on mount, scoped to this component's
   root so ids never collide with the surrounding Payload admin DOM. Real-data wiring
   layers on top of this shell in later steps. */
import { useEffect, useRef } from 'react'
import './leads-quotes.css'

const BODY_HTML = `<div class="app">

  <!-- ============ TOPBAR ============ -->
  <div class="topbar">
    <div class="lockup">
      <div class="mark">
        <svg viewBox="0 0 147 148" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#63A5FF"/><stop offset="1" stop-color="#2F7BF6"/></linearGradient></defs>
          <path d="M73.5 8C38 8 9 37.3 9 74c0 36.7 29 66 64.5 66 27 0 50-16.8 59.6-40.6-8.4 13.5-23.3 22.5-40.2 22.5-26.2 0-47.5-21.4-47.5-47.9S66.7 26 92.9 26c16.9 0 31.8 9 40.2 22.6C123.5 24.8 100.5 8 73.5 8z" fill="url(#g1)"/>
          <circle cx="92" cy="74" r="20" fill="none" stroke="url(#g1)" stroke-width="9"/>
        </svg>
      </div>
      <div class="wordmark"><b>CENTRIFUGE <i>world</i></b><span>Estd 1939 · Mission Control</span></div>
    </div>
    <div class="crumb">
      <a href="/admin">◂ Dashboard</a>
      <span class="sep">/</span>
      <span class="here">Leads &amp; Quotes</span>
    </div>
    <div class="grow"></div>
    <div class="tw-status"><span class="dot"></span> TWILIO EMAIL · SENDER VERIFIED</div>
    <div class="tw-status"><span class="dot"></span> FORMS API</div>
    <div class="user">M</div>
  </div>

  <!-- ============ ICON RAIL ============ -->
  <div class="rail">
    <button title="Dashboard"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg></button>
    <button class="on" title="Leads &amp; Quotes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></button>
    <button title="Content Studio"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
    <button title="Resources / PDF Studio"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></button>
    <div class="spacer"></div>
    <button title="Settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
  </div>

  <!-- ============ MAIN ============ -->
  <div class="main">
    <div class="subnav">
      <button class="on" data-tab="pipeline">Pipeline <span class="count">23</span></button>
      <button data-tab="forms">Form Leads <span class="count">9 new</span></button>
      <button data-tab="quotes">Quotes <span class="count">31</span></button>
      <button data-tab="archive">Archive <span class="count">309</span></button>
      <button data-tab="builder">Quote Builder</button>
      <button data-tab="routing">Routing &amp; Delivery</button>
      <div class="grow"></div>
      <button class="btn primary" id="newQuoteBtn">＋ New Quote</button>
    </div>

    <!-- ============ VIEW: PIPELINE ============ -->
    <div class="view on" data-view="pipeline">
      <div class="kpis">
        <div class="kpi"><div class="lbl">New Leads · 7d</div><div class="val">14</div><div class="sub"><b>▲ 27%</b> vs prior week</div></div>
        <div class="kpi"><div class="lbl">Open Quote Value</div><div class="val">$212,450</div><div class="sub">11 quotes awaiting decision</div></div>
        <div class="kpi"><div class="lbl">Quote Win Rate · 90d</div><div class="val">41%</div><div class="sub"><b>▲ 6 pts</b> vs prior 90d</div></div>
        <div class="kpi"><div class="lbl">Avg First Response</div><div class="val">1h 48m</div><div class="sub"><b class="down">▼ target &lt; 1h</b> business hours</div></div>
      </div>

      <div class="board">
        <div class="col">
          <div class="col-h"><span class="bar" style="background:var(--blue2)"></span><span class="nm">New</span><span class="n">5 · $38.5k</span></div>
          <div class="col-body">
            <div class="card" data-lead="l1"><div class="who">Dale Herrera</div><div class="co">Gulf Coast Rendering</div><div class="meta"><span class="tag quote">Quote Req</span><span class="val">~$18k</span><span class="age hot">3h</span></div></div>
            <div class="card" data-lead="l2"><div class="who">Priya Nair</div><div class="co">Midwest Water Reclamation</div><div class="meta"><span class="tag contact">Contact</span><span class="age">7h</span></div></div>
            <div class="card"><div class="who">Tom Okafor</div><div class="co">LoneStar Chemical</div><div class="meta"><span class="tag emergency">Emergency</span><span class="age hot">22m</span></div></div>
            <div class="card"><div class="who">S. Villarreal</div><div class="co">Port Arthur Marine Fuels</div><div class="meta"><span class="tag quote">Quote Req</span><span class="val">~$20k</span><span class="age">1d</span></div></div>
            <div class="card"><div class="who">Jen Kowalski</div><div class="co">Prairie Dairy Co-op</div><div class="meta"><span class="tag phone">Phone-in</span><span class="age">1d</span></div></div>
          </div>
        </div>
        <div class="col">
          <div class="col-h"><span class="bar" style="background:var(--cyan)"></span><span class="nm">Contacted</span><span class="n">4 · $61k</span></div>
          <div class="col-body">
            <div class="card"><div class="who">Marcus Bell</div><div class="co">Illinois Ethanol Partners</div><div class="meta"><span class="tag quote">Quote Req</span><span class="val">~$34k</span><span class="age">2d</span></div></div>
            <div class="card"><div class="who">R. Gutierrez</div><div class="co">Bayou Proteins</div><div class="meta"><span class="tag contact">Contact</span><span class="val">~$12k</span><span class="age">2d</span></div></div>
            <div class="card"><div class="who">Ann Whitfield</div><div class="co">Great Lakes Biosolids</div><div class="meta"><span class="tag quote">Quote Req</span><span class="val">~$15k</span><span class="age">3d</span></div></div>
            <div class="card"><div class="who">Chris Deng</div><div class="co">Chicago Metal Finishing</div><div class="meta"><span class="tag phone">Phone-in</span><span class="age">4d</span></div></div>
          </div>
        </div>
        <div class="col">
          <div class="col-h"><span class="bar" style="background:var(--violet)"></span><span class="nm">Quoting</span><span class="n">3 · $47k</span></div>
          <div class="col-body">
            <div class="card"><div class="who">Hannah Brooks</div><div class="co">Sugarland Food Processing</div><div class="meta"><span class="tag quote">Quote Req</span><span class="val">$23,900</span><span class="age">1d</span></div></div>
            <div class="card"><div class="who">Victor Osei</div><div class="co">TriState Wastewater JV</div><div class="meta"><span class="tag contact">Contact</span><span class="val">$14,200</span><span class="age">2d</span></div></div>
            <div class="card"><div class="who">L. Fontenot</div><div class="co">Acadiana Oil Recovery</div><div class="meta"><span class="tag phone">Phone-in</span><span class="val">$9,100</span><span class="age">3d</span></div></div>
          </div>
        </div>
        <div class="col">
          <div class="col-h"><span class="bar" style="background:var(--warn)"></span><span class="nm">Quote Sent</span><span class="n">6 · $128k</span></div>
          <div class="col-body">
            <div class="card"><div class="who">D. Kaminski</div><div class="co">Calumet Rendering Works</div><div class="meta"><span class="tag quote">CW-Q-2026-0141</span><span class="val">$48,750</span><span class="age hot">9d</span></div></div>
            <div class="card"><div class="who">Grace Lindqvist</div><div class="co">NorthShore Pharma</div><div class="meta"><span class="tag quote">CW-Q-2026-0143</span><span class="val">$31,200</span><span class="age">4d</span></div></div>
            <div class="card"><div class="who">Omar Haddad</div><div class="co">Gulf Marine Services</div><div class="meta"><span class="tag quote">CW-Q-2026-0144</span><span class="val">$22,600</span><span class="age">3d</span></div></div>
            <div class="card"><div class="who">Kelly Nguyen</div><div class="co">Brazos Poultry</div><div class="meta"><span class="tag quote">CW-Q-2026-0146</span><span class="val">$25,450</span><span class="age">1d</span></div></div>
          </div>
        </div>
        <div class="col">
          <div class="col-h"><span class="bar" style="background:var(--ok)"></span><span class="nm">Won</span><span class="n">3 · $96k</span></div>
          <div class="col-body">
            <div class="card"><div class="who">P. Almeida</div><div class="co">Des Plaines Utility Dist.</div><div class="meta"><span class="tag quote">CW-Q-2026-0137</span><span class="val">$52,000</span></div></div>
            <div class="card"><div class="who">J. Thibodeaux</div><div class="co">Sabine River Chem</div><div class="meta"><span class="tag quote">CW-Q-2026-0139</span><span class="val">$29,800</span></div></div>
            <div class="card"><div class="who">M. Stein</div><div class="co">Alsip Rendering LLC</div><div class="meta"><span class="tag quote">CW-Q-2026-0140</span><span class="val">$14,600</span></div></div>
          </div>
        </div>
        <div class="col">
          <div class="col-h"><span class="bar" style="background:var(--bad)"></span><span class="nm">Lost</span><span class="n">2</span></div>
          <div class="col-body">
            <div class="card"><div class="who">B. Radcliffe</div><div class="co">Heartland Grain Oils</div><div class="meta"><span class="tag quote">CW-Q-2026-0135</span><span class="val">$19,300</span></div></div>
            <div class="card"><div class="who">T. Marsh</div><div class="co">Ohio Valley Paper</div><div class="meta"><span class="tag quote">CW-Q-2026-0136</span><span class="val">$8,900</span></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ VIEW: FORM LEADS ============ -->
    <div class="view" data-view="forms">
      <div class="panel">
        <div class="panel-h">
          <h3>Form Lead Tracker</h3>
          <span class="mono">every submission → routed via Twilio Email to all 4 recipients</span>
          <div class="grow"></div>
          <div class="chips" id="formChips">
            <button class="chip on" data-f="all">All</button>
            <button class="chip" data-f="quote">Quote Request</button>
            <button class="chip" data-f="contact">Contact</button>
            <button class="chip" data-f="emergency">Emergency Service</button>
          </div>
        </div>
        <table>
          <thead><tr><th>Received</th><th>Form</th><th>Lead</th><th>Message</th><th>Routed To</th><th>Pipeline</th><th></th></tr></thead>
          <tbody id="formRows">
            <tr class="row" data-f="emergency" data-lead="l3">
              <td class="mono">Today 09:14</td>
              <td><span class="tag emergency">Emergency</span></td>
              <td><div class="who">Tom Okafor</div><div class="co">LoneStar Chemical · Rosharon TX</div></td>
              <td><div class="msg">Decanter down on line 2, vibration alarm then hard stop. Need on-call tech today…</div></td>
              <td><div class="route"><span class="rd ok" data-tip="mark@p5400.com · delivered 09:14">M</span><span class="rd ok" data-tip="ron@p5400.com · delivered 09:14">R</span><span class="rd ok" data-tip="david@p5400.com · delivered 09:15">D</span><span class="rd ok" data-tip="cynthia@p5400.com · delivered 09:14">C</span></div></td>
              <td><span class="pill new">New</span></td>
              <td><button class="btn sm">Open</button></td>
            </tr>
            <tr class="row" data-f="quote" data-lead="l1">
              <td class="mono">Today 06:41</td>
              <td><span class="tag quote">Quote Req</span></td>
              <td><div class="who">Dale Herrera</div><div class="co">Gulf Coast Rendering</div></td>
              <td><div class="msg">Alfa Laval AVNX 4550 rebuild — scroll rebuild, hard surfacing, new bearings. Down mid-August…</div></td>
              <td><div class="route"><span class="rd ok" data-tip="mark@p5400.com · delivered 06:41">M</span><span class="rd ok" data-tip="ron@p5400.com · delivered 06:41">R</span><span class="rd q" data-tip="david@p5400.com · queued (Twilio op pending)">D</span><span class="rd ok" data-tip="cynthia@p5400.com · delivered 06:42">C</span></div></td>
              <td><span class="pill new">New</span></td>
              <td><button class="btn sm">Open</button></td>
            </tr>
            <tr class="row" data-f="contact" data-lead="l2">
              <td class="mono">Today 02:58</td>
              <td><span class="tag contact">Contact</span></td>
              <td><div class="who">Priya Nair</div><div class="co">Midwest Water Reclamation</div></td>
              <td><div class="msg">Looking for a preventative maintenance program across three Westfalia separators…</div></td>
              <td><div class="route"><span class="rd ok" data-tip="mark@p5400.com · delivered 02:58">M</span><span class="rd ok" data-tip="ron@p5400.com · delivered 02:58">R</span><span class="rd ok" data-tip="david@p5400.com · delivered 02:59">D</span><span class="rd ok" data-tip="cynthia@p5400.com · delivered 02:58">C</span></div></td>
              <td><span class="pill new">New</span></td>
              <td><button class="btn sm">Open</button></td>
            </tr>
            <tr class="row" data-f="quote">
              <td class="mono">Yesterday 16:22</td>
              <td><span class="tag quote">Quote Req</span></td>
              <td><div class="who">S. Villarreal</div><div class="co">Port Arthur Marine Fuels</div></td>
              <td><div class="msg">Quote to rebuild two Mitsubishi SJ-series purifiers, spares list attached…</div></td>
              <td><div class="route"><span class="rd ok" data-tip="mark@p5400.com · delivered 16:22">M</span><span class="rd ok" data-tip="ron@p5400.com · delivered 16:22">R</span><span class="rd ok" data-tip="david@p5400.com · delivered 16:22">D</span><span class="rd f" data-tip="cynthia@p5400.com · bounced — retried 16:31 ✓">C</span></div></td>
              <td><span class="pill new">New</span></td>
              <td><button class="btn sm">Open</button></td>
            </tr>
            <tr class="row" data-f="contact">
              <td class="mono">Yesterday 11:05</td>
              <td><span class="tag contact">Contact</span></td>
              <td><div class="who">Marcus Bell</div><div class="co">Illinois Ethanol Partners</div></td>
              <td><div class="msg">Do you service Flottweg Z6E units out of the Franklin Park shop? Timeline for…</div></td>
              <td><div class="route"><span class="rd ok" data-tip="mark@p5400.com · delivered 11:05">M</span><span class="rd ok" data-tip="ron@p5400.com · delivered 11:05">R</span><span class="rd ok" data-tip="david@p5400.com · delivered 11:05">D</span><span class="rd ok" data-tip="cynthia@p5400.com · delivered 11:05">C</span></div></td>
              <td><span class="pill sent">Contacted</span></td>
              <td><button class="btn sm">Open</button></td>
            </tr>
            <tr class="row" data-f="quote">
              <td class="mono">Jul 02 14:37</td>
              <td><span class="tag quote">Quote Req</span></td>
              <td><div class="who">Hannah Brooks</div><div class="co">Sugarland Food Processing</div></td>
              <td><div class="msg">GEA CF 4000 — annual overhaul plus bowl balancing. Prefer Rosharon pickup…</div></td>
              <td><div class="route"><span class="rd ok" data-tip="mark@p5400.com · delivered 14:37">M</span><span class="rd ok" data-tip="ron@p5400.com · delivered 14:37">R</span><span class="rd ok" data-tip="david@p5400.com · delivered 14:37">D</span><span class="rd ok" data-tip="cynthia@p5400.com · delivered 14:37">C</span></div></td>
              <td><span class="pill viewed">Quoting</span></td>
              <td><button class="btn sm">Open</button></td>
            </tr>
            <tr class="row" data-f="emergency">
              <td class="mono">Jul 01 22:11</td>
              <td><span class="tag emergency">Emergency</span></td>
              <td><div class="who">Night Shift Supv.</div><div class="co">Calumet Rendering Works</div></td>
              <td><div class="msg">After-hours: centrate quality collapsed, suspect scroll wear. On-call line contacted…</div></td>
              <td><div class="route"><span class="rd ok" data-tip="mark@p5400.com · delivered 22:11">M</span><span class="rd ok" data-tip="ron@p5400.com · delivered 22:11">R</span><span class="rd ok" data-tip="david@p5400.com · delivered 22:11">D</span><span class="rd ok" data-tip="cynthia@p5400.com · delivered 22:11">C</span></div></td>
              <td><span class="pill accepted">Resolved</span></td>
              <td><button class="btn sm">Open</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ============ VIEW: QUOTES ============ -->
    <div class="view" data-view="quotes">
      <div class="kpis" style="grid-template-columns:repeat(4,1fr)">
        <div class="kpi"><div class="lbl">Outstanding</div><div class="val">$128,000</div><div class="sub">6 quotes sent, awaiting decision</div></div>
        <div class="kpi"><div class="lbl">Accepted · 90d</div><div class="val">$96,400</div><div class="sub"><b>▲ 41%</b> acceptance rate</div></div>
        <div class="kpi"><div class="lbl">Avg Quote Age</div><div class="val">4.2d</div><div class="sub">before decision or expiry</div></div>
        <div class="kpi"><div class="lbl">Expiring Soon</div><div class="val">2</div><div class="sub">within 7 days — follow up</div></div>
      </div>
      <div class="panel">
        <div class="panel-h">
          <h3>Quote Archive</h3>
          <span class="mono">immutable snapshot per send · every version retained</span>
          <div class="grow"></div>
          <input id="qSearch" placeholder="Search quote #, client, scope…" style="background:var(--bg);border:1px solid var(--line2);border-radius:8px;color:var(--ink);padding:7px 12px;font-family:var(--body);font-size:12px;width:230px">
        </div>
        <div class="panel-h" style="padding-top:10px;padding-bottom:10px">
          <div class="chips" id="yearChips">
            <button class="chip on" data-y="all">All Years</button>
            <button class="chip" data-y="2026">2026 <span style="opacity:.6">· 47</span></button>
            <button class="chip" data-y="2025">2025 <span style="opacity:.6">· 112</span></button>
            <button class="chip" data-y="2024">2024 <span style="opacity:.6">· 98</span></button>
          </div>
          <div class="grow"></div>
          <div class="chips" id="qChips">
            <button class="chip on" data-q="all">All</button>
            <button class="chip" data-q="draft">Draft</button>
            <button class="chip" data-q="sent">Sent</button>
            <button class="chip" data-q="viewed">Viewed</button>
            <button class="chip" data-q="accepted">Accepted</button>
            <button class="chip" data-q="declined">Declined</button>
            <button class="chip" data-q="expired">Expired</button>
          </div>
        </div>
        <table>
          <thead><tr><th>Quote №</th><th>Client</th><th>Scope</th><th>Total</th><th>Sent</th><th>Valid Until</th><th>Status</th><th></th></tr></thead>
          <tbody id="qRows">
            <tr class="row" data-year="2026" data-q="draft"><td class="mono">CW-Q-2026-0147</td><td><div class="who">Sugarland Food Processing</div><div class="co">Hannah Brooks</div></td><td><div class="msg">GEA CF 4000 annual overhaul + bowl balancing</div></td><td class="mono">$23,900</td><td class="mono">—</td><td class="mono">—</td><td><span class="pill draft">Draft v2</span></td><td><button class="btn sm">Edit</button></td></tr>
            <tr class="row" data-year="2026" data-q="viewed"><td class="mono">CW-Q-2026-0146</td><td><div class="who">Brazos Poultry</div><div class="co">Kelly Nguyen</div></td><td><div class="msg">Sharples P3400 decanter rebuild, exchange rotating assembly</div></td><td class="mono">$25,450</td><td class="mono">Jul 04</td><td class="mono">Aug 03</td><td><span class="pill viewed">Viewed 2×</span></td><td><button class="btn sm">Open</button></td></tr>
            <tr class="row" data-year="2026" data-q="sent"><td class="mono">CW-Q-2026-0144</td><td><div class="who">Gulf Marine Services</div><div class="co">Omar Haddad</div></td><td><div class="msg">Two Mitsubishi SJ purifier rebuilds + spares kit</div></td><td class="mono">$22,600</td><td class="mono">Jul 02</td><td class="mono">Aug 01</td><td><span class="pill sent">Sent</span></td><td><button class="btn sm">Resend</button></td></tr>
            <tr class="row" data-year="2026" data-q="viewed"><td class="mono">CW-Q-2026-0143</td><td><div class="who">NorthShore Pharma</div><div class="co">Grace Lindqvist</div></td><td><div class="msg">Westfalia SA-20 separator overhaul, cleanroom spec</div></td><td class="mono">$31,200</td><td class="mono">Jul 01</td><td class="mono">Jul 31</td><td><span class="pill viewed">Viewed</span></td><td><button class="btn sm">Open</button></td></tr>
            <tr class="row" data-year="2026" data-q="sent"><td class="mono">CW-Q-2026-0141</td><td><div class="who">Calumet Rendering Works</div><div class="co">D. Kaminski</div></td><td><div class="msg">Alfa Laval NX 944 full rebuild + gearbox exchange</div></td><td class="mono">$48,750</td><td class="mono">Jun 26</td><td class="mono">Jul 26</td><td><span class="pill sent">Sent · 9d</span></td><td><button class="btn sm">Resend</button></td></tr>
            <tr class="row" data-year="2026" data-q="accepted"><td class="mono">CW-Q-2026-0140</td><td><div class="who">Alsip Rendering LLC</div><div class="co">M. Stein</div></td><td><div class="msg">Bird 3500 conveyor re-tile + bearing set</div></td><td class="mono">$14,600</td><td class="mono">Jun 24</td><td class="mono">Jul 24</td><td><span class="pill accepted">Accepted</span></td><td><button class="btn sm">Open</button></td></tr>
            <tr class="row" data-year="2026" data-q="accepted"><td class="mono">CW-Q-2026-0139</td><td><div class="who">Sabine River Chem</div><div class="co">J. Thibodeaux</div></td><td><div class="msg">Flottweg Z4E rebuild, hard-surface scroll flights</div></td><td class="mono">$29,800</td><td class="mono">Jun 20</td><td class="mono">Jul 20</td><td><span class="pill accepted">Accepted</span></td><td><button class="btn sm">Open</button></td></tr>
            <tr class="row" data-year="2026" data-q="accepted"><td class="mono">CW-Q-2026-0137</td><td><div class="who">Des Plaines Utility Dist.</div><div class="co">P. Almeida</div></td><td><div class="msg">Two Humboldt S3-1 decanters, staged rebuild program</div></td><td class="mono">$52,000</td><td class="mono">Jun 15</td><td class="mono">Jul 15</td><td><span class="pill accepted">Accepted</span></td><td><button class="btn sm">Open</button></td></tr>
            <tr class="row" data-year="2026" data-q="declined"><td class="mono">CW-Q-2026-0136</td><td><div class="who">Ohio Valley Paper</div><div class="co">T. Marsh</div></td><td><div class="msg">Sharples DS-706 screen bowl inspection + repair</div></td><td class="mono">$8,900</td><td class="mono">Jun 12</td><td class="mono">Jul 12</td><td><span class="pill declined">Declined</span></td><td><button class="btn sm">Open</button></td></tr>
            <tr class="row" data-year="2026" data-q="expired"><td class="mono">CW-Q-2026-0131</td><td><div class="who">Heartland Grain Oils</div><div class="co">B. Radcliffe</div></td><td><div class="msg">Tricanter rebuild — superseded by rev 0135</div></td><td class="mono">$19,300</td><td class="mono">May 30</td><td class="mono">Jun 29</td><td><span class="pill expired">Expired</span></td><td><button class="btn sm">Duplicate</button></td></tr>
            <tr class="row" data-year="2025" data-q="accepted"><td class="mono">CW-Q-2025-0208</td><td><div class="who">Des Plaines Utility Dist.</div><div class="co">P. Almeida</div></td><td><div class="msg">Humboldt S3-1 decanter #1 rebuild — phase one of program</div></td><td class="mono">$49,500</td><td class="mono">Nov 2025</td><td class="mono">Dec 2025</td><td><span class="pill accepted">Accepted</span></td><td><button class="btn sm">Open</button></td></tr>
            <tr class="row" data-year="2025" data-q="declined"><td class="mono">CW-Q-2025-0164</td><td><div class="who">Gulf Coast Rendering</div><div class="co">Dale Herrera</div></td><td><div class="msg">Alfa Laval AVNX 4550 inspection & gearbox exchange</div></td><td class="mono">$11,750</td><td class="mono">Aug 2025</td><td class="mono">Sep 2025</td><td><span class="pill declined">Declined</span></td><td><button class="btn sm">Duplicate</button></td></tr>
            <tr class="row" data-year="2024" data-q="accepted"><td class="mono">CW-Q-2024-0091</td><td><div class="who">Sugarland Food Processing</div><div class="co">Hannah Brooks</div></td><td><div class="msg">GEA CF 4000 annual overhaul — prior year service</div></td><td class="mono">$21,300</td><td class="mono">Jun 2024</td><td class="mono">Jul 2024</td><td><span class="pill accepted">Accepted</span></td><td><button class="btn sm">Open</button></td></tr>
            <tr class="row" data-year="2024" data-q="expired"><td class="mono">CW-Q-2024-0044</td><td class=""><div class="who">Ohio Valley Paper</div><div class="co">T. Marsh</div></td><td><div class="msg">Sharples DS-706 screen bowl overhaul</div></td><td class="mono">$8,200</td><td class="mono">Mar 2024</td><td class="mono">Apr 2024</td><td><span class="pill expired">Expired</span></td><td><button class="btn sm">Duplicate</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ============ VIEW: QUOTE BUILDER ============ -->
    <div class="view" data-view="builder">
      <div class="builder">
        <div>
          <div class="panel" style="padding:16px 18px 18px">
            <div class="field"><label>Linked Lead</label>
              <select id="qLead">
                <option>Hannah Brooks — Sugarland Food Processing (Quote Req · Jul 02)</option>
                <option>Dale Herrera — Gulf Coast Rendering (Quote Req · Today)</option>
                <option>— No linked lead (manual quote) —</option>
              </select>
            </div>
            <div class="f2">
              <div class="field"><label>Client Contact</label><input id="qName" value="Hannah Brooks"></div>
              <div class="field"><label>Company</label><input id="qCo" value="Sugarland Food Processing"></div>
            </div>
            <div class="f2">
              <div class="field"><label>Client Email</label><input id="qEmail" value="h.brooks@sugarlandfp.com"></div>
              <div class="field"><label>Issuing Location — locked</label>
                <input value="Rosharon, TX  ·  all quotes issue from Rosharon" disabled style="opacity:.65;cursor:not-allowed">
              </div>
            </div>
            <div class="field"><label>Project / Scope Title</label><input id="qScope" value="GEA CF 4000 Annual Overhaul & Bowl Balancing"></div>

            <div style="margin:16px 0 6px;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);font-weight:700">Line Items</div>
            <div class="li-head"><span>Description</span><span style="text-align:right">Qty</span><span style="text-align:right">Unit $</span><span></span></div>
            <div id="lines">
              <div class="li-row"><input class="d" value="Complete teardown, inspection & NDT report"><input class="num q" value="1"><input class="num u" value="3400"><button class="rm">×</button></div>
              <div class="li-row"><input class="d" value="Bowl assembly dynamic balancing (2-plane)"><input class="num q" value="1"><input class="num u" value="4850"><button class="rm">×</button></div>
              <div class="li-row"><input class="d" value="Bearing set — OEM spec, main & pinion"><input class="num q" value="1"><input class="num u" value="6200"><button class="rm">×</button></div>
              <div class="li-row"><input class="d" value="Seal kit & gasket set"><input class="num q" value="1"><input class="num u" value="1850"><button class="rm">×</button></div>
              <div class="li-row"><input class="d" value="Reassembly, test run & vibration cert"><input class="num q" value="1"><input class="num u" value="5100"><button class="rm">×</button></div>
            </div>
            <button class="addline" id="addLine">＋ Add line item</button>

            <div class="f2" style="margin-top:14px">
              <div class="field"><label>Tax Rate %</label><input id="qTax" class="num" value="8.25" style="font-family:var(--mono)"></div>
              <div class="field"><label>Valid For (days)</label><input id="qDays" value="30" style="font-family:var(--mono)"></div>
            </div>
            <div class="field"><label>Terms &amp; Notes</label>
              <textarea id="qTerms" rows="3">50% deposit on approval, balance net 30 on completion. Freight to/from Rosharon facility included within 150 miles. Quote excludes parts found damaged beyond inspection scope; change orders issued for approval before work proceeds.</textarea>
            </div>
          </div>
        </div>

        <div class="paper-wrap">
          <div class="paper-bar">
            <span class="t">Live Preview — branded PDF &amp; hosted quote page</span>
            <div class="grow"></div>
            <button class="btn sm">Save Draft</button>
            <button class="btn sm">Download PDF</button>
            <button class="btn sm primary" id="sendQuote">Send to Client ▸</button>
          </div>
          <div class="paper" id="paper">
            <div class="p-head">
              <img class="logo" src="https://centrifuge-im.s3.amazonaws.com/wp-content/uploads/2021/10/07193056/cw-logo-blk.png" alt="Centrifuge World" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
              <div class="logo-fb">
                <div class="mark">
                  <svg viewBox="0 0 147 148" xmlns="http://www.w3.org/2000/svg">
                    <path d="M73.5 8C38 8 9 37.3 9 74c0 36.7 29 66 64.5 66 27 0 50-16.8 59.6-40.6-8.4 13.5-23.3 22.5-40.2 22.5-26.2 0-47.5-21.4-47.5-47.9S66.7 26 92.9 26c16.9 0 31.8 9 40.2 22.6C123.5 24.8 100.5 8 73.5 8z" fill="#1B4FA0"/>
                    <circle cx="92" cy="74" r="20" fill="none" stroke="#1B4FA0" stroke-width="9"/>
                  </svg>
                </div>
                <b>CENTRIFUGE WORLD</b>
              </div>
              <div class="qn"><span>Quotation</span><b>CW-Q-2026-0147</b></div>
            </div>
            <div class="p-rule"></div>
            <div class="p-body">
              <div class="p-meta">
                <div><div class="t">Prepared For</div><div class="v"><b id="pName">Hannah Brooks</b><br><span id="pCo">Sugarland Food Processing</span><br><span id="pEmail" style="color:var(--paper-dim)">h.brooks@sugarlandfp.com</span></div></div>
                <div><div class="t">Scope</div><div class="v" id="pScope">GEA CF 4000 Annual Overhaul &amp; Bowl Balancing</div></div>
                <div><div class="t">Issued / Valid Until</div><div class="v">Jul 05, 2026<br><b id="pValid">Valid through Aug 04, 2026</b><br><span style="color:var(--paper-dim)">Issued from Rosharon, TX</span></div></div>
              </div>
              <table class="p-table">
                <thead><tr><th>Description</th><th class="n">Qty</th><th class="n">Unit</th><th class="n">Amount</th></tr></thead>
                <tbody id="pLines"></tbody>
              </table>
              <div class="p-totals">
                <table>
                  <tr><td class="k">Subtotal</td><td class="n" id="pSub">$0.00</td></tr>
                  <tr><td class="k">Tax (<span id="pTaxR">8.25</span>%)</td><td class="n" id="pTaxV">$0.00</td></tr>
                  <tr class="grand"><td>Total</td><td class="n" id="pTotal">$0.00</td></tr>
                </table>
              </div>
              <div class="p-terms"><b>Terms</b><span id="pTerms"></span></div>
              <div class="p-locs">
                <div class="l"><div class="t home">Rosharon, TX</div>7650 County Rd 48 Unit C<br>Rosharon, TX 77583<br><b>+1 (800) 208-6075</b></div>
                <div class="l"><div class="t">Franklin Park, IL</div>9212 Cherry Ave<br>Franklin Park, IL 60131<br><b>1-773-617-0937</b></div>
                <div class="l"><div class="t">Alsip, IL</div>12340 S Keeler Ave<br>Alsip, IL 60803<br><b>+1 (800) 208-6075</b></div>
              </div>
              <div class="p-emerg">24/7 Emergency breakdown line: <b>832-338-4990</b> — staffed 365 days a year · Office Mon–Fri 6:00am–6:00pm</div>
            </div>
            <div class="p-foot">
              <span>centrifuge.com</span><span>quotes@centrifuge.com</span><span>Rosharon TX · Franklin Park IL · Alsip IL</span><span style="margin-left:auto">Page 1 of 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ VIEW: ARCHIVE ============ -->
    <div class="view" data-view="archive">
      <div class="arch">
        <div class="yrail">
          <div class="yr-h">Records Room</div>
          <button class="ybtn on" data-y="all">All Years<span class="yv">309 · $6.24M</span></button>
          <button class="ybtn" data-y="2026"><span class="ydot" style="background:var(--blue)"></span>2026<span class="yv">47 · $1.02M</span></button>
          <button class="ybtn" data-y="2025"><span class="ydot" style="background:var(--cyan)"></span>2025<span class="yv">112 · $2.31M</span></button>
          <button class="ybtn" data-y="2024"><span class="ydot" style="background:var(--violet)"></span>2024<span class="yv">98 · $1.87M</span></button>
          <button class="ybtn" data-y="2023"><span class="ydot" style="background:var(--warn)"></span>2023<span class="yv">52 · $1.04M</span></button>
          <div class="yr-note"><b>Immutable record.</b> Every sent version is snapshotted with its PDF and integrity hash. Editing a draft never alters what a client received — resends create a new version.</div>
          <button class="btn sm" id="exportBtn">⬇ Export All Years — CSV</button>
        </div>
        <div class="panel">
          <div class="astats" id="astats">
            <div class="astat"><div class="k">Quotes Issued</div><div class="v" id="asQ">309</div></div>
            <div class="astat"><div class="k">Value Quoted</div><div class="v" id="asSent">$6.24M</div></div>
            <div class="astat"><div class="k">Value Accepted</div><div class="v" id="asAcc">$2.71M</div></div>
            <div class="astat"><div class="k">Win Rate</div><div class="v" id="asWin">43<small>%</small></div></div>
            <div class="grow" style="flex:1"></div>
            <input id="archSearch" placeholder="Search entire archive — quote #, client, scope…" style="background:var(--bg);border:1px solid var(--line2);border-radius:8px;color:var(--ink);padding:8px 13px;font-family:var(--body);font-size:12px;width:280px;align-self:center">
          </div>
          <div class="searchnote" id="searchNote">Searching all 309 quotes across every year — year selection ignored while searching.</div>
          <table>
            <thead><tr><th>Quote №</th><th>Client</th><th>Scope</th><th>Total</th><th>Sent</th><th>Versions</th><th>Outcome</th><th></th></tr></thead>
            <tbody id="archRows">
              <tr class="mgrp y2026" data-year="2026"><td colspan="8">2026 · July</td></tr>
              <tr class="row arow" data-year="2026"><td class="mono">CW-Q-2026-0146</td><td><div class="who">Brazos Poultry</div><div class="co">Kelly Nguyen</div></td><td><div class="msg">Sharples P3400 decanter rebuild, exchange rotating assembly</div></td><td class="mono">$25,450</td><td class="mono">Jul 04</td><td class="mono">v1</td><td><span class="pill viewed">Open · Viewed</span></td><td><button class="btn sm">Record</button></td></tr>
              <tr class="row arow" data-year="2026"><td class="mono">CW-Q-2026-0144</td><td><div class="who">Gulf Marine Services</div><div class="co">Omar Haddad</div></td><td><div class="msg">Two Mitsubishi SJ purifier rebuilds + spares kit</div></td><td class="mono">$22,600</td><td class="mono">Jul 02</td><td class="mono">v1</td><td><span class="pill sent">Open · Sent</span></td><td><button class="btn sm">Record</button></td></tr>
              <tr class="mgrp y2026" data-year="2026"><td colspan="8">2026 · June</td></tr>
              <tr class="row arow" data-year="2026"><td class="mono">CW-Q-2026-0141</td><td><div class="who">Calumet Rendering Works</div><div class="co">D. Kaminski</div></td><td><div class="msg">Alfa Laval NX 944 full rebuild + gearbox exchange</div></td><td class="mono">$48,750</td><td class="mono">Jun 26</td><td class="mono">v2</td><td><span class="pill sent">Open · Sent</span></td><td><button class="btn sm">Record</button></td></tr>
              <tr class="row arow" data-year="2026"><td class="mono">CW-Q-2026-0140</td><td><div class="who">Alsip Rendering LLC</div><div class="co">M. Stein</div></td><td><div class="msg">Bird 3500 conveyor re-tile + bearing set</div></td><td class="mono">$14,600</td><td class="mono">Jun 24</td><td class="mono">v1</td><td><span class="pill accepted">Accepted</span></td><td><button class="btn sm">Record</button></td></tr>
              <tr class="row arow" data-year="2026"><td class="mono">CW-Q-2026-0139</td><td><div class="who">Sabine River Chem</div><div class="co">J. Thibodeaux</div></td><td><div class="msg">Flottweg Z4E rebuild, hard-surface scroll flights</div></td><td class="mono">$29,800</td><td class="mono">Jun 20</td><td class="mono">v1</td><td><span class="pill accepted">Accepted</span></td><td><button class="btn sm">Record</button></td></tr>
              <tr class="mgrp y2025" data-year="2025"><td colspan="8">2025 · November</td></tr>
              <tr class="row arow" data-year="2025"><td class="mono">CW-Q-2025-0208</td><td><div class="who">Des Plaines Utility Dist.</div><div class="co">P. Almeida</div></td><td><div class="msg">Humboldt S3-1 decanter #1 rebuild — phase one of program</div></td><td class="mono">$49,500</td><td class="mono">Nov 14</td><td class="mono">v1</td><td><span class="pill accepted">Accepted</span></td><td><button class="btn sm">Record</button></td></tr>
              <tr class="mgrp y2025" data-year="2025"><td colspan="8">2025 · August</td></tr>
              <tr class="row arow" data-year="2025"><td class="mono">CW-Q-2025-0164</td><td><div class="who">Gulf Coast Rendering</div><div class="co">Dale Herrera</div></td><td><div class="msg">Alfa Laval AVNX 4550 inspection & gearbox exchange</div></td><td class="mono">$11,750</td><td class="mono">Aug 22</td><td class="mono">v3</td><td><span class="pill declined">Declined</span></td><td><button class="btn sm">Record</button></td></tr>
              <tr class="row arow" data-year="2025"><td class="mono">CW-Q-2025-0158</td><td><div class="who">NorthShore Pharma</div><div class="co">Grace Lindqvist</div></td><td><div class="msg">Westfalia SA-20 preventative maintenance contract</div></td><td class="mono">$36,900</td><td class="mono">Aug 07</td><td class="mono">v1</td><td><span class="pill accepted">Accepted</span></td><td><button class="btn sm">Record</button></td></tr>
              <tr class="mgrp y2025" data-year="2025"><td colspan="8">2025 · March</td></tr>
              <tr class="row arow" data-year="2025"><td class="mono">CW-Q-2025-0071</td><td><div class="who">Prairie Dairy Co-op</div><div class="co">Jen Kowalski</div></td><td><div class="msg">GEA MSE 120 separator overhaul, sanitary spec</div></td><td class="mono">$18,400</td><td class="mono">Mar 19</td><td class="mono">v2</td><td><span class="pill expired">Expired</span></td><td><button class="btn sm">Record</button></td></tr>
              <tr class="mgrp y2024" data-year="2024"><td colspan="8">2024 · June</td></tr>
              <tr class="row arow" data-year="2024"><td class="mono">CW-Q-2024-0091</td><td><div class="who">Sugarland Food Processing</div><div class="co">Hannah Brooks</div></td><td><div class="msg">GEA CF 4000 annual overhaul — prior year service</div></td><td class="mono">$21,300</td><td class="mono">Jun 11</td><td class="mono">v1</td><td><span class="pill accepted">Accepted</span></td><td><button class="btn sm">Record</button></td></tr>
              <tr class="mgrp y2024" data-year="2024"><td colspan="8">2024 · March</td></tr>
              <tr class="row arow" data-year="2024"><td class="mono">CW-Q-2024-0044</td><td><div class="who">Ohio Valley Paper</div><div class="co">T. Marsh</div></td><td><div class="msg">Sharples DS-706 screen bowl overhaul</div></td><td class="mono">$8,200</td><td class="mono">Mar 28</td><td class="mono">v1</td><td><span class="pill expired">Expired</span></td><td><button class="btn sm">Record</button></td></tr>
              <tr class="row arow" data-year="2024"><td class="mono">CW-Q-2024-0038</td><td><div class="who">LoneStar Chemical</div><div class="co">Plant Eng. Office</div></td><td><div class="msg">Emergency decanter line-2 rebuild after bearing failure</div></td><td class="mono">$41,200</td><td class="mono">Mar 06</td><td class="mono">v1</td><td><span class="pill accepted">Accepted</span></td><td><button class="btn sm">Record</button></td></tr>
              <tr class="mgrp y2023" data-year="2023"><td colspan="8">2023 · October</td></tr>
              <tr class="row arow" data-year="2023"><td class="mono">CW-Q-2023-0187</td><td><div class="who">Bayou Proteins</div><div class="co">R. Gutierrez</div></td><td><div class="msg">Bird 3500 full rebuild + spare rotating assembly</div></td><td class="mono">$52,700</td><td class="mono">Oct 12</td><td class="mono">v2</td><td><span class="pill accepted">Accepted</span></td><td><button class="btn sm">Record</button></td></tr>
              <tr class="mgrp y2023" data-year="2023"><td colspan="8">2023 · April</td></tr>
              <tr class="row arow" data-year="2023"><td class="mono">CW-Q-2023-0066</td><td><div class="who">Great Lakes Biosolids</div><div class="co">Ann Whitfield</div></td><td><div class="msg">Andritz D5L centrate quality rework + scroll hard-surfacing</div></td><td class="mono">$27,300</td><td class="mono">Apr 20</td><td class="mono">v1</td><td><span class="pill declined">Declined</span></td><td><button class="btn sm">Record</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============ VIEW: ROUTING ============ -->
    <div class="view" data-view="routing">
      <div class="note"><b>Routing rule — locked:</b> every form submission (Contact, Quote Request, Emergency Service) is delivered via the Twilio Email API to <b>all four recipients below</b> in a single batch send. Delivery is confirmed per-recipient by polling the Twilio Operation resource; failures auto-retry with backoff and surface in the Form Lead Tracker.</div>
      <div class="rgrid">
        <div class="rcard"><div class="av" style="background:linear-gradient(135deg,#2F7BF6,#63A5FF)">M</div><div class="nm">Mark</div><div class="em">mark@p5400.com</div><div class="role">Site admin · primary owner</div><div class="stat"><span class="dot"></span> DELIVERING · 0 FAILURES 30D</div></div>
        <div class="rcard"><div class="av" style="background:linear-gradient(135deg,#38C8E8,#2F7BF6)">R</div><div class="nm">Ron</div><div class="em">ron@p5400.com</div><div class="role">Sales · quote follow-up</div><div class="stat"><span class="dot"></span> DELIVERING · 0 FAILURES 30D</div></div>
        <div class="rcard"><div class="av" style="background:linear-gradient(135deg,#9B7DF0,#2F7BF6)">D</div><div class="nm">David</div><div class="em">david@p5400.com</div><div class="role">Operations · scheduling</div><div class="stat"><span class="dot warn"></span> 1 QUEUED · RETRYING</div></div>
        <div class="rcard"><div class="av" style="background:linear-gradient(135deg,#31C98E,#38C8E8)">C</div><div class="nm">Cynthia</div><div class="em">cynthia@p5400.com</div><div class="role">Office · records &amp; intake</div><div class="stat"><span class="dot"></span> 1 BOUNCE RECOVERED 30D</div></div>
      </div>

      <div class="cfg">
        <div class="panel" style="padding:16px 18px">
          <h4 class="sec" style="margin-top:0">Twilio Email Operator</h4>
          <div class="kv">
            <span class="k">Endpoint</span><span class="v mono">POST comms.twilio.com/v1/Emails</span>
            <span class="k">Auth</span><span class="v mono">API Key SID + Secret (env)</span>
            <span class="k">Verified sender</span><span class="v mono">notifications@centrifuge.com ✓</span>
            <span class="k">Quote sender</span><span class="v mono">quotes@centrifuge.com ✓</span>
            <span class="k">Reply-to</span><span class="v mono">assigned owner (per lead)</span>
            <span class="k">Delivery tracking</span><span class="v">Async 202 → poll Operation resource, status stored per recipient</span>
            <span class="k">Failure policy</span><span class="v">3 retries w/ backoff → alert strip on dashboard</span>
          </div>
          <div style="margin-top:14px;display:flex;gap:8px"><button class="btn sm">Send test to all 4</button><button class="btn sm">View send log</button></div>
        </div>
        <div class="panel" style="padding:16px 18px">
          <h4 class="sec" style="margin-top:0">Notification Templates</h4>
          <div class="kv">
            <span class="k">form-lead-internal</span><span class="v">Internal alert — branded header, form payload table, "Open in Mission Control" deep link</span>
            <span class="k">form-lead-ack</span><span class="v">Auto-acknowledgement to the submitter (business hours copy)</span>
            <span class="k">quote-delivery</span><span class="v">Branded quote email — PDF attached + hosted "View Quote" button (view tracking)</span>
            <span class="k">quote-reminder</span><span class="v">Follow-up N days before expiry (manual trigger v1)</span>
          </div>
          <div style="margin-top:14px"><span class="mono">Liquid templating · every variable validated before send</span></div>
        </div>
      </div>
    </div>

  </div><!-- /main -->
</div><!-- /app -->

<!-- ============ LEAD DRAWER ============ -->
<div class="scrim" id="scrim"></div>
<div class="drawer" id="drawer">
  <div class="drawer-h">
    <button class="x" id="drawerX">✕</button>
    <h3 id="dName">Dale Herrera</h3>
    <div class="co" id="dCo">Gulf Coast Rendering · Quote Request</div>
  </div>
  <div class="drawer-body">
    <div class="dsec"><div class="t">Lead Details</div>
      <div class="kv">
        <span class="k">Email</span><span class="v mono">d.herrera@gcrendering.com</span>
        <span class="k">Phone</span><span class="v mono">(281) 555-0164</span>
        <span class="k">Source form</span><span class="v">Request a Quote — /request-quote</span>
        <span class="k">Received</span><span class="v mono">Jul 05, 2026 · 06:41 CT</span>
        <span class="k">Est. value</span><span class="v mono">~$18,000</span>
        <span class="k">Owner</span><span class="v">Ron (auto-suggested)</span>
      </div>
    </div>
    <div class="dsec"><div class="t">Message</div>
      <div class="msgbox">Alfa Laval AVNX 4550 rebuild — scroll rebuild with hard surfacing, new main bearings, seal kit. Unit comes down mid-August; need turnaround estimate and freight options from Beaumont.</div>
    </div>
    <div class="dsec"><div class="t">Routing &amp; Delivery — Twilio op <span class="mono">EMop_9f3a…</span></div>
      <div class="timeline">
        <div class="tl ok"><div class="p"><i></i></div><div class="w"><b>Form received</b> — payload validated, lead created<span class="ts">06:41:02 CT</span></div></div>
        <div class="tl ok"><div class="p"><i></i></div><div class="w"><b>Batch send accepted</b> — 202 from Twilio, 4 recipients<span class="ts">06:41:03 CT</span></div></div>
        <div class="tl ok"><div class="p"><i></i></div><div class="w"><b>Delivered</b> — mark@, ron@, cynthia@p5400.com<span class="ts">06:41–06:42 CT</span></div></div>
        <div class="tl warn"><div class="p"><i></i></div><div class="w"><b>Queued</b> — david@p5400.com, retry 1 of 3 pending<span class="ts">06:44 CT · polling operation</span></div></div>
        <div class="tl ok"><div class="p"><i></i></div><div class="w"><b>Auto-acknowledgement sent</b> to submitter<span class="ts">06:41:05 CT</span></div></div>
      </div>
    </div>
  </div>
  <div class="drawer-f">
    <button class="btn">Mark Contacted</button>
    <button class="btn primary" id="drawerQuote">Create Quote ▸</button>
  </div>
</div>

<!-- ============ SNAPSHOT RECORD DRAWER ============ -->
<div class="drawer" id="drawer2">
  <div class="drawer-h">
    <button class="x" id="drawer2X">✕</button>
    <h3 id="rNum">CW-Q-2026-0141</h3>
    <div class="co" id="rClient">Calumet Rendering Works · D. Kaminski</div>
  </div>
  <div class="drawer-body">
    <div class="dsec"><div class="t">Record</div>
      <div class="kv">
        <span class="k">Scope</span><span class="v" id="rScope">Alfa Laval NX 944 full rebuild + gearbox exchange</span>
        <span class="k">Total</span><span class="v mono" id="rTotal">$48,750</span>
        <span class="k">Linked lead</span><span class="v">D. Kaminski — pipeline: Quote Sent</span>
        <span class="k">Owner</span><span class="v">Ron</span>
        <span class="k">Outcome</span><span class="v" id="rOutcome">Sent · awaiting decision</span>
      </div>
    </div>
    <div class="dsec"><div class="t">Sent Snapshots — immutable</div>
      <div class="snap">
        <div class="sh"><b>Version 2</b><span class="when">Jun 26, 2026 · 10:22 CT</span></div>
        <div class="meta2">Sent to d.kaminski@calumetrw.com · CC mark, ron, david, cynthia @p5400.com · Reply-to ron@p5400.com</div>
        <span class="pdfchip">▤ CW-Q-2026-0141-v2.pdf · 412 KB</span>
        <span class="pdfchip">◉ View as client saw it</span>
        <div class="hash">sha256 9f3ac21b77e04d5a…8c41 · <b>integrity verified</b> · Twilio op EMop_77c1 — delivered 1 + 4 CC</div>
        <div class="meta2">Client viewed 2× — Jun 27 08:14, Jul 01 15:47</div>
      </div>
      <div class="snap superseded">
        <div class="sh"><b>Version 1</b><span class="when">Jun 20, 2026 · 14:05 CT</span></div>
        <div class="meta2">Revised after client requested gearbox exchange be added to scope.</div>
        <span class="pdfchip">▤ CW-Q-2026-0141-v1.pdf · 388 KB</span>
        <span class="pdfchip">◉ View as client saw it</span>
        <div class="hash">sha256 4b8e01dd3a92f6c0…1e77 · <b>integrity verified</b> · Twilio op EMop_5a90 — delivered 1 + 4 CC</div>
      </div>
    </div>
    <div class="dsec"><div class="t">Retention</div>
      <div class="msgbox">Snapshots and PDFs are retained permanently. Deleting the working quote archives the record — it never deletes sent versions. Yearly CSV exports include every version with hash and delivery status.</div>
    </div>
  </div>
  <div class="drawer-f">
    <button class="btn">Download all PDFs</button>
    <button class="btn primary">Duplicate as new draft ▸</button>
  </div>
</div>`

export default function LeadsQuotesClient() {
  const ref = useRef<HTMLDivElement>(null)
  const ran = useRef(false)

  useEffect(() => {
    const root = ref.current
    if (!root || ran.current) return
    ran.current = true

    // Scoped facade so the verbatim mockup script queries only within this view.
    const d: any = {
      getElementById: (id: string) => root.querySelector('#' + CSS.escape(id)),
      querySelector: (s: string) => root.querySelector(s),
      querySelectorAll: (s: string) => root.querySelectorAll(s),
      createElement: (t: string) => window.document.createElement(t),
    }

    // ---- tabs ----
    const tabs=d.querySelectorAll('.subnav [data-tab]');
    function go(t){
      tabs.forEach(b=>b.classList.toggle('on',b.dataset.tab===t));
      d.querySelectorAll('.view').forEach(v=>v.classList.toggle('on',v.dataset.view===t));
    }
    tabs.forEach(b=>b.addEventListener('click',()=>go(b.dataset.tab)));
    d.getElementById('newQuoteBtn').addEventListener('click',()=>go('builder'));
    
    // ---- kanban drag & drop ----
    let dragged=null, didDrag=false;
    function refreshCols(){
      d.querySelectorAll('.board .col').forEach(col=>{
        const cards=[...col.querySelectorAll('.card')];
        let sum=0;
        cards.forEach(c=>{
          const v=c.querySelector('.val');
          if(v){const m=v.textContent.replace(/[~$,\s]/g,'').toLowerCase();
            sum += m.endsWith('k') ? parseFloat(m)*1000 : (parseFloat(m)||0);}
        });
        const k=sum/1000;
        col.querySelector('.col-h .n').textContent =
          cards.length + (sum ? ' · $' + (k%1 ? k.toFixed(1) : k.toFixed(0)) + 'k' : '');
      });
    }
    d.querySelectorAll('.board .card').forEach(c=>{
      c.setAttribute('draggable','true');
      c.addEventListener('dragstart',()=>{dragged=c;didDrag=true;requestAnimationFrame(()=>c.classList.add('dragging'))});
      c.addEventListener('dragend',()=>{
        c.classList.remove('dragging');
        d.querySelectorAll('.col-body').forEach(b=>b.classList.remove('over'));
        refreshCols();
        setTimeout(()=>didDrag=false,50);
      });
    });
    d.querySelectorAll('.board .col-body').forEach(b=>{
      b.addEventListener('dragover',e=>{e.preventDefault();b.classList.add('over')});
      b.addEventListener('dragleave',()=>b.classList.remove('over'));
      b.addEventListener('drop',e=>{
        e.preventDefault();b.classList.remove('over');
        if(!dragged)return;
        const after=[...b.querySelectorAll('.card:not(.dragging)')].find(card=>{
          const r=card.getBoundingClientRect();return e.clientY < r.top + r.height/2;
        });
        after ? b.insertBefore(dragged,after) : b.appendChild(dragged);
        dragged=null;
      });
    });
    refreshCols();
    
    // ---- filters ----
    function wireChips(chipsId,rowsId,attr){
      const chips=d.querySelectorAll('#'+chipsId+' .chip');
      chips.forEach(c=>c.addEventListener('click',()=>{
        chips.forEach(x=>x.classList.remove('on'));c.classList.add('on');
        const f=c.dataset[attr];
        d.querySelectorAll('#'+rowsId+' tr').forEach(r=>{
          r.style.display=(f==='all'||r.dataset[attr]===f)?'':'none';
        });
        restripe(rowsId);
      }));
    }
    function restripe(tbodyId){
      let i=0;
      d.querySelectorAll('#'+tbodyId+' tr').forEach(r=>{
        if(r.classList.contains('mgrp')||r.style.display==='none')return;
        r.classList.toggle('even',i%2===1);i++;
      });
    }
    wireChips('formChips','formRows','f');
    
    // quotes: combined status chip + year chip + text search
    let qStatus='all', qYear='all', qText='';
    function applyQuoteFilters(){
      d.querySelectorAll('#qRows tr').forEach(r=>{
        const okS = qStatus==='all' || r.dataset.q===qStatus;
        const okY = qYear==='all' || r.dataset.year===qYear;
        const okT = !qText || r.textContent.toLowerCase().includes(qText);
        r.style.display = (okS && okY && okT) ? '' : 'none';
      });
      restripe('qRows');
    }
    d.querySelectorAll('#qChips .chip').forEach(c=>c.addEventListener('click',()=>{
      d.querySelectorAll('#qChips .chip').forEach(x=>x.classList.remove('on'));c.classList.add('on');
      qStatus=c.dataset.q;applyQuoteFilters();
    }));
    d.querySelectorAll('#yearChips .chip').forEach(c=>c.addEventListener('click',()=>{
      d.querySelectorAll('#yearChips .chip').forEach(x=>x.classList.remove('on'));c.classList.add('on');
      qYear=c.dataset.y;applyQuoteFilters();
    }));
    d.getElementById('qSearch').addEventListener('input',e=>{
      qText=e.target.value.trim().toLowerCase();applyQuoteFilters();
    });
    
    // ---- drawer ----
    const drawer=d.getElementById('drawer'),scrim=d.getElementById('scrim');
    function openDrawer(){drawer.classList.add('on');scrim.classList.add('on')}
    function closeDrawer(){drawer.classList.remove('on');scrim.classList.remove('on')}
    d.querySelectorAll('.card[data-lead], tr[data-lead]').forEach(el=>el.addEventListener('click',e=>{
      if(e.target.closest('.btn')||didDrag)return;
      openDrawer();
    }));
    d.getElementById('drawerX').addEventListener('click',closeDrawer);
    scrim.addEventListener('click',closeDrawer);
    d.getElementById('drawerQuote').addEventListener('click',()=>{closeDrawer();go('builder')});
    
    // ---- quote builder live preview ----
    const fmt=n=>'$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    function bind(id,target,attr){
      const el=d.getElementById(id);
      el.addEventListener('input',()=>{d.getElementById(target).textContent=el.value});
    }
    bind('qName','pName');bind('qCo','pCo');bind('qEmail','pEmail');bind('qScope','pScope');
    d.getElementById('qDays').addEventListener('input',e=>{
      const d=parseInt(e.target.value)||30;
      const dt=new Date(2026,6,5);dt.setDate(dt.getDate()+d);
      d.getElementById('pValid').textContent='Valid through '+dt.toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'});
    });
    d.getElementById('qTerms').addEventListener('input',e=>{
      d.getElementById('pTerms').textContent=e.target.value;
    });
    
    function recalc(){
      const rows=[...d.querySelectorAll('#lines .li-row')];
      const body=d.getElementById('pLines');body.innerHTML='';
      let sub=0;
      rows.forEach(r=>{
        const d=r.querySelector('.d').value||'—';
        const q=parseFloat(r.querySelector('.q').value)||0;
        const u=parseFloat(r.querySelector('.u').value)||0;
        const amt=q*u;sub+=amt;
        body.insertAdjacentHTML('beforeend',`<tr><td>${d.replace(/</g,'&lt;')}</td><td class="n">${q}</td><td class="n">${fmt(u)}</td><td class="n">${fmt(amt)}</td></tr>`);
      });
      const taxR=parseFloat(d.getElementById('qTax').value)||0;
      const tax=sub*taxR/100;
      d.getElementById('pSub').textContent=fmt(sub);
      d.getElementById('pTaxR').textContent=taxR;
      d.getElementById('pTaxV').textContent=fmt(tax);
      d.getElementById('pTotal').textContent=fmt(sub+tax);
    }
    function wireRow(r){
      r.querySelectorAll('input').forEach(i=>i.addEventListener('input',recalc));
      r.querySelector('.rm').addEventListener('click',()=>{r.remove();recalc()});
    }
    d.querySelectorAll('#lines .li-row').forEach(wireRow);
    d.getElementById('qTax').addEventListener('input',recalc);
    d.getElementById('addLine').addEventListener('click',()=>{
      const div=d.createElement('div');div.className='li-row';
      div.innerHTML='<input class="d" placeholder="Description"><input class="num q" value="1"><input class="num u" value="0"><button class="rm">×</button>';
      d.getElementById('lines').appendChild(div);wireRow(div);recalc();
      div.querySelector('.d').focus();
    });
    d.getElementById('qTerms').dispatchEvent(new Event('input'));
    recalc();
    
    // ---- archive: year rail, stats, global search, record drawer ----
    const YSTATS={
      all:{q:'309',sent:'$6.24M',acc:'$2.71M',win:'43',label:'All Years'},
      '2026':{q:'47',sent:'$1.02M',acc:'$412k',win:'41',label:'2026'},
      '2025':{q:'112',sent:'$2.31M',acc:'$1.04M',win:'46',label:'2025'},
      '2024':{q:'98',sent:'$1.87M',acc:'$798k',win:'42',label:'2024'},
      '2023':{q:'52',sent:'$1.04M',acc:'$451k',win:'40',label:'2023'}
    };
    let archYear='all', archText='';
    const archSearchEl=d.getElementById('archSearch');
    function applyArchive(){
      const searching=archText.length>0;
      d.getElementById('searchNote').classList.toggle('on',searching);
      d.querySelectorAll('#archRows tr').forEach(r=>{
        if(r.classList.contains('mgrp')){
          r.style.display=(!searching&&(archYear==='all'||r.dataset.year===archYear))?'':'none';
        }else{
          const okY=searching||archYear==='all'||r.dataset.year===archYear;
          const okT=!searching||r.textContent.toLowerCase().includes(archText);
          r.style.display=(okY&&okT)?'':'none';
        }
      });
      const s=YSTATS[archYear]||YSTATS.all;
      d.getElementById('asQ').textContent=s.q;
      d.getElementById('asSent').textContent=s.sent;
      d.getElementById('asAcc').textContent=s.acc;
      d.getElementById('asWin').innerHTML=s.win+'<small>%</small>';
      d.getElementById('exportBtn').textContent='⬇ Export '+s.label+' — CSV';
      restripe('archRows');
    }
    d.querySelectorAll('.ybtn').forEach(b=>b.addEventListener('click',()=>{
      d.querySelectorAll('.ybtn').forEach(x=>x.classList.remove('on'));b.classList.add('on');
      archYear=b.dataset.y;applyArchive();
    }));
    archSearchEl.addEventListener('input',e=>{archText=e.target.value.trim().toLowerCase();applyArchive();});
    d.getElementById('exportBtn').addEventListener('click',function(){
      const old=this.textContent;
      this.textContent='✓ Exported CW-quotes-'+(archYear==='all'?'all-years':archYear)+'.csv';
      setTimeout(()=>{this.textContent=old},2200);
    });
    // record drawer
    const drawer2=d.getElementById('drawer2');
    function openRecord(row){
      const tds=row.querySelectorAll('td');
      d.getElementById('rNum').textContent=tds[0].textContent;
      d.getElementById('rClient').textContent=tds[1].querySelector('.who').textContent+' · '+tds[1].querySelector('.co').textContent;
      d.getElementById('rScope').textContent=tds[2].textContent;
      d.getElementById('rTotal').textContent=tds[3].textContent;
      d.getElementById('rOutcome').textContent=tds[6].textContent;
      drawer2.classList.add('on');scrim.classList.add('on');
    }
    d.querySelectorAll('.arow').forEach(r=>r.addEventListener('click',e=>{
      if(e.target.closest('.btn')&&!e.target.closest('.btn').textContent.includes('Record'))return;
      openRecord(r);
    }));
    d.getElementById('drawer2X').addEventListener('click',()=>{drawer2.classList.remove('on');scrim.classList.remove('on')});
    scrim.addEventListener('click',()=>drawer2.classList.remove('on'));
    applyArchive();
    restripe('formRows');restripe('qRows');
    
    // ---- send simulation ----
    d.getElementById('sendQuote').addEventListener('click',function(){
      this.textContent='Sending via Twilio…';this.disabled=true;
      setTimeout(()=>{this.textContent='✓ Sent — 202 Accepted';this.style.background='linear-gradient(180deg,#35D69A,#22A876)';this.style.borderColor='#35D69A'},900);
      setTimeout(()=>{this.textContent='Send to Client ▸';this.disabled=false;this.style.background='';this.style.borderColor=''},3200);
    });

    // Deep-link support: /admin/leads-quotes?tab=quotes lands on that tab.
    const wanted = new URLSearchParams(window.location.search).get('tab')
    if (wanted) (root.querySelector(`.subnav [data-tab="${wanted}"]`) as HTMLButtonElement | null)?.click()
  }, [])

  return <div className="cw-lq" ref={ref} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
}
