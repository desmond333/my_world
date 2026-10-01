export const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export const optimizeImageIfNeeded = async (
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85,
): Promise<{ dataUrl: string; size: number }> => {
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
  const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')

  if (isSvg || isGif || file.size < 350 * 1024) {
    const dataUrl = await readFileAsDataUrl(file)
    return { dataUrl, size: file.size }
  }

  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = img

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        readFileAsDataUrl(file).then((dataUrl) => resolve({ dataUrl, size: file.size }))
        return
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const dataUrl = canvas.toDataURL(outputMime, quality)
      const approxBytes = Math.round((dataUrl.length * 3) / 4)
      resolve({ dataUrl, size: approxBytes })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      readFileAsDataUrl(file).then((dataUrl) => resolve({ dataUrl, size: file.size }))
    }

    img.src = objectUrl
  })
}

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const detectMediaType = (file: File): 'image' | 'audio' | 'pdf' | null => {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('audio/')) return 'audio'
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) return 'pdf'
  return null
}
