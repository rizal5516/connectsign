const MAX_PDF_SIZE_MB = 20
const MAX_IMAGE_SIZE_MB = 2

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.readAsDataURL(file)
  })
}

export const urlToBase64 = async (url: string): Promise<string> => {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = () => reject(new Error('Gagal membaca URL'))
    reader.readAsDataURL(blob)
  })
}

export const validatePdfFile = (file: File): string | null => {
  if (file.type !== 'application/pdf') return 'File harus berformat PDF.'
  if (file.size > MAX_PDF_SIZE_MB * 1024 * 1024)
    return `Ukuran file PDF maksimal ${MAX_PDF_SIZE_MB} MB.`
  return null
}

export const validateImageFile = (file: File): string | null => {
  const allowed = ['image/jpeg', 'image/png']
  if (!allowed.includes(file.type)) return 'File harus berupa gambar JPG atau PNG.'
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024)
    return `Ukuran gambar tanda tangan maksimal ${MAX_IMAGE_SIZE_MB} MB.`
  return null
}

export const buildSignedFileName = (originalName: string): string => {
  const sanitized = originalName
    .replace(/\.pdf$/i, '')
    .replace(/[^a-zA-Z0-9_\-. ]/g, '_')
  return `${sanitized}_signed.pdf`
}

export const base64ToBlobUrl = (base64: string): string => {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const blob = new Blob([bytes], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
}