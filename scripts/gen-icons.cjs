const fs = require('fs')
const zlib = require('zlib')

const src = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\92813ed9-793f-440c-afff-a25a42b9539c\\app_icon_1790701055757.jpg'

function makePNG(width, height, r, g, b) {
  const raw = Buffer.alloc(height * (1 + width * 4))
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0
    for (let x = 0; x < width; x++) {
      const i = y * (width * 4 + 1) + 1 + x * 4
      raw[i] = r
      raw[i + 1] = g
      raw[i + 2] = b
      raw[i + 3] = 255
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 })

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(25)
  ihdr.writeUInt32BE(13, 0)
  ihdr.write('IHDR', 4)
  ihdr.writeUInt32BE(width, 8)
  ihdr.writeUInt32BE(height, 12)
  ihdr[16] = 8
  ihdr[17] = 2
  ihdr[18] = 0
  ihdr[19] = 0
  ihdr[20] = 0
  const crc1 = crc32(ihdr.slice(4, 21))
  ihdr.writeUInt32BE(crc1 >>> 0, 21)

  const idat = Buffer.alloc(12 + compressed.length)
  idat.writeUInt32BE(compressed.length, 0)
  idat.write('IDAT', 4)
  compressed.copy(idat, 8)
  const crc2 = crc32(Buffer.concat([Buffer.from('IDAT'), compressed]))
  idat.writeUInt32BE(crc2 >>> 0, 8 + compressed.length)

  const iend = Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130])

  return Buffer.concat([sig, ihdr, idat, iend])
}

function crc32(buf) {
  let crc = 0xffffffff
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return crc ^ 0xffffffff
}

if (!fs.existsSync('public')) fs.mkdirSync('public')

fs.writeFileSync('public/icon-192.png', makePNG(192, 192, 21, 23, 23))
fs.writeFileSync('public/icon-512.png', makePNG(512, 512, 21, 23, 23))
fs.writeFileSync('public/icon-180.png', makePNG(180, 180, 21, 23, 23))
fs.writeFileSync('public/icon-32.png', makePNG(32, 32, 21, 23, 23))

console.log('Placeholder PNGs created. Replace with real icons!')
