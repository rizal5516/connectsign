import type { NotifType } from '../types/signing.type'

interface ParsedError {
  type: NotifType
  title: string
  message: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseApiError = (error: any): ParsedError => {
  const serverMessage: string =
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    ''
  const serverCode: number | undefined = error?.response?.data?.status_code
  const httpStatus: number | undefined = error?.response?.status

  if (serverCode === 2011 || serverMessage.toLowerCase().includes('pengguna tidak terdaftar')) {
    return {
      type: 'error',
      title: 'Pengguna Tidak Terdaftar',
      message: 'NIK Anda belum terdaftar atau belum memiliki sertifikat elektronik pada PSrE yang dipilih.',
    }
  }

  if (serverMessage.includes('NIK') || serverMessage.toLowerCase().includes('nik salah')) {
    return {
      type: 'error',
      title: 'NIK Tidak Valid',
      message: 'Mohon masukkan NIK yang benar sebelum melanjutkan.',
    }
  }

  if (serverMessage.toLowerCase().includes('passphrase')) {
    return {
      type: 'error',
      title: 'Passphrase Salah',
      message: 'Silakan masukkan passphrase yang benar untuk melanjutkan proses tanda tangan digital.',
    }
  }

  if (httpStatus === 401 || httpStatus === 403) {
    return {
      type: 'error',
      title: 'Autentikasi Gagal',
      message: 'Periksa kembali NIK dan passphrase Anda.',
    }
  }

  if (httpStatus === 500) {
    return {
      type: 'error',
      title: 'Kesalahan Server',
      message: 'Terjadi kesalahan di server tanda tangan. Coba beberapa saat lagi.',
    }
  }

  if (error?.message?.includes('Network Error')) {
    return {
      type: 'error',
      title: 'Koneksi Gagal',
      message: 'Koneksi ke server gagal. Periksa jaringan Anda.',
    }
  }

  if (error?.code === 'ECONNABORTED') {
    return {
      type: 'error',
      title: 'Waktu Habis',
      message: 'Waktu permintaan habis. Silakan coba lagi.',
    }
  }

  return {
    type: 'error',
    title: 'Terjadi Kesalahan',
    message: 'Terjadi kesalahan saat memproses permintaan. Silakan coba kembali.',
  }
}