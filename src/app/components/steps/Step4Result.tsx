'use client'

import Image from 'next/image'
import LoadingOverlay from '../ui/LoadingOverlay'
import StepBreadcrumb from '../ui/StepBreadcrumb'

interface Props {
  signedPdfUrls: string[]
  isLoading: boolean
  originalFileName: string
  onDownload: () => void
  onReset: () => void
}

export default function Step4Result({
  signedPdfUrls,
  isLoading,
  originalFileName,
  onDownload,
  onReset,
}: Props) {
  const latestUrl = signedPdfUrls[signedPdfUrls.length - 1]

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#E8F7FF] via-white to-[#FFF8E6] flex justify-center px-10 py-12">
      <StepBreadcrumb currentStep={4} />

      {isLoading && <LoadingOverlay message="Menyiapkan dokumen akhir, mohon tunggu..." />}

      <div className="flex w-full max-w-[1500px] gap-8 items-start mt-20">
        {/* PDF Final Preview */}
        <div className="flex-[0.65] bg-white rounded-3xl shadow-2xl border border-[#2FAAE1]/30 p-6 flex flex-col h-[85vh]">
          <div className="text-center mb-4 border-b border-[#2FAAE1]/30 pb-3">
            <h2 className="text-2xl font-extrabold text-[#0C4F81]">Dokumen Final</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Berikut hasil akhir dokumen yang telah berhasil ditandatangani secara digital.
            </p>
          </div>

          <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            {latestUrl ? (
              <iframe
                src={latestUrl}
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

        {/* Panel Download */}
        <div className="flex-[0.35] bg-white rounded-3xl shadow-2xl border border-[#2FAAE1]/30 p-6 flex flex-col">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-green-300 blur-xl opacity-40" />
              <div className="relative w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-[#0C4F81] text-center mb-1">Selesai!</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Dokumen <strong>{originalFileName}</strong> telah berhasil ditandatangani secara digital.
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={onDownload}
              className="w-full bg-gradient-to-r from-[#2FAAE1] to-[#0C4F81] hover:shadow-[0_0_15px_#FFA62B60] text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              Download PDF
            </button>
            <button
              type="button"
              onClick={onReset}
              className="w-full bg-gray-100 hover:bg-gray-200 text-[#0C4F81] px-8 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer"
            >
              Upload Ulang
            </button>
          </div>
        </div>
      </div>

      {/* Logo */}
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
  )
}