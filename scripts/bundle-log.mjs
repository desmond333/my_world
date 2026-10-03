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

const thresholdPercent = (totalGzip) => {
  const totalKb = totalGzip / 1024
  if (totalKb < 750) return 20
  if (totalKb < 1500) return 10
  return 5
}

const parseRow = (line) => {
  const match = line.match(/^\| (\d{4}-\d{2}-\d{2}) \| (.+) KB \| (.+) KB \| (.+) KB \|$/)
  if (!match) return null
  return {
    date: match[1],
    js: Number(match[2]),
    css: Number(match[3]),
    total: Number(match[4]),
  }
}

const date = new Date().toISOString().slice(0, 10)
const current = { date, js: Math.round(jsGzip / 1024), css: Math.round(cssGzip / 1024), total: Math.round((jsGzip + cssGzip) / 1024) }
const row = `| ${current.date} | ${kb(jsGzip)} | ${kb(cssGzip)} | ${kb(jsGzip + cssGzip)} |`

const header = [
  '# Размер бандла',
  '',
  'Автоматически обновляется скриптом `npm run bundle:log` (одна запись в день).',
  'Источник — собранный `dist/assets`; размеры указаны в gzip.',
  '',
  'Запись добавляется, только если размер изменился не меньше порога относительно последней записи.',
  'Порог снижается с ростом бандла, чтобы ловить более мелкие приросты:',
  '**20%** при общем размере до 750 KB, **10%** от 750 KB до 1.5 MB, **5%** свыше 1.5 MB.',
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

const todayIndex = body.findIndex((line) => line.startsWith(`| ${date} |`))
const last = body.length > 0 ? parseRow(body[body.length - 1]) : null
const threshold = last ? thresholdPercent(last.total * 1024) : 0
const grew =
  !last ||
  (Math.abs(current.js - last.js) / Math.max(last.js, 1)) * 100 >= threshold ||
  (Math.abs(current.css - last.css) / Math.max(last.css, 1)) * 100 >= threshold ||
  (Math.abs(current.total - last.total) / Math.max(last.total, 1)) * 100 >= threshold

if (todayIndex >= 0) {
  body[todayIndex] = row
} else if (grew) {
  body.push(row)
}

const output = [...header, ...body].join('\n') + '\n'
writeFileSync(LOG_FILE, output)

console.log(`Бандл на ${date}: JS ${kb(jsGzip)} (gzip) + CSS ${kb(cssGzip)} (gzip) = ${kb(jsGzip + cssGzip)}`)
if (todayIndex < 0 && !grew) {
  console.log(`Изменение ниже порога (${threshold}%) — запись не добавлена.`)
}
chunks.sort((a, b) => b.size - a.size)
console.log('Крупнейшие чанки:')
for (const chunk of chunks.slice(0, 6)) {
  console.log(`  ${chunk.name} — ${kb(chunk.size)} (gzip ${kb(chunk.gzip)})`)
}
