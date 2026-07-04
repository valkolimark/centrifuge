'use client'

// PDF Studio annotation panel (UI-1 Phase E, v1). Comment-type overlay objects
// persisted to the Media doc's pdfAnnotations field via the Payload REST API.
// v2: freehand ink / stamps / signature + pdf-lib flatten-export.
import { useState } from 'react'

interface Annotation {
  id: string
  type: 'comment'
  text: string
  page: number
  createdAt: string
}

export function PdfAnnotations({ mediaId, initial }: { mediaId: string; initial: unknown }) {
  const seed = Array.isArray(initial) ? (initial as Annotation[]) : []
  const [items, setItems] = useState<Annotation[]>(seed)
  const [text, setText] = useState('')
  const [page, setPage] = useState(1)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function persist(next: Annotation[]) {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/media/${mediaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pdfAnnotations: next }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setItems(next)
      setMsg('Saved')
    } catch {
      setMsg('Save failed — check your session')
    } finally {
      setSaving(false)
      setTimeout(() => setMsg(null), 2500)
    }
  }

  function add() {
    if (!text.trim()) return
    const ann: Annotation = { id: Math.random().toString(36).slice(2), type: 'comment', text: text.trim(), page, createdAt: new Date().toISOString() }
    persist([...items, ann])
    setText('')
  }
  function remove(id: string) {
    persist(items.filter((a) => a.id !== id))
  }

  const inp: React.CSSProperties = { width: '100%', background: '#0A1226', border: '1px solid #1B2C55', color: '#EAF2FF', borderRadius: 8, padding: '8px 10px', fontSize: 13 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <div style={{ fontWeight: 600, fontSize: 13 }}>Annotations</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment…" rows={3} style={inp} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#8FA3C8' }}>Page</label>
          <input type="number" min={1} value={page} onChange={(e) => setPage(Math.max(1, Number(e.target.value) || 1))} style={{ ...inp, width: 64 }} />
          <button onClick={add} disabled={saving || !text.trim()} style={{ marginLeft: 'auto', background: 'linear-gradient(90deg,#2A6BFF,#3EC9F5)', color: '#041018', border: 0, borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer', opacity: saving || !text.trim() ? 0.5 : 1 }}>
            Add
          </button>
        </div>
        {msg ? <div style={{ fontSize: 12, color: msg === 'Saved' ? '#2BD98A' : '#FF5C7A' }}>{msg}</div> : null}
      </div>

      <div style={{ borderTop: '1px solid #1B2C55', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
        {items.length === 0 ? (
          <p style={{ fontSize: 12.5, color: '#5A6E96' }}>No annotations yet. Comments you add here are saved to this document.</p>
        ) : (
          items.map((a) => (
            <div key={a.id} style={{ background: '#0A1226', border: '1px solid #1B2C55', borderRadius: 8, padding: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#5A6E96', marginBottom: 4 }}>
                <span>Page {a.page}</span>
                <button onClick={() => remove(a.id)} style={{ background: 'none', border: 0, color: '#FF5C7A', cursor: 'pointer', fontSize: 11 }}>delete</button>
              </div>
              <div style={{ fontSize: 13 }}>{a.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
