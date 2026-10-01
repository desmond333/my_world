import type { Note } from './types'

export type NoteTreeNode = Note & {
  children: NoteTreeNode[]
  depth: number
}

export const buildNoteTree = (notes: Note[], parentId: string | null = null, depth = 0, visited = new Set<string>()): NoteTreeNode[] => {
  return notes
    .filter((note) => {
      if (parentId === null) {
        return !note.parentId || !notes.some((p) => p.id === note.parentId)
      }
      return note.parentId === parentId
    })
    .filter((note) => !visited.has(note.id))
    .map((note) => {
      const nextVisited = new Set(visited).add(note.id)
      return {
        ...note,
        depth,
        children: buildNoteTree(notes, note.id, depth + 1, nextVisited),
      }
    })
}

export const getBreadcrumbs = (notes: Note[], activeId: string | null): Note[] => {
  if (!activeId) return []
  const trail: Note[] = []
  const visited = new Set<string>()
  let current = notes.find((n) => n.id === activeId)
  while (current && !visited.has(current.id)) {
    visited.add(current.id)
    trail.unshift(current)
    if (!current.parentId) break
    current = notes.find((n) => n.id === current?.parentId)
  }
  return trail
}

export const getChildNotes = (notes: Note[], parentId: string): Note[] => {
  return notes.filter((n) => n.parentId === parentId)
}

export const getAllDescendantIds = (notes: Note[], rootId: string): string[] => {
  const ids: string[] = []
  const queue = [rootId]
  while (queue.length > 0) {
    const parentId = queue.shift()!
    const children = notes.filter((n) => n.parentId === parentId)
    for (const child of children) {
      ids.push(child.id)
      queue.push(child.id)
    }
  }
  return ids
}

export const searchTree = (
  nodes: NoteTreeNode[],
  searchQuery: string,
): { filtered: NoteTreeNode[]; matchedIds: Set<string>; expandedIds: Set<string> } => {
  const q = searchQuery.trim().toLowerCase()
  const matchedIds = new Set<string>()
  const expandedIds = new Set<string>()

  if (!q) {
    return { filtered: nodes, matchedIds, expandedIds }
  }

  const checkNode = (node: NoteTreeNode, ancestors: string[]): boolean => {
    const isSelfMatch = node.title.toLowerCase().includes(q) || node.body.toLowerCase().includes(q)
    if (isSelfMatch) {
      matchedIds.add(node.id)
      ancestors.forEach((id) => expandedIds.add(id))
    }
    let childMatched = false
    for (const child of node.children) {
      if (checkNode(child, [...ancestors, node.id])) {
        childMatched = true
      }
    }
    return isSelfMatch || childMatched
  }

  nodes.forEach((node) => checkNode(node, []))

  const filterTree = (list: NoteTreeNode[]): NoteTreeNode[] => {
    return list
      .map((node) => ({
        ...node,
        children: filterTree(node.children),
      }))
      .filter((node) => matchedIds.has(node.id) || node.children.length > 0)
  }

  return {
    filtered: filterTree(nodes),
    matchedIds,
    expandedIds,
  }
}
