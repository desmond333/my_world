import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const ASSETS_DIR = 'dist/assets'
const LOG_FILE = 'BUNDLE_LOG.md'

if (!existsSync(ASSETS_DIR)) {
  console.error(`Не найден ${ASSETS_DIR}. Сначала выполните "npm run build".`)
  process.exit(1)
}

let js = 0
let jsGzip = 0
let css = 0
let cssGzip = 0
const chunks = []

for (const name of readdirSync(ASSETS_DIR)) {
  const path = join(ASSETS_DIR, name)
  if (!statSync(path).isFile()) continue
  const raw = readFileSync(path)
  const gz = gzipSync(raw).length

  if (name.endsWith('.js')) {
    js += raw.length
    jsGzip += gz
    chunks.push({ name, size: raw.length, gzip: gz })
  } else if (name.endsWith('.css')) {
    css += raw.length
    cssGzip += gz
  }
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`
const date = new Date().toISOString().slice(0, 10)
const row = `| ${date} | ${kb(jsGzip)} | ${kb(cssGzip)} | ${kb(jsGzip + cssGzip)} |`

const header = [
  '# Размер бандла',
  '',
  'Автоматически обновляется скриптом `npm run bundle:log` (не чаще одной записи в день).',
  'Источник — собранный `dist/assets`; размеры указаны в gzip.',
  '',
  '| Дата | JS (gzip) | CSS (gzip) | Всего (gzip) |',
  '| --- | --- | --- | --- |',
]

let lines = []
if (existsSync(LOG_FILE)) {
  lines = readFileSync(LOG_FILE, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '')
}

const body = lines.filter((line) => /^\| \d{4}-\d{2}-\d{2} \|/.test(line))
const existing = body.findIndex((line) => line.startsWith(`| ${date} |`))
if (existing >= 0) {
  body[existing] = row
} else {
  body.push(row)
}

const output = [...header, ...body].join('\n') + '\n'
writeFileSync(LOG_FILE, output)

chunks.sort((a, b) => b.size - a.size)
console.log(`Бандл на ${date}: JS ${kb(jsGzip)} (gzip) + CSS ${kb(cssGzip)} (gzip) = ${kb(jsGzip + cssGzip)}`)
console.log('Крупнейшие чанки:')
for (const chunk of chunks.slice(0, 6)) {
  console.log(`  ${chunk.name} — ${kb(chunk.size)} (gzip ${kb(chunk.gzip)})`)
}
