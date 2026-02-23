import type { PseOption } from '../types/signing.type'

export const STEPS = [
  { id: 1, label: 'Unggah Dokumen' },
  { id: 2, label: 'Setting Penanda Tangan' },
  { id: 3, label: 'Proses Tanda Tangan' },
  { id: 4, label: 'Hasil Akhir' },
] as const

export const PSE_OPTIONS: PseOption[] = [
  { id: 'BSrE', name: 'BSrE', logo: '/assets/images/bsre.webp' },
  { id: 'DocuPro', name: 'DocuPro', logo: '/assets/images/docupro.webp' },
]

export const SIGNATURE_REASON =
  'Dokumen telah disetujui dan ditandatangani secara elektronik'

export const SIGN_API_TIMEOUT_MS = 60_000

export const getSignerListFromEnv = (): { name: string; nik: string }[] => {
  const raw = process.env.NEXT_PUBLIC_SIGNER_LIST
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (s): s is { name: string; nik: string } =>
        typeof s?.name === 'string' &&
        typeof s?.nik === 'string' &&
        s.name.trim() !== '' &&
        // NIK Indonesia: 16 digit angka
        /^\d{16}$/.test(s.nik)
    )
  } catch {
    console.error('NEXT_PUBLIC_SIGNER_LIST tidak valid (bukan JSON yang benar).')
    return []
  }
}