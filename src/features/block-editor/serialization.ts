import type { Block, BlockType } from './types'

export const createBlockId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export const createBlock = (type: BlockType = 'p', content = '', extra?: Partial<Block>): Block => ({
  id: createBlockId(),
  type,
  content,
  ...(type === 'todo' ? { checked: false } : {}),
  ...(type === 'toggle' ? { open: true } : {}),
  ...(type === 'callout' ? { emoji: '💡' } : {}),
  ...(type === 'code' ? { language: 'javascript' } : {}),
  ...(type === 'image' || type === 'audio' || type === 'pdf'
    ? {
        url: '',
        fileName: '',
        caption: '',
      }
    : {}),
  ...extra,
})

export const isBlockJson = (raw: string): boolean => {
  const trimmed = raw.trim()
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return false
  try {
    const parsed = JSON.parse(trimmed)
    return Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0]?.id === 'string' && typeof parsed[0]?.type === 'string'
  } catch {
    return false
  }
}

export const parseBlocks = (raw: string): Block[] => {
  const trimmed = raw.trim()
  if (!trimmed) {
    return [createBlock('p', '')]
  }

  if (isBlockJson(trimmed)) {
    try {
      const parsed = JSON.parse(trimmed) as Block[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          id: item.id || createBlockId(),
          type: item.type || 'p',
          content: typeof item.content === 'string' ? item.content : '',
          checked: Boolean(item.checked),
          open: item.open ?? true,
          emoji: item.emoji || '💡',
          language: item.language || 'javascript',
          url: item.url || '',
          fileName: item.fileName || '',
          fileSize: typeof item.fileSize === 'number' ? item.fileSize : undefined,
          caption: item.caption || '',
          mimeType: item.mimeType || '',
        }))
      }
    } catch {
      void 0
    }
  }

  const lines = raw.split(/\r?\n/)
  const blocks: Block[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/)
    const audioMatch = line.match(/^\[🎵\s*(.*?)\]\((.*?)\)$/)
    const pdfMatch = line.match(/^\[📄\s*(.*?)\]\((.*?)\)$/)

    if (imgMatch) {
      blocks.push(createBlock('image', '', { caption: imgMatch[1], url: imgMatch[2] }))
    } else if (audioMatch) {
      blocks.push(createBlock('audio', '', { fileName: audioMatch[1], url: audioMatch[2] }))
    } else if (pdfMatch) {
      blocks.push(createBlock('pdf', '', { fileName: pdfMatch[1], url: pdfMatch[2] }))
    } else if (line.startsWith('### ')) {
      blocks.push(createBlock('h3', line.slice(4)))
    } else if (line.startsWith('## ')) {
      blocks.push(createBlock('h2', line.slice(3)))
    } else if (line.startsWith('# ')) {
      blocks.push(createBlock('h1', line.slice(2)))
    } else if (/^[-*]\s+\[ \]\s*/.test(line)) {
      blocks.push(createBlock('todo', line.replace(/^[-*]\s+\[ \]\s*/, ''), { checked: false }))
    } else if (/^[-*]\s+\[x\]\s*/i.test(line)) {
      blocks.push(createBlock('todo', line.replace(/^[-*]\s+\[x\]\s*/i, ''), { checked: true }))
    } else if (/^[-*]\s+/.test(line)) {
      blocks.push(createBlock('bullet', line.replace(/^[-*]\s+/, '')))
    } else if (/^\d+\.\s+/.test(line)) {
      blocks.push(createBlock('numbered', line.replace(/^\d+\.\s+/, '')))
    } else if (line.startsWith('> ')) {
      blocks.push(createBlock('quote', line.slice(2)))
    } else if (line.trim() === '---' || line.trim() === '***') {
      blocks.push(createBlock('divider', ''))
    } else if (line.startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      blocks.push(createBlock('code', codeLines.join('\n')))
    } else {
      blocks.push(createBlock('p', line))
    }
  }

  return blocks.length > 0 ? blocks : [createBlock('p', '')]
}

export const serializeBlocks = (blocks: Block[]): string => JSON.stringify(blocks)

export const blocksToPlainText = (blocks: Block[]): string => {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'h1':
          return `# ${b.content}`
        case 'h2':
          return `## ${b.content}`
        case 'h3':
          return `### ${b.content}`
        case 'todo':
          return `- [${b.checked ? 'x' : ' '}] ${b.content}`
        case 'bullet':
          return `- ${b.content}`
        case 'numbered':
          return `1. ${b.content}`
        case 'quote':
          return `> ${b.content}`
        case 'callout':
          return `> ${b.emoji || '💡'} ${b.content}`
        case 'code':
          return `\`\`\`${b.language || ''}\n${b.content}\n\`\`\``
        case 'divider':
          return '---'
        case 'toggle':
          return `▶ ${b.content}`
        case 'image':
          return `![${b.caption || b.fileName || 'image'}](${b.url || b.content})`
        case 'audio':
          return `[🎵 ${b.fileName || 'Аудиозапись'}](${b.url || b.content})`
        case 'pdf':
          return `[📄 ${b.fileName || 'Документ'}](${b.url || b.content})`
        case 'p':
        default:
          return b.content
      }
    })
    .join('\n\n')
}
