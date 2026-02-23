export type NotifType = 'error' | 'success' | 'info'

export interface NotifState {
  open: boolean
  type: NotifType
  title: string
  message: string
}

export interface Signer {
  name: string
  nik: string
}

export interface AdditionalSigner {
  nik: string
  passphrase: string
}

export interface SignaturePosition {
  x: number
  y: number
  width: number
  height: number
  pdfWidth?: number
  pdfHeight?: number
}

export interface SignatureProperties {
  tampilan: 'VISIBLE' | 'INVISIBLE'
  imageBase64?: string
  tag?: string
  width?: number
  height?: number
  location?: string
  reason?: string
  contactInfo?: string
}

export interface SignPdfPayload {
  nik: string
  passphrase: string
  signatureProperties: SignatureProperties[]
  file: string[]
}

export type SignerStatus = 'done' | 'progress' | 'waiting'

export type PseProvider = 'BSrE' | 'DocuPro'

export interface PseOption {
  id: PseProvider
  name: string
  logo: string
}

export type Step = 1 | 2 | 3 | 4
export type SigningPhase = 1 | 2