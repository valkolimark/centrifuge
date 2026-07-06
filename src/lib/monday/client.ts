/* monday.com GraphQL client (api.monday.com/v2). Pulls contacts + current jobs to feed the
 * Leads & Quotes workspace. Auth via MONDAY_API_TOKEN (monday → Developers → My Access
 * Tokens). No token ⇒ every call returns empty so the app degrades gracefully. */

const API_URL = 'https://api.monday.com/v2'
const API_VERSION = '2024-10'

export const hasMondayToken = () => !!process.env.MONDAY_API_TOKEN

export type MondayColumn = { id: string; title: string; type: string }
export type MondayBoard = { id: string; name: string; state: string; items_count: number; columns: MondayColumn[] }
export type MondayItem = {
  id: string
  name: string
  group?: { id: string; title: string }
  updated_at?: string
  column_values: { id: string; text: string | null; value: string | null; column?: { title: string } }[]
}

export async function mondayQuery<T = any>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = process.env.MONDAY_API_TOKEN
  if (!token) throw new Error('MONDAY_API_TOKEN not set')
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token, 'API-Version': API_VERSION },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(`monday API error: ${JSON.stringify(json.errors).slice(0, 300)}`)
  return json.data as T
}

/** All boards with their columns — used once to discover which boards hold contacts/jobs. */
export async function listBoards(): Promise<MondayBoard[]> {
  if (!hasMondayToken()) return []
  const data = await mondayQuery<{ boards: MondayBoard[] }>(`
    query { boards(limit: 100, state: active) { id name state items_count columns { id title type } } }
  `)
  return data.boards || []
}

/** Items (rows) on a board, paginated. column_values include the human column title + text. */
export async function getBoardItems(boardId: string, limit = 100, cursor?: string): Promise<{ items: MondayItem[]; cursor: string | null }> {
  if (!hasMondayToken()) return { items: [], cursor: null }
  const data = await mondayQuery<{ boards: { items_page: { cursor: string | null; items: MondayItem[] } }[] }>(
    `query ($boardId: [ID!], $limit: Int!, $cursor: String) {
      boards(ids: $boardId) {
        items_page(limit: $limit, cursor: $cursor) {
          cursor
          items { id name updated_at group { id title } column_values { id text value column { title } } }
        }
      }
    }`,
    { boardId: [boardId], limit, cursor: cursor ?? null },
  )
  const page = data.boards?.[0]?.items_page
  return { items: page?.items || [], cursor: page?.cursor || null }
}

/** Convenience: flatten an item's column_values into a { columnTitle: text } map. */
export function itemFields(item: MondayItem): Record<string, string> {
  const out: Record<string, string> = { name: item.name }
  for (const cv of item.column_values) {
    const key = cv.column?.title || cv.id
    if (cv.text) out[key] = cv.text
  }
  return out
}
