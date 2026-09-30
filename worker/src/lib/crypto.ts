const toHex = (buffer: ArrayBuffer | Uint8Array): string => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltBytes = new Uint8Array(16)
  crypto.getRandomValues(saltBytes)
  const salt = toHex(saltBytes)

  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits'])

  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )

  const hash = toHex(derived)
  return `${salt}:${hash}`
}

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  const [salt, expectedHash] = storedHash.split(':')
  if (!salt || !expectedHash) return false

  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits'])

  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )

  const actualHash = toHex(derived)
  if (actualHash.length !== expectedHash.length) return false

  let diff = 0
  for (let i = 0; i < actualHash.length; i++) {
    diff |= actualHash.charCodeAt(i) ^ expectedHash.charCodeAt(i)
  }
  return diff === 0
}

export const hashToken = async (token: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return toHex(digest)
}

export const generateSecureToken = (): string => {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return toHex(bytes)
}
