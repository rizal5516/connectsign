/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRef, useState, useEffect } from 'react'
import axios from 'axios'
import PdfViewer from './components/PdfViewer'
import Image from 'next/image'
import { HiLightBulb } from 'react-icons/hi'

export default function Home() {
    const signerList = [
        // { name: "Ega Rahmatul", nik: "1306146705000001" },
        { name: "Muhammad Rizal Qowi", nik: "3671011707010004" },
    ]

    const [pdfFiles, setPdfFiles] = useState<File[]>([])
    const [signedPdfUrls, setSignedPdfUrls] = useState<string[]>([])
    const [pdfPageSize, setPdfPageSize] = useState({ width: 595, height: 842 })
    const [pdfBase64Preview, setPdfBase64Preview] = useState<string>('')
    const [isDragActive, setIsDragActive] = useState(false)
    const [signingPhase, setSigningPhase] = useState<1 | 2>(1)
    const [currentSignerIndex, setCurrentSignerIndex] = useState(0)

    const [nik, setNik] = useState('')
    const [passphrase, setPassphrase] = useState('')
    const [pageNumber, setPageNumber] = useState(1)
    const [visibleSignature, setVisibleSignature] = useState(false)
    const [imageBase64, setImageBase64] = useState<string>('')
    const [signaturePos, setSignaturePos] = useState({ x: 100, y: 100, width: 150, height: 80 })
    const signaturePosRef = useRef(signaturePos)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [activeFileIndex, setActiveFileIndex] = useState(0)
    const [additionalSigners, setAdditionalSigners] = useState<Array<{ nik: string, passphrase: string }>>([
        { nik: '', passphrase: '' },
    ])
    const [tteCount, setTteCount] = useState(1)
    const [pse, setPse] = useState<string>('BSrE')
    const [showPseModal, setShowPseModal] = useState(false)
    const [showAdditionalTTE, setShowAdditionalTTE] = useState(false)

    const [showPassphrase, setShowPassphrase] = useState(false)
    const [showAdditionalPassphrases, setShowAdditionalPassphrases] = useState<boolean[]>([false])

    const passphraseRef = useRef<HTMLInputElement | null>(null)
    const passphrase2Ref = useRef<HTMLInputElement | null>(null)
    const autoFinalDownloadRanRef = useRef(false)

    const signBtnRef = useRef<HTMLButtonElement | null>(null)

    const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const [signerCount, setSignerCount] = useState<number | ''>('')
    const [isUserSigner, setIsUserSigner] = useState(false)
    const [signerCountMode, setSignerCountMode] = useState<'select' | 'custom'>('select')
    const [customSignerCount, setCustomSignerCount] = useState<number | ''>('')

    const canUpload = typeof signerCount === "number" && signerCount > 0

    const refocusPassphrase = () => {
        setTimeout(() => {
            if (step === 2) passphraseRef.current?.focus()
            if (step === 3) passphrase2Ref.current?.focus()
        }, 50)
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragActive(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragActive(false)
    }

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragActive(false)
        const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf')
        if (files.length > 0) {
            const event = { target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>
            await handleFileChange(event)
        } else {
            openNotif('error', 'File Tidak Didukung', 'Hanya file PDF yang dapat diunggah.')
        }
    }

    const addAdditionalSigner = () => {
        setAdditionalSigners(prev => [...prev, { nik: '', passphrase: '' }])
        setShowAdditionalPassphrases(prev => [...prev, false])
    }

    const removeAdditionalSigner = (index: number) => {
        setAdditionalSigners(prev => prev.filter((_, i) => i !== index))
        setShowAdditionalPassphrases(prev => prev.filter((_, i) => i !== index))
    }

    const toggleAdditionalPassphrase = (index: number) => {
        setShowAdditionalPassphrases(prev =>
            prev.map((show, i) => i === index ? !show : show)
        )
    }

    const updateAdditionalSigner = (index: number, field: 'nik' | 'passphrase', value: string) => {
        setAdditionalSigners(prev =>
            prev.map((signer, i) =>
                i === index ? { ...signer, [field]: value } : signer
            )
        )
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            setIsLoading(true)
            await new Promise(resolve => setTimeout(resolve, 1500))

            setPdfFiles(files)
            setActiveFileIndex(0)
            // setNik('3671011707010004') 
            setVisibleSignature(false)

            if (files.length === 1) {
                const base64 = await fileToBase64(files[0])
                setPdfBase64Preview(base64)
            }

            setSigningPhase(1)

            if (typeof signerCount === "number" && signerCount > 1) {
                setStep(2)
            } else {
                setNik(signerList[0]?.nik || "")
                setAdditionalSigners([{ nik: "", passphrase: "" }])
                setShowAdditionalPassphrases([false])
                setStep(3)
            }

            setIsLoading(false)
        } else {
            openNotif('error', 'Gagal', 'Gagal mengunggah PDF.')
        }
    }

    const handleSignatureImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            try {
                setIsLoading(true)

                if (!file.type.startsWith('image/')) {
                    openNotif('error', 'File Tidak Didukung', 'File harus berupa gambar (JPG/PNG).')
                    return
                }

                const base64 = await fileToBase64(file)

                setImageBase64(base64)
                openNotif(
                    'success',
                    'Berhasil',
                    `Gambar tanda tangan berhasil diunggah! (ukuran ${Math.round(base64.length / 1024)} KB)`
                )
            } catch (error) {
                handleError(error, "Gagal memproses gambar tanda tangan.")
            } finally {
                setIsLoading(false)
            }
        }
    }

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                const result = reader.result as string
                const base64 = result.split(',')[1]
                resolve(base64)
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const urlToBase64Pdf = async (url: string): Promise<string> => {
        const res = await fetch(url)
        const blob = await res.blob()

        return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                const result = reader.result as string
                resolve(result.split(",")[1])
            }
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    }

    const signPDF = async () => {
        if (pdfFiles.length === 0) {
            openNotif('error', 'Dokumen Tidak Ada', 'Tidak ada file PDFs.')
            return
        }

        if (!nik || !passphrase) {
            openNotif('error', 'Passphrase Diperlukan', 'NIK dan passphrase wajib diisi untuk melakukan tanda tangan digital.')
            return
        }

        if (!pse?.trim()) {
            openNotif('info', 'Pilih PSrE Terlebih Dahulu', 'Silakan pilih PSrE yang akan digunakan untuk proses TTE.')
            setShowPseModal(true)
            return
        }

        if (visibleSignature && !imageBase64) {
            openNotif('error', 'Gambar Tanda Tangan Diperlukan', 'Harap unggah gambar tanda tangan terlebih dahulu.')
            return
        }

        setIsLoading(true)

        // ✅ simpan hasil sebelumnya (penting untuk chaining)
        const prevSignedUrls = [...signedPdfUrls]

        try {
            const signedUrls: string[] = []

            for (let i = 0; i < pdfFiles.length; i++) {
                const file = pdfFiles[i]

                let inputBase64 = await fileToBase64(file)
                if (currentSignerIndex > 0 && prevSignedUrls[i]) {
                    inputBase64 = await urlToBase64Pdf(prevSignedUrls[i])
                }

                const signatureProps =
                    visibleSignature && imageBase64
                        ? {
                            imageBase64,
                            tampilan: "VISIBLE",
                            width: signaturePos.width,
                            height: signaturePos.height,
                            tag: "#",
                            location: "null",
                            reason: "Dokumen telah disetujui dan ditandatangani secara elektronik",
                            contactInfo: "null",
                        }
                        : { tampilan: "INVISIBLE" }

                const payload = {
                    nik: nik.trim(),
                    passphrase: passphrase.trim(),
                    signatureProperties: [signatureProps],
                    file: [inputBase64],
                }

                const res = await axios.post('/api/sign-pdf', payload, { timeout: 60000 })

                if (res.data?.file?.[0]) {
                    const signedBase64 = res.data.file[0]
                    const blob = new Blob(
                        [Uint8Array.from(atob(signedBase64), (c) => c.charCodeAt(0))],
                        { type: 'application/pdf' }
                    )
                    const url = URL.createObjectURL(blob)
                    signedUrls.push(url)
                } else {
                    throw new Error(`Invalid response for file ${i + 1}`)
                }
            }

            setSignedPdfUrls(signedUrls)

            setTteCount(1)
            openNotif('success', 'Berhasil', 'Dokumen berhasil ditandatangani!')

            const totalSigners =
                typeof signerCount === 'number' && signerCount > 0 ? signerCount : signerList.length

            const nextIndex = currentSignerIndex + 1
            setCurrentSignerIndex(nextIndex)

            if (nextIndex >= totalSigners) setStep(4)
            else setStep(3)

        } catch (e: any) {
            const serverMessage = e?.response?.data?.error || e?.response?.data?.message || ""
            const serverCode = e?.response?.data?.status_code

            if (serverCode === 2011 || serverMessage.toLowerCase().includes("pengguna tidak terdaftar")) {
                openNotif('error', 'Pengguna Tidak Terdaftar', 'NIK Anda belum terdaftar atau belum memiliki sertifikat elektronik pada PSrE yang dipilih.')
            } else if (serverMessage.includes("NIK") || serverMessage.toLowerCase().includes("nik salah")) {
                openNotif('error', 'NIK Tidak Valid', 'Mohon masukkan NIK yang benar sebelum melanjutkan.')
            } else if (serverMessage.includes("Passphrase") || serverMessage.toLowerCase().includes("passphrase salah")) {
                openNotif('error', 'Passphrase Salah', 'Silakan masukkan passphrase yang benar untuk melanjutkan proses tanda tangan digital.')
            } else if (e?.response?.status === 401 || e?.response?.status === 403) {
                openNotif('error', 'Autentikasi Gagal', 'Periksa kembali NIK dan passphrase Anda.')
            } else if (e?.response?.status === 500) {
                openNotif('error', 'Terjadi Kesalahan', 'Terjadi kesalahan di server tanda tangan. Coba beberapa saat lagi.')
            } else {
                openNotif('error', 'Terjadi Kesalahan', 'Terjadi kesalahan saat memproses permintaan Anda.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleAdditionalTTE = async () => {
        const validSigners = additionalSigners.filter(
            s => s.nik?.trim() && s.passphrase?.trim()
        )

        if (validSigners.length === 0) {
            openNotif('error', 'Data Tidak Lengkap', 'Harap masukkan NIK dan passphrase penandatangan tambahan.')
            return
        }

        const lastSignedPdf = signedPdfUrls[signedPdfUrls.length - 1]
        if (!lastSignedPdf) {
            openNotif('error', 'Dokumen Belum Tersedia', 'Dokumen belum tersedia untuk ditandatangani.')
            return
        }

        try {
            setIsLoading(true)

            // Ambil PDF terakhir → base64
            const response = await fetch(lastSignedPdf)
            const blob = await response.blob()

            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    const result = reader.result as string
                    resolve(result.split(',')[1])
                }
                reader.onerror = reject
                reader.readAsDataURL(blob)
            })

            let currentPdfBase64 = base64

            // Loop setiap penandatangan tambahan
            for (const signer of validSigners) {
                const payload = {
                    nik: signer.nik.trim(),
                    passphrase: signer.passphrase.trim(),
                    signatureProperties: [
                        {
                            tampilan: "INVISIBLE",
                            tag: "#",
                            width: 100,
                            height: 75,
                            location: "null",
                            reason: "Dokumen telah disetujui dan ditandatangani secara elektronik",
                            contactInfo: "null",
                        },
                    ],
                    file: [currentPdfBase64],
                }

                const res = await axios.post("/api/sign-pdf", payload)

                if (res.data?.file?.[0]) {
                    currentPdfBase64 = res.data.file[0]
                } else {
                    throw new Error(`Gagal TTE untuk NIK ${signer.nik}`)
                }
            }

            const finalBlob = new Blob(
                [Uint8Array.from(atob(currentPdfBase64), c => c.charCodeAt(0))],
                { type: "application/pdf" }
            )

            const finalUrl = URL.createObjectURL(finalBlob)

            setSignedPdfUrls(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = finalUrl
                return updated
            })

            openNotif('success', `Tanda Tangan Berhasil`, `Tanda Tangan Berhasil.`)
            setTteCount(1 + validSigners.length)
            setShowAdditionalTTE(false)
            setAdditionalSigners([])
            setCurrentSignerIndex(prev => prev + validSigners.length)
            setStep(4)

        } catch (e: any) {
            const serverMessage =
                e?.response?.data?.error ||
                e?.response?.data?.message ||
                ""

            const serverCode = e?.response?.data?.status_code

            if (
                serverCode === 2011 ||
                serverMessage.toLowerCase().includes("pengguna tidak terdaftar")
            ) {
                openNotif(
                    'error',
                    'Pengguna Tidak Terdaftar',
                    'NIK Anda belum terdaftar atau belum memiliki sertifikat elektronik pada PSrE yang dipilih.'
                )
            } else if (
                serverMessage.includes("NIK") ||
                serverMessage.toLowerCase().includes("nik salah")
            ) {
                openNotif(
                    'error',
                    'NIK Tidak Valid',
                    'Mohon masukkan NIK yang benar sebelum melanjutkan.'
                )
            } else if (
                serverMessage.includes("Passphrase") ||
                serverMessage.toLowerCase().includes("passphrase salah")
            ) {
                openNotif(
                    'error',
                    'Passphrase Salah',
                    'Silakan masukkan passphrase yang benar untuk melanjutkan proses tanda tangan digital.'
                )
            } else if (e?.response?.status === 401 || e?.response?.status === 403) {
                openNotif(
                    'error',
                    'Autentikasi Gagal',
                    'Periksa kembali NIK dan passphrase Anda.'
                )
            } else if (e?.response?.status === 500) {
                openNotif(
                    'error',
                    'Terjadi Kesalahan',
                    'Terjadi kesalahan di server tanda tangan. Coba beberapa saat lagi.'
                )
            } else {
                openNotif(
                    'error',
                    'Terjadi Kesalahan',
                    'Terjadi kesalahan saat memproses permintaan Anda.'
                )
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleError = (error: any, userMessage?: string) => {
        console.debug("Terjadi error:", error?.message || error)
        const networkError = error?.message?.includes("Network Error")
        const timeoutError = error?.code === "ECONNABORTED"

        const defaultMsg =
            networkError
                ? "Koneksi ke server gagal. Periksa jaringan Anda."
                : timeoutError
                    ? "Waktu permintaan habis. Silakan coba lagi."
                    : "Terjadi kesalahan saat memproses permintaan. Silakan coba kembali."

        openNotif('error', 'Terjadi Kesalahan', userMessage || defaultMsg)
    }

    type NotifType = 'error' | 'success' | 'info'

    const [notif, setNotif] = useState<{
        open: boolean
        type: NotifType
        title: string
        message: string
    }>({
        open: false,
        type: 'info',
        title: '',
        message: '',
    })

    const openNotif = (type: NotifType, title: string, message: string) => {
        if (notifTimerRef.current) clearTimeout(notifTimerRef.current)

        setNotif({ open: true, type, title, message })

        notifTimerRef.current = setTimeout(() => {
            setNotif(prev => ({ ...prev, open: false }))
        }, 3000)
    }

    const closeNotif = () => {
        if (notifTimerRef.current) {
            clearTimeout(notifTimerRef.current)
            notifTimerRef.current = null
        }
        setNotif(prev => ({ ...prev, open: false }))
        refocusPassphrase()
    }

    const getSignerStatus = (index: number) => {
        if (index < currentSignerIndex) return 'done'
        if (index === currentSignerIndex) return 'progress'
        return 'waiting'
    }

    const totalSigners =
        typeof signerCount === "number" && signerCount > 0
            ? signerCount
            : signerList.length

    const showSignerSidebar = totalSigners > 1


    useEffect(() => {
        if (step === 2) {
            setTimeout(() => passphraseRef.current?.focus(), 50)
        }

        if (step === 3) {
            setTimeout(() => passphrase2Ref.current?.focus(), 50)
        }
    }, [step])

    useEffect(() => {
        return () => {
            if (notifTimerRef.current) clearTimeout(notifTimerRef.current)
        }
    }, [])

    useEffect(() => {
        if (step !== 3) return

        const s = signerList[currentSignerIndex]
        if (!s) return

        setNik(s.nik)
        setPassphrase('')
        setShowPassphrase(false)
    }, [currentSignerIndex, step])

    useEffect(() => {
        if (step !== 4) return
        if (!signedPdfUrls?.[0]) return
        if (autoFinalDownloadRanRef.current) return

        autoFinalDownloadRanRef.current = true

        const url = signedPdfUrls[0]

        const originalName = pdfFiles?.[0]?.name || "Dokumen_TTE_Final.pdf"
        const baseName = originalName.replace(/\.pdf$/i, "")
        const signedFileName = `${baseName}_signed.pdf`

        setTimeout(() => {
            const a = document.createElement("a")
            a.href = url
            a.download = signedFileName
            document.body.appendChild(a)
            a.click()
            a.remove()
        }, 200)
    }, [step, signedPdfUrls, pdfFiles])


    function NotifModal({
        open,
        type,
        title,
        message,
        onClose,
    }: {
        open: boolean
        type: 'error' | 'success' | 'info'
        title: string
        message: string
        onClose: () => void
    }) {
        if (!open) return null

        const accent =
            type === 'success'
                ? 'from-green-400 to-emerald-500'
                : type === 'error'
                    ? 'from-red-400 to-rose-500'
                    : 'from-[#2FAAE1] to-[#0C4F81]'

        const Icon = () => {
            if (type === 'success') {
                return (
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-green-300 blur-xl opacity-40" />
                        <div className="relative w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                )
            }

            if (type === 'error') {
                return (
                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v4m0 4h.01" />
                        </svg>
                    </div>
                )
            }

            return (
                <div className="w-20 h-20 rounded-full bg-[#E8F7FF] flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#0C4F81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8h.01M11 12h1v6" />
                    </svg>
                </div>
            )
        }

        return (
            <div
                className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
                onMouseDown={(e) => {
                    e.preventDefault()
                    onClose()
                }}
            >
                <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden text-center animate-[scaleIn_0.25s_ease-out]">

                    {/* Top accent */}
                    <div className={`h-1 w-full bg-gradient-to-r ${accent}`} />

                    <div className="p-8">
                        <div className="flex justify-center mb-6">
                            <Icon />
                        </div>

                        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {title}
                        </h3>

                        <p className="text-gray-600 mt-3 leading-relaxed text-base">
                            {message}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    function SignerSidebar({
        signerList,
        currentSignerIndex,
    }: {
        signerList: { name: string; nik: string }[]
        currentSignerIndex: number
    }) {
        return (
            <div className="flex-[0.25] bg-[#FFFDF8] rounded-3xl shadow-xl border border-[#2FAAE1]/30 p-5 self-start mt-2">
                <h3 className="text-lg font-extrabold text-[#0C4F81] mb-4">
                    Penandatangan
                </h3>

                <div className="space-y-3">
                    {signerList.map((s, idx) => {
                        const status =
                            idx < currentSignerIndex
                                ? 'done'
                                : idx === currentSignerIndex
                                    ? 'progress'
                                    : 'waiting'

                        return (
                            <div
                                key={idx}
                                className={`flex items-center justify-between p-3 rounded-2xl border transition-all
                ${status === 'done'
                                        ? 'bg-green-50 border-green-300'
                                        : status === 'progress'
                                            ? 'bg-blue-50 border-[#2FAAE1]'
                                            : 'bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm
                    ${status === 'done'
                                                ? 'bg-green-500 text-white'
                                                : status === 'progress'
                                                    ? 'bg-[#2FAAE1] text-white'
                                                    : 'bg-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {idx + 1}
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-[#0C4F81]">
                                            {s.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {status === 'done'
                                                ? 'Selesai'
                                                : status === 'progress'
                                                    ? 'On Progress'
                                                    : 'Waiting'}
                                        </span>
                                    </div>
                                </div>

                                {/* ICON */}
                                {status === 'done' && (
                                    <span className="text-green-600 font-bold">✔</span>
                                )}
                                {status === 'progress' && (
                                    <span className="animate-spin text-[#2FAAE1]">⟳</span>
                                )}
                                {status === 'waiting' && (
                                    <span className="text-gray-400">…</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-white flex flex-col overflow-hidden">

            <NotifModal
                open={notif.open}
                type={notif.type}
                title={notif.title}
                message={notif.message}
                onClose={closeNotif}
            />

            {step === 1 && (
                <div className="relative min-h-screen bg-gradient-to-br from-[#E8F7FF] via-white to-[#FFF8E6] flex justify-center px-6 sm:px-10 py-12">

                    {/* === Breadcrumbs Progress === */}
                    <div className="absolute top-6 left-0 right-0 z-50 pointer-events-none">
                        <div className="w-full flex justify-center mb-8 sm:mb-10 mt-4 sm:mt-6">
                            <div className="flex items-center justify-between w-full max-w-[90%] sm:max-w-2xl relative">
                                {[
                                    { id: 1, label: "Unggah Dokumen" },
                                    { id: 2, label: "Setting Penanda Tangan" },
                                    { id: 3, label: "Proses Tanda Tangan" },
                                    { id: 4, label: "Hasil Akhir" },
                                ].map((item, index, arr) => (
                                    <div key={item.id} className="flex flex-col items-center flex-1 relative">
                                        {index < arr.length - 1 && (
                                            <div
                                                className={`absolute top-4 left-1/2 w-full h-[2px] z-0 transition-colors duration-300 ${step > item.id ? "bg-[#2FAAE1]" : "bg-gray-200"
                                                    }`}
                                            />
                                        )}
                                        <div
                                            className={`z-10 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 ${step === item.id
                                                ? "bg-gradient-to-r from-[#0C4F81] to-[#2FAAE1] text-white shadow-md"
                                                : step > item.id
                                                    ? "bg-[#2FAAE1] text-white"
                                                    : "bg-gray-200 text-gray-500"
                                                }`}
                                        >
                                            {item.id}
                                        </div>
                                        <p
                                            className={`mt-2 text-[10px] sm:text-xs font-medium text-center ${step >= item.id ? "text-[#0C4F81]" : "text-gray-400"
                                                }`}
                                        >
                                            {item.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* === Logo Kiri Atas (Desktop Only) === */}
                    <div className="fixed top-5 left-5 z-50 hidden sm:block">  
                        <Image
                            src="/assets/images/logo-blpid-1.png"
                            alt="Balai Layanan Penghubung Identitas Digital"
                            width={240}
                            height={60}
                            className="object-contain h-15 w-auto"
                        />
                    </div>


                    {/* === Floating Logo === */}
                    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-10">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-100">
                            <Image
                                src="/assets/images/logo-blpid.png"
                                alt="Logo BLPID"
                                width={48}
                                height={48}
                                className="object-contain w-9 h-9 sm:w-12 sm:h-12"
                            />
                        </div>
                    </div>

                    {isLoading && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
                            <div className="w-full max-w-md px-6">
                                <div className="bg-white rounded-3xl shadow-2xl border border-[#2FAAE1]/30 p-8 text-center">
                                    <div className="flex justify-center">
                                        <div className="relative">
                                            <div className="w-20 h-20 border-4 border-gray-200 rounded-full" />
                                            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-[#0C4F81] rounded-full animate-spin" />
                                            <div
                                                className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-t-[#2FAAE1] rounded-full animate-spin"
                                                style={{ animationDirection: "reverse", animationDuration: "1.2s" }}
                                            />
                                            <div
                                                className="absolute top-4 left-4 w-12 h-12 border-4 border-transparent border-t-[#FFA62B] rounded-full animate-spin"
                                                style={{ animationDuration: "1.8s" }}
                                            />
                                        </div>
                                    </div>

                                    <h3 className="mt-6 text-lg font-bold text-[#0C4F81]">Memproses File PDF</h3>
                                    <p className="mt-1 text-sm text-gray-600">Harap tunggu sebentar...</p>

                                    <div className="mt-5 flex justify-center space-x-2">
                                        <div className="w-2 h-2 bg-[#0C4F81] rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-[#2FAAE1] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                        <div className="w-2 h-2 bg-[#FFA62B] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === MAIN CONTAINER (2 CARD) === */}
                    <div className="flex w-full max-w-[1500px] gap-8 items-start mt-20">

                        {/* ================= CARD KIRI: UPLOAD ================= */}
                        <div className="flex-[0.65] bg-white rounded-3xl shadow-2xl border border-[#2FAAE1]/30 overflow-hidden flex flex-col">
                            <div className="text-center py-5 border-b border-[#2FAAE1]/30 bg-gradient-to-r from-[#0C4F81]/5 to-[#2FAAE1]/5">
                                <h2 className="text-2xl font-extrabold text-[#0C4F81]">Unggah Dokumen</h2>
                                <p className="text-sm text-gray-600">Seret file PDF atau pilih secara manual.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-white">
                                {(
                                    <>
                                        <div
                                            onDragOver={(e) => {
                                                if (!canUpload) return
                                                handleDragOver(e)
                                            }}
                                            onDragLeave={(e) => {
                                                if (!canUpload) return
                                                handleDragLeave(e)
                                            }}
                                            onDrop={async (e) => {
                                                if (!canUpload) {
                                                    e.preventDefault()
                                                    openNotif("info", "Jumlah Penanda Tangan Wajib", "Silakan pilih/isi jumlah penanda tangan terlebih dahulu sebelum mengunggah dokumen.")
                                                    return
                                                }
                                                await handleDrop(e)
                                            }}
                                            onClick={() => {
                                                if (!canUpload) {
                                                    openNotif("info", "Jumlah Penanda Tangan Wajib", "Silakan pilih/isi jumlah penanda tangan terlebih dahulu sebelum mengunggah dokumen.")
                                                }
                                            }}
                                            className={`relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all duration-300
    ${!canUpload
                                                    ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-70"
                                                    : isDragActive
                                                        ? "border-[#FFA62B] bg-orange-50 cursor-pointer"
                                                        : "border-gray-300 hover:border-[#FFA62B] hover:bg-orange-50/30 cursor-pointer"
                                                }`}
                                        >
                                            <svg
                                                className={`w-12 h-12 mb-3 ${canUpload ? "text-[#0C4F81]" : "text-gray-400"}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                                                />
                                            </svg>

                                            <p className={`font-semibold text-center text-base sm:text-lg leading-snug ${canUpload ? "text-gray-700" : "text-gray-500"}`}>
                                                {canUpload
                                                    ? (isDragActive ? "Lepaskan file di sini..." : "Seret & letakkan file PDF di sini")
                                                    : "Lengkapi jumlah penanda tangan terlebih dahulu"}
                                            </p>

                                            <p className={`text-sm mt-2 ${canUpload ? "text-gray-500" : "text-gray-400"}`}>
                                                {canUpload ? "atau klik untuk memilih file" : "Setelah itu, upload dokumen akan terbuka"}
                                            </p>

                                            <label
                                                htmlFor="pdfUpload"
                                                className={`mt-5 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform
      ${canUpload
                                                        ? "bg-gradient-to-r from-[#0C4F81] to-[#FFA62B] text-white hover:shadow-md hover:scale-105 cursor-pointer"
                                                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                    }`}
                                                onClick={(e) => {
                                                    if (!canUpload) {
                                                        e.preventDefault()
                                                        openNotif("info", "Jumlah Penanda Tangan Wajib", "Silakan pilih/isi jumlah penanda tangan terlebih dahulu sebelum mengunggah dokumen.")
                                                    }
                                                }}
                                            >
                                                Pilih File PDF
                                            </label>

                                            <input
                                                id="pdfUpload"
                                                type="file"
                                                accept="application/pdf"
                                                multiple
                                                onChange={(e) => {
                                                    if (!canUpload) {
                                                        openNotif("info", "Jumlah Penanda Tangan Wajib", "Silakan pilih/isi jumlah penanda tangan terlebih dahulu sebelum mengunggah dokumen.")
                                                        return
                                                    }
                                                    handleFileChange(e)
                                                }}
                                                className="hidden"
                                                disabled={!canUpload}
                                            />
                                        </div>


                                        {/* Tips */}
                                        <div className="mt-6 bg-gradient-to-r from-[#E8F7FF] to-[#FFF8E6] border border-[#FFA62B]/30 rounded-2xl p-5">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 bg-[#FFA62B] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <HiLightBulb className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="text-sm text-gray-700">
                                                    <p className="font-semibold mb-1 text-[#0C4F81]">Tips:</p>
                                                    <ul className="space-y-1 text-gray-600">
                                                        <li>• Pilih satu atau beberapa file PDF</li>
                                                        <li>• Pastikan file tidak terproteksi password</li>
                                                        <li>• Maksimal ukuran file 10 MB per dokumen</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ================= CARD KANAN: PENGATURAN PENANDA TANGAN ================= */}
                        <div className="flex-[0.35] bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-[#0C4F81]/10 relative overflow-hidden p-8 self-start mt-2">
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                                <Image
                                    src="/assets/images/sidik-jari.png"
                                    alt="Sidik Jari"
                                    width={128}
                                    height={128}
                                    className="object-contain transform translate-x-8 -translate-y-8"
                                />
                            </div>

                            <div className="text-center mb-6 relative z-10">
                                <h2 className="text-2xl font-extrabold text-[#0C4F81]">Pengaturan</h2>
                                <p className="text-sm text-gray-600">Tentukan jumlah penanda tangan sebelum upload.</p>
                            </div>

                            {/* Jumlah Penanda Tangan */}
                            <div className="relative z-10">
                                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                                        <span>Jumlah Penanda Tangan</span>
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <div className="relative">
                                        <select
                                            value={signerCountMode === 'custom' ? 'custom' : signerCount}
                                            onChange={(e) => {
                                                if (e.target.value === 'custom') {
                                                    setSignerCountMode('custom')
                                                    setSignerCount('')
                                                } else {
                                                    setSignerCountMode('select')
                                                    setSignerCount(Number(e.target.value))
                                                }
                                            }}
                                            className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800
                           focus:outline-none focus:ring-2 focus:ring-[#2FAAE1] focus:border-[#2FAAE1] cursor-pointer"
                                        >
                                            <option value="" disabled>Pilih Jumlah Penanda Tangan</option>
                                            <option value="1">1 Penanda Tangan</option>
                                            <option value="2">2 Penanda Tangan</option>
                                            <option value="3">3 Penanda Tangan</option>
                                            <option value="4">4 Penanda Tangan</option>
                                            <option value="custom">Lainnya...</option>
                                        </select>

                                        <svg
                                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                                        </svg>
                                    </div>

                                    {signerCountMode === 'custom' && (
                                        <div className="mt-4 animate-[fadeIn_0.2s_ease-out]">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Masukkan Jumlah Penanda Tangan
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={50}
                                                value={customSignerCount}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value)
                                                    setCustomSignerCount(val)
                                                    setSignerCount(val)
                                                }}
                                                placeholder="Contoh: 5"
                                                className="w-full px-4 py-3 rounded-xl border border-[#2FAAE1]/40 bg-white text-sm text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-[#2FAAE1]"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Maksimal 50 penanda tangan</p>
                                        </div>
                                    )}

                                    {/* Checkbox - custom */}
                                    <div
                                        onClick={() => setIsUserSigner(!isUserSigner)}
                                        className={`mt-5 flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${isUserSigner
                                            ? "border-[#2FAAE1] bg-[#E8F7FF]"
                                            : "border-gray-200 bg-white hover:bg-gray-50"
                                            }`}
                                    >
                                        <div
                                            className={`w-6 h-6 flex items-center justify-center rounded-md border-2 transition-all duration-300 ${isUserSigner
                                                ? "bg-gradient-to-br from-[#0C4F81] to-[#2FAAE1] border-[#2FAAE1] shadow-md"
                                                : "border-gray-300 bg-white"
                                                }`}
                                        >
                                            {isUserSigner && (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-800">Apakah Anda Penanda Tangan?</span>
                                            <span className="text-xs text-gray-500">Centang jika Anda termasuk pihak yang menandatangani dokumen</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="relative min-h-screen bg-gradient-to-br from-[#E8F7FF] via-white to-[#FFF8E6] flex justify-center px-10 py-12">

                    {/* === Breadcrumbs Progress === */}
                    <div className="absolute top-6 left-0 right-0 z-50 pointer-events-none">
                        <div className="w-full flex justify-center mb-8 sm:mb-10 mt-4 sm:mt-6">
                            <div className="flex items-center justify-between w-full max-w-[90%] sm:max-w-2xl relative">
                                {[
                                    { id: 1, label: "Unggah Dokumen" },
                                    { id: 2, label: "Setting Penanda Tangan" },
                                    { id: 3, label: "Proses Tanda Tangan" },
                                    { id: 4, label: "Hasil Akhir" },
                                ].map((item, index, arr) => (
                                    <div key={item.id} className="flex flex-col items-center flex-1 relative">
                                        {index < arr.length - 1 && (
                                            <div
                                                className={`absolute top-4 left-1/2 w-full h-[2px] z-0 transition-colors duration-300 ${step > item.id ? "bg-[#2FAAE1]" : "bg-gray-200"
                                                    }`}
                                            />
                                        )}
                                        <div
                                            className={`z-10 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 ${step === item.id
                                                ? "bg-gradient-to-r from-[#0C4F81] to-[#2FAAE1] text-white shadow-md"
                                                : step > item.id
                                                    ? "bg-[#2FAAE1] text-white"
                                                    : "bg-gray-200 text-gray-500"
                                                }`}
                                        >
                                            {item.id}
                                        </div>
                                        <p
                                            className={`mt-2 text-[10px] sm:text-xs font-medium text-center ${step >= item.id ? "text-[#0C4F81]" : "text-gray-400"
                                                }`}
                                        >
                                            {item.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* === Logo Kiri Atas (Desktop Only) === */}
                    <div className="fixed top-5 left-5 z-50 hidden sm:block">  
                        <Image
                            src="/assets/images/logo-blpid-1.png"
                            alt="Balai Layanan Penghubung Identitas Digital"
                            width={240}
                            height={60}
                            className="object-contain h-15 w-auto"
                        />
                    </div>

                    {/* Floating logo */}
                    <div className="fixed bottom-6 right-6 z-10">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-100">
                            <Image
                                src="/assets/images/logo-blpid.png"
                                alt="Logo BLPID"
                                width={48}
                                height={48}
                                className="object-contain"
                            />
                        </div>
                    </div>

                    <div className="flex w-full max-w-[1100px] gap-8 items-start mt-20">
                        <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-[#0C4F81]/10 p-8 relative overflow-hidden">

                            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                                <Image
                                    src="/assets/images/sidik-jari.png"
                                    alt="Sidik Jari"
                                    width={128}
                                    height={128}
                                    className="object-contain transform translate-x-8 -translate-y-8"
                                />
                            </div>

                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-extrabold text-[#0C4F81]">
                                    Setting Penanda Tangan
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Berikut daftar penanda tangan sesuai Signer List yang terdaftar.
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-white via-[#E8F7FF]/60 to-[#FFF8E6]/60 border border-[#2FAAE1]/40 rounded-2xl p-5 shadow-md">
                                <h3 className="text-sm font-bold text-[#0C4F81] mb-4">Signer List</h3>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    {signerList.map((s, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-4 rounded-2xl border border-[#2FAAE1]/30 bg-white shadow-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#E8F7FF] border border-[#2FAAE1]/30 flex items-center justify-center font-bold text-[#0C4F81]">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex flex-col">
                                                    {/* NAMA SAJA */}
                                                    <span className="font-semibold text-[#0C4F81]">{s.name}</span>
                                                    <span className="text-xs text-gray-500">BSrE</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-[#0C4F81] px-6 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer hover:scale-[1.01]"
                                >
                                    Kembali
                                </button>

                                <button
                                    onClick={() => {
                                        // Auto-assign NIK dari signerList (dummy)
                                        setNik(signerList[0]?.nik || "")
                                        setAdditionalSigners([{ nik: signerList[1]?.nik || "", passphrase: "" }])
                                        setShowAdditionalPassphrases([false])
                                        setSigningPhase(1)
                                        setStep(3)
                                    }}
                                    className="w-full bg-gradient-to-r from-[#0C4F81] to-[#FFA62B] hover:shadow-[0_0_15px_#FFA62B60] text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 cursor-pointer hover:scale-[1.01]"
                                >
                                    Lanjut ke Proses Tanda Tangan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPseModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-[90%] max-w-md relative animate-[fadeIn_0.3s_ease-out]">
                        <button
                            onClick={() => setShowPseModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-[#0C4F81] transition-colors duration-200"
                        >
                            ✕
                        </button>

                        <h3 className="text-xl font-bold text-[#0C4F81] mb-6 text-center">
                            Pilih Penyelenggara Sertifikat Elektronik
                        </h3>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { id: 'BSrE', name: 'BSrE', logo: '/assets/images/bsre.webp' },
                                { id: 'DocuPro', name: 'DocuPro', logo: '/assets/images/docupro.webp' },
                            ].map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        setPse(item.name)
                                        setShowPseModal(false)
                                    }}
                                    className={`cursor-pointer flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${pse === item.name
                                        ? 'border-[#2FAAE1] bg-[#E8F7FF]/70 shadow-lg'
                                        : 'border-gray-200 hover:border-[#2FAAE1]/60'
                                        }`}
                                >
                                    <Image
                                        src={item.logo}
                                        alt={item.name}
                                        width={80}
                                        height={80}
                                        className="rounded-lg object-contain"
                                    />
                                    <span className="text-sm font-semibold text-[#0C4F81]">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="relative min-h-screen bg-gradient-to-br from-[#E8F7FF] via-white to-[#FFF8E6] flex justify-center px-10 py-12">
                    <div className="absolute top-6 left-0 right-0 z-50 pointer-events-none">
                        <div className="w-full flex justify-center mb-8 sm:mb-10 mt-4 sm:mt-6">
                            <div className="flex items-center justify-between w-full max-w-[90%] sm:max-w-2xl relative">
                                {[
                                    { id: 1, label: "Unggah Dokumen" },
                                    { id: 2, label: "Setting Penanda Tangan" },
                                    { id: 3, label: "Proses Tanda Tangan" },
                                    { id: 4, label: "Hasil Akhir" },
                                ].map((item, index, arr) => (
                                    <div key={item.id} className="flex flex-col items-center flex-1 relative">
                                        {index < arr.length - 1 && (
                                            <div
                                                className={`absolute top-4 left-1/2 w-full h-[2px] z-0 transition-colors duration-300 ${step > item.id ? "bg-[#2FAAE1]" : "bg-gray-200"
                                                    }`}
                                            ></div>
                                        )}
                                        <div
                                            className={`z-10 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 ${step === item.id
                                                ? "bg-gradient-to-r from-[#0C4F81] to-[#2FAAE1] text-white shadow-md"
                                                : step > item.id
                                                    ? "bg-[#2FAAE1] text-white"
                                                    : "bg-gray-200 text-gray-500"
                                                }`}
                                        >
                                            {item.id}
                                        </div>
                                        <p
                                            className={`mt-2 text-[10px] sm:text-xs font-medium text-center ${step >= item.id ? "text-[#0C4F81]" : "text-gray-400"
                                                }`}
                                        >
                                            {item.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="fixed top-5 left-5 z-50 hidden sm:block">  
                        <Image
                            src="/assets/images/logo-blpid-1.png"
                            alt="Balai Layanan Penghubung Identitas Digital"
                            width={240}
                            height={60}
                            className="object-contain h-15 w-auto"
                        />
                    </div>

                    <div className="fixed bottom-6 right-6 z-10">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-100">
                            <Image
                                src="/assets/images/logo-blpid.png"
                                alt="Logo BLPID"
                                width={48}
                                height={48}
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {isLoading && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
                            <div className="w-full max-w-md px-6">
                                <div className="bg-white rounded-3xl shadow-2xl border border-[#2FAAE1]/30 p-8 text-center">
                                    <div className="flex justify-center">
                                        <div className="relative">
                                            <div className="w-20 h-20 border-4 border-gray-200 rounded-full" />
                                            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-[#0C4F81] rounded-full animate-spin" />
                                            <div
                                                className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-t-[#2FAAE1] rounded-full animate-spin"
                                                style={{ animationDirection: "reverse", animationDuration: "1.2s" }}
                                            />
                                            <div
                                                className="absolute top-4 left-4 w-12 h-12 border-4 border-transparent border-t-[#FFA62B] rounded-full animate-spin"
                                                style={{ animationDuration: "1.8s" }}
                                            />
                                        </div>
                                    </div>

                                    <h3 className="mt-6 text-lg font-bold text-[#0C4F81]">Memproses File PDF</h3>
                                    <p className="mt-1 text-sm text-gray-600">Harap tunggu sebentar...</p>

                                    <div className="mt-5 flex justify-center space-x-2">
                                        <div className="w-2 h-2 bg-[#0C4F81] rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-[#2FAAE1] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                        <div className="w-2 h-2 bg-[#FFA62B] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex w-full max-w-[1600px] gap-6 items-start mt-20">

                        {showSignerSidebar && (
                            <SignerSidebar
                                signerList={signerList}
                                currentSignerIndex={currentSignerIndex}
                            />
                        )}

                        <div className={`${showSignerSidebar ? "flex-[0.5]" : "flex-[0.7] bg-white rounded-3xl shadow-2xl border border-[#2FAAE1]/30 overflow-hidden flex flex-col h-[85vh]"}`}>
                            <div className="text-center py-5 border-b border-[#2FAAE1]/30 bg-gradient-to-r from-[#0C4F81]/5 to-[#2FAAE1]/5">
                                <h2 className="text-2xl font-extrabold text-[#0C4F81]">Pratinjau Dokumen</h2>
                                <p className="text-sm text-gray-600">Lihat dokumen dan atur posisi tanda tangan.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-gray-50 flex items-center justify-center">
                                {pdfFiles.length > 0 && pdfBase64Preview ? (
                                    <PdfViewer
                                        base64Pdf={pdfBase64Preview}
                                        signatureImage={visibleSignature ? imageBase64 : ""}
                                        pageNumber={pageNumber}
                                        setTotalPages={setTotalPages}
                                        onPositionChange={(pos) => setSignaturePos(pos)}
                                    />
                                ) : (
                                    <div className="text-gray-400 text-sm">Tidak ada dokumen untuk ditampilkan.</div>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 py-4 border-t border-[#2FAAE1]/30 bg-white">
                                    <button
                                        onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                                        disabled={pageNumber === 1}
                                        className="px-5 py-2 rounded-lg border border-[#2FAAE1]/50 text-sm bg-white hover:bg-[#E8F7FF] text-[#0C4F81] disabled:opacity-40"
                                    >
                                        ⬅️ Previous
                                    </button>
                                    <span className="text-sm font-medium text-gray-600">
                                        Halaman {pageNumber} dari {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                                        disabled={pageNumber === totalPages}
                                        className="px-5 py-2 rounded-lg border border-[#2FAAE1]/50 text-sm bg-white hover:bg-[#E8F7FF] text-[#0C4F81] disabled:opacity-40"
                                    >
                                        Next ➡️
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={`${showSignerSidebar ? "flex-[0.25]" : "flex-[0.3]"} bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-[#0C4F81]/10 p-8 relative overflow-hidden self-start mt-2`}>
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                                <Image
                                    src="/assets/images/sidik-jari.png"
                                    alt="Sidik Jari"
                                    width={128}
                                    height={128}
                                    className="object-contain transform translate-x-8 -translate-y-8"
                                />
                            </div>

                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-extrabold text-[#0C4F81]">Pengaturan Tanda Tangan</h2>
                                <p className="text-sm text-gray-600">Lengkapi data untuk proses TTE</p>
                            </div>

                            <div className="bg-gradient-to-br from-white via-[#E8F7FF]/60 to-[#FFF8E6]/60 border border-[#2FAAE1]/40 rounded-2xl p-5 mb-5 shadow-sm">
                                <h3 className="text-sm font-bold text-[#0C4F81] mb-3">Informasi Penandatangan</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">NIK</label>
                                        <input
                                            type="text"
                                            value={nik}
                                            onChange={(e) => setNik(e.target.value)}
                                            placeholder="Masukkan NIK"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm bg-gray-200 cursor-not-allowed"
                                            disabled
                                        />

                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Passphrase</label>
                                        <div className="relative">
                                            <input
                                                ref={passphraseRef}
                                                type={showPassphrase ? 'text' : 'password'}
                                                value={passphrase}
                                                onChange={(e) => setPassphrase(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                        signBtnRef.current?.click()
                                                    }
                                                }}
                                                placeholder="Masukkan passphrase"
                                                className="w-full px-4 py-2.5 pr-10 rounded-lg bg-white border border-[#2FAAE1]/50 text-gray-900 focus:ring-2 focus:ring-[#2FAAE1] text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassphrase(!showPassphrase)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0C4F81]/70 hover:text-[#0C4F81]"
                                            >
                                                {showPassphrase ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-[#E8F7FF]/50 to-[#FFF8E6]/50 border border-[#2FAAE1]/30 rounded-2xl p-4 mb-5 shadow-sm">
                                <label className="block text-sm font-semibold text-[#0C4F81] mb-2">Pilih PSrE</label>
                                <button
                                    onClick={() => setShowPseModal(true)}
                                    disabled
                                    className="w-full py-2.5 px-4 rounded-lg border border-[#2FAAE1]/50 hover:bg-[#E8F7FF] text-sm text-[#0C4F81] font-medium flex items-center justify-between cursor-not-allowed bg-gray-200"
                                >
                                    {pse ? (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <Image
                                                    src={`/assets/images/${pse.toLowerCase()}.webp`}
                                                    alt={pse}
                                                    width={24}
                                                    height={24}
                                                    className="rounded-md"
                                                />
                                                <span>{pse}</span>
                                            </div>
                                            <svg className="w-4 h-4 text-[#2FAAE1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                        </>
                                    ) : (
                                        <span>Pilih PSrE</span>
                                    )}
                                </button>
                            </div>

                            {visibleSignature && (
                                <div className="bg-[#E8F7FF]/70 border border-[#2FAAE1]/40 rounded-2xl p-4 mb-6 shadow-sm">
                                    <label className="block text-sm font-semibold text-[#0C4F81] mb-2">
                                        Unggah Gambar Tanda Tangan
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        onChange={handleSignatureImageChange}
                                        className="block w-full text-sm text-gray-900 border border-[#2FAAE1]/50 rounded-lg cursor-pointer bg-white file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#0C4F81] file:to-[#2FAAE1] file:text-white hover:file:opacity-90"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Format: JPG/PNG, Max 2 MB</p>
                                </div>
                            )}

                            <button
                                ref={signBtnRef}
                                onClick={signPDF}
                                disabled={!pse?.trim() || isLoading}
                                className="w-full bg-gradient-to-r from-[#0C4F81] to-[#FFA62B] text-white px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_15px_#FFA62B60] hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                            >
                                Tanda Tangan Dokumen
                            </button>
                        </div>
                    </div>
                </div>

            )}

            {step === 4 && (
                <div className="relative min-h-screen bg-gradient-to-br from-[#E8F7FF] via-white to-[#FFF8E6] flex justify-center px-10 py-12">

                    {/* === Breadcrumbs Progress === */}
                    <div className="absolute top-6 left-0 right-0 z-50 pointer-events-none">
                        <div className="w-full flex justify-center mb-8 sm:mb-10 mt-4 sm:mt-6">
                            <div className="flex items-center justify-between w-full max-w-[90%] sm:max-w-2xl relative">
                                {[
                                    { id: 1, label: "Unggah Dokumen" },
                                    { id: 2, label: "Setting Penanda Tangan" },
                                    { id: 3, label: "Proses Tanda Tangan" },
                                    { id: 4, label: "Hasil Akhir" },
                                ].map((item, index, arr) => (
                                    <div key={item.id} className="flex flex-col items-center flex-1 relative">
                                        {index < arr.length - 1 && (
                                            <div
                                                className={`absolute top-4 left-1/2 w-full h-[2px] z-0 transition-colors duration-300 ${step > item.id ? "bg-[#2FAAE1]" : "bg-gray-200"
                                                    }`}
                                            ></div>
                                        )}
                                        <div
                                            className={`z-10 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 ${step === item.id
                                                ? "bg-gradient-to-r from-[#0C4F81] to-[#2FAAE1] text-white shadow-md"
                                                : step > item.id
                                                    ? "bg-[#2FAAE1] text-white"
                                                    : "bg-gray-200 text-gray-500"
                                                }`}
                                        >
                                            {item.id}
                                        </div>
                                        <p
                                            className={`mt-2 text-[10px] sm:text-xs font-medium text-center ${step >= item.id ? "text-[#0C4F81]" : "text-gray-400"
                                                }`}
                                        >
                                            {item.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* === Logo Kiri Atas (Desktop Only) === */}
                    <div className="fixed top-5 left-5 z-50 hidden sm:block">  
                        <Image
                            src="/assets/images/logo-blpid-1.png"
                            alt="Balai Layanan Penghubung Identitas Digital"
                            width={240}
                            height={60}
                            className="object-contain h-15 w-auto"
                        />
                    </div>

                    {/* === Floating Logo === */}
                    <div className="fixed bottom-6 right-6 z-10">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-100">
                            <Image
                                src="/assets/images/logo-blpid.png"
                                alt="Logo BLPID"
                                width={48}
                                height={48}
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* === Overlay Loader === */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-opacity duration-500">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-[#0C4F81]/20 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-[#0C4F81] rounded-full animate-spin"></div>
                                <div className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-t-[#2FAAE1] rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.6s" }}></div>
                                <div className="absolute top-4 left-4 w-12 h-12 border-4 border-transparent border-t-[#FFA62B] rounded-full animate-spin" style={{ animationDuration: "2.2s" }}></div>
                            </div>
                            <p className="mt-6 text-[#0C4F81] font-semibold text-lg animate-pulse">
                                Menyiapkan dokumen akhir, mohon tunggu...
                            </p>
                        </div>
                    )}

                    {/* === MAIN CONTAINER === */}
                    <div className="flex w-full max-w-[1500px] gap-8 items-start mt-20">

                        {/* === PANEL KIRI: PDF VIEWER FINAL === */}
                        <div className="flex-[0.65] bg-white rounded-3xl shadow-2xl border border-[#2FAAE1]/30 p-6 flex flex-col h-[85vh]">
                            <div className="text-center mb-4 border-b border-[#2FAAE1]/30 pb-3">
                                <h2 className="text-2xl font-extrabold text-[#0C4F81]">Dokumen Final</h2>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Berikut hasil akhir dokumen yang telah berhasil ditandatangani secara digital.
                                </p>
                            </div>

                            <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                {signedPdfUrls.length > 0 ? (
                                    <iframe
                                        src={signedPdfUrls[signedPdfUrls.length - 1]}
                                        width="100%"
                                        height="100%"
                                        className="border-none w-full h-full rounded-xl bg-white"
                                        title="Dokumen Final"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                        Tidak ada dokumen untuk ditampilkan.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* === PANEL KANAN: INFORMASI HASIL === */}
                        <div className="flex-[0.35] bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-[#0C4F81]/10 relative overflow-hidden p-8 self-start mt-2">
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                                <Image
                                    src="/assets/images/sidik-jari.png"
                                    alt="Sidik Jari"
                                    width={128}
                                    height={128}
                                    className="object-contain transform translate-x-8 -translate-y-8"
                                />
                            </div>

                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-[#E8F7FF] flex items-center justify-center border-4 border-[#2FAAE1]/30">
                                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-extrabold text-[#0C4F81]">Dokumen Berhasil Ditandatangani</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Berikut ringkasan hasil akhir dokumen PDF yang telah ditandatangani dengan sertifikat elektronik.
                                </p>
                            </div>

                            {/* Info Dokumen */}
                            <div className="bg-gradient-to-br from-[#E8F7FF]/60 to-[#FFF8E6]/60 border border-[#2FAAE1]/40 rounded-2xl p-5 mb-6 shadow-md">
                                <h3 className="text-sm font-bold text-[#0C4F81] mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#0C4F81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m4 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v8m4 4h8a2 2 0 002-2v-2H7v2a2 2 0 002 2z" />
                                    </svg>
                                    Informasi Dokumen
                                </h3>

                                <div className="space-y-2 text-sm text-gray-700">
                                    <div className="flex justify-between">
                                        <span>Jumlah File</span>
                                        <span className="font-semibold text-[#0C4F81]">1 dokumen</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total TTE</span>
                                        <span className="font-semibold text-[#0C4F81]">
                                            {tteCount || 2} tanda tangan
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Status</span>
                                        <span className="font-semibold text-green-600">Berhasil</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex flex-col gap-3 pt-4 border-t border-[#2FAAE1]/30">
                                <button
                                    onClick={() => window.open(signedPdfUrls[0], "_blank")}
                                    className="w-full bg-gradient-to-r from-[#0C4F81] to-[#FFA62B] hover:shadow-[0_0_15px_#FFA62B60] text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                                >
                                    Preview Dokumen
                                </button>

                                <button
                                    onClick={() => {
                                        const originalName = pdfFiles[0]?.name || "Dokumen_TTE_Final.pdf";
                                        const baseName = originalName.replace(/\.pdf$/i, ""); // hapus .pdf di akhir
                                        const signedFileName = `${baseName}_signed.pdf`;

                                        const link = document.createElement("a");
                                        link.href = signedPdfUrls[0];
                                        link.download = signedFileName;
                                        link.click();
                                    }}
                                    className="w-full bg-gradient-to-r from-[#2FAAE1] to-[#0C4F81] hover:shadow-[0_0_15px_#FFA62B60] text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                                >
                                    Download PDF
                                </button>

                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-[#0C4F81] px-8 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer"
                                >
                                    Upload Ulang
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-10">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-100">
                            <Image
                                src="/assets/images/logo-blpid.png"
                                alt="Logo BLPID"
                                width={48}
                                height={48}
                                className="object-contain w-9 h-9 sm:w-12 sm:h-12"
                            />
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}