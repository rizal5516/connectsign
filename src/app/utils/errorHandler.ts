import type { NotifType } from "../types/signing.type";

interface ParsedError {
  type: NotifType;
  title: string;
  message: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseApiError = (error: any): ParsedError => {
  const serverMessage: string =
    error?.response?.data?.error || error?.response?.data?.message || "";
  const serverCode: number | undefined =
    error?.response?.data?.status_code ?? error?.response?.data?.status;
  const httpStatus: number | undefined = error?.response?.status;

  const msgLower = serverMessage.toLowerCase();

  // --- Deteksi berdasarkan pesan dari server (prioritas tertinggi) ---
  // Menangani kasus BSSN mengembalikan 500 tapi pesannya spesifik tentang passphrase/NIK

  if (serverCode === 2011 || msgLower.includes("pengguna tidak terdaftar")) {
    return {
      type: "error",
      title: "Pengguna Tidak Terdaftar",
      message:
        "NIK Anda belum terdaftar atau belum memiliki sertifikat elektronik pada PSrE yang dipilih.",
    };
  }

  if (
    msgLower.includes("passphrase salah") ||
    msgLower.includes("passphrase tidak valid") ||
    msgLower.includes("passphrase invalid") ||
    msgLower.includes("wrong passphrase") ||
    msgLower.includes("incorrect passphrase") ||
    // BSSN kadang hanya menyebut "passphrase" dalam pesan error-nya
    (msgLower.includes("passphrase") &&
      (msgLower.includes("salah") ||
        msgLower.includes("invalid") ||
        msgLower.includes("wrong") ||
        msgLower.includes("incorrect") ||
        msgLower.includes("tidak") ||
        // fallback: jika pesan mengandung "passphrase" dan HTTP 500, kemungkinan besar passphrase salah
        httpStatus === 500))
  ) {
    return {
      type: "error",
      title: "Passphrase Salah",
      message:
        "Silakan masukkan passphrase yang benar untuk melanjutkan proses tanda tangan digital.",
    };
  }

  if (
    serverMessage.includes("NIK") ||
    msgLower.includes("nik salah") ||
    msgLower.includes("nik tidak valid") ||
    msgLower.includes("nik invalid")
  ) {
    return {
      type: "error",
      title: "NIK Tidak Valid",
      message: "Mohon masukkan NIK yang benar sebelum melanjutkan.",
    };
  }

  // --- Deteksi berdasarkan HTTP status ---

  if (httpStatus === 401 || httpStatus === 403) {
    return {
      type: "error",
      title: "Autentikasi Gagal",
      message: "Periksa kembali NIK dan passphrase Anda.",
    };
  }

  if (httpStatus === 500) {
    return {
      type: "error",
      title: "Kesalahan Server",
      message:
        "Terjadi kesalahan di server tanda tangan. Coba beberapa saat lagi.",
    };
  }

  if (httpStatus === 502) {
    return {
      type: "error",
      title: "Layanan Tidak Tersedia",
      message:
        "Tidak dapat terhubung ke layanan tanda tangan. Coba beberapa saat lagi.",
    };
  }

  // --- Deteksi error jaringan/timeout ---

  if (error?.message?.includes("Network Error")) {
    return {
      type: "error",
      title: "Koneksi Gagal",
      message: "Koneksi ke server gagal. Periksa jaringan Anda.",
    };
  }

  if (error?.code === "ECONNABORTED") {
    return {
      type: "error",
      title: "Waktu Habis",
      message: "Waktu permintaan habis. Silakan coba lagi.",
    };
  }

  return {
    type: "error",
    title: "Terjadi Kesalahan",
    message:
      "Terjadi kesalahan saat memproses permintaan. Silakan coba kembali.",
  };
};
