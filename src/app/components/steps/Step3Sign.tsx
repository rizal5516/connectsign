"use client";

import { useRef } from "react";
import Image from "next/image";
import StepBreadcrumb from "../ui/StepBreadcrumb";
import SignerSidebar from "../SignerSidebar";
import LoadingOverlay from "../ui/LoadingOverlay";
import HeaderLogo from "../ui/HeaderLogo";
import FooterLogo from "../ui/FooterLogo";
import PdfViewer from "../PdfViewer";
import type {
  Signer,
  AdditionalSigner,
  SignaturePosition,
  PseProvider,
} from "../../types/signing.type";

interface Props {
  // State
  nik: string;
  passphrase: string;
  showPassphrase: boolean;
  pse: PseProvider | "";
  visibleSignature: boolean;
  imageBase64: string;
  pageNumber: number;
  totalPages: number;
  pdfBase64Preview: string;
  isLoading: boolean;
  signerList: Signer[];
  currentSignerIndex: number;
  showSignerSidebar: boolean;

  // Refs
  passphraseRef: React.RefObject<HTMLInputElement | null>;

  // Handlers
  onNikChange: (value: string) => void;
  onPassphraseChange: (value: string) => void;
  onTogglePassphrase: () => void;
  onVisibleSignatureChange: (value: boolean) => void;
  onSignatureImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPositionChange: (pos: SignaturePosition) => void;
  onSetTotalPages: (n: number) => void;
  onPageNext: () => void;
  onPagePrev: () => void;
  onOpenPseModal: () => void;
  onSign: () => void;
  onAddAdditionalSigner: () => void;
  onRemoveAdditionalSigner: (index: number) => void;
  onUpdateAdditionalSigner: (
    index: number,
    field: "nik" | "passphrase",
    value: string,
  ) => void;
  onToggleAdditionalPassphrase: (index: number) => void;
  onAdditionalTTE: () => void;
  onShowAdditionalTTEChange: (value: boolean) => void;
}

export default function Step3Sign({
  nik,
  passphrase,
  showPassphrase,
  pse,
  visibleSignature,
  imageBase64,
  pageNumber,
  totalPages,
  pdfBase64Preview,
  isLoading,
  signerList,
  currentSignerIndex,
  showSignerSidebar,
  passphraseRef,
  onNikChange,
  onPassphraseChange,
  onTogglePassphrase,
  onVisibleSignatureChange,
  onSignatureImageChange,
  onPositionChange,
  onSetTotalPages,
  onPageNext,
  onPagePrev,
  onOpenPseModal,
  onSign,
  onAddAdditionalSigner,
  onRemoveAdditionalSigner,
  onUpdateAdditionalSigner,
  onToggleAdditionalPassphrase,
  onAdditionalTTE,
  onShowAdditionalTTEChange,
}: Props) {
  const signBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#E8F7FF] via-white to-[#FFF8E6] flex justify-center px-10 py-12">
      <StepBreadcrumb currentStep={3} />

      <HeaderLogo />

      <FooterLogo />

      {isLoading && <LoadingOverlay />}

      <div className="flex w-full max-w-[1600px] gap-6 items-start mt-20">
        {showSignerSidebar && (
          <SignerSidebar
            signerList={signerList}
            currentSignerIndex={currentSignerIndex}
          />
        )}

        {/* PDF Viewer */}
        <div
          className={`${
            showSignerSidebar
              ? "flex-[0.5]"
              : "flex-[0.7] bg-white rounded-3xl shadow-2xl border border-[#2FAAE1]/30 overflow-hidden flex flex-col h-[85vh]"
          }`}
        >
          <div className="text-center py-5 border-b border-[#2FAAE1]/30 bg-gradient-to-r from-[#0C4F81]/5 to-[#2FAAE1]/5">
            <h2 className="text-2xl font-extrabold text-[#0C4F81]">
              Pratinjau Dokumen
            </h2>
            <p className="text-sm text-gray-600">
              Lihat dokumen dan atur posisi tanda tangan.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 flex items-center justify-center min-h-0">
            {pdfBase64Preview ? (
              <PdfViewer
                base64Pdf={pdfBase64Preview}
                signatureImage={visibleSignature ? imageBase64 : ""}
                pageNumber={pageNumber}
                setTotalPages={onSetTotalPages}
                onPositionChange={onPositionChange}
              />
            ) : (
              <div className="text-gray-400 text-sm">
                Tidak ada dokumen untuk ditampilkan.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 py-4 border-t border-[#2FAAE1]/30 bg-white">
              <button
                onClick={onPagePrev}
                disabled={pageNumber === 1}
                className="px-5 py-2 rounded-lg border border-[#2FAAE1]/50 text-sm bg-white hover:bg-[#E8F7FF] text-[#0C4F81] disabled:opacity-40 cursor-pointer"
              >
                ⬅️ Previous
              </button>
              <span className="text-sm font-medium text-gray-600">
                Halaman {pageNumber} dari {totalPages}
              </span>
              <button
                onClick={onPageNext}
                disabled={pageNumber === totalPages}
                className="px-5 py-2 rounded-lg border border-[#2FAAE1]/50 text-sm bg-white hover:bg-[#E8F7FF] text-[#0C4F81] disabled:opacity-40 cursor-pointer"
              >
                Next ➡️
              </button>
            </div>
          )}
        </div>

        {/* Form Tanda Tangan */}
        <div
          className={`${
            showSignerSidebar ? "flex-[0.25]" : "flex-[0.3]"
          } bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-[#0C4F81]/10 p-8 relative overflow-hidden self-start mt-2`}
        >
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
            <h2 className="text-2xl font-extrabold text-[#0C4F81]">
              Pengaturan Tanda Tangan
            </h2>
            <p className="text-sm text-gray-600">
              Lengkapi data untuk proses TTE
            </p>
          </div>

          <div className="bg-gradient-to-br from-white via-[#E8F7FF]/60 to-[#FFF8E6]/60 border border-[#2FAAE1]/40 rounded-2xl p-5 mb-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0C4F81] mb-3">
              Informasi Penandatangan
            </h3>
            {/* NIK - read only, di-mask untuk keamanan */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#0C4F81] mb-1">
                NIK
              </label>
              <input
                type="text"
                value={nik}
                onChange={(e) =>
                  onNikChange(e.target.value.replace(/\D/g, "").slice(0, 16))
                }
                maxLength={16}
                placeholder="16 digit NIK"
                autoComplete="off"
                className="w-full border border-[#2FAAE1]/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2FAAE1]/50 text-gray-900 text-sm bg-gray-200 cursor-not-allowed"
              />
            </div>

            {/* Passphrase */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#0C4F81] mb-1">
                Passphrase
              </label>
              <div className="relative">
                <input
                  ref={passphraseRef}
                  type={showPassphrase ? "text" : "password"}
                  value={passphrase}
                  onChange={(e) => onPassphraseChange(e.target.value)}
                  placeholder="Masukkan passphrase"
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg bg-white border border-[#2FAAE1]/50 text-gray-900 focus:ring-2 focus:ring-[#2FAAE1] text-sm"
                />
                <button
                  type="button"
                  aria-label={
                    showPassphrase
                      ? "Sembunyikan passphrase"
                      : "Tampilkan passphrase"
                  }
                  onClick={onTogglePassphrase}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0C4F81]"
                >
                  {showPassphrase ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* PSrE Selector */}
          <div className="bg-gradient-to-r from-[#E8F7FF]/50 to-[#FFF8E6]/50 border border-[#2FAAE1]/30 rounded-2xl p-4 mb-5 shadow-sm">
            <label className="block text-sm font-semibold text-[#0C4F81] mb-2">
              Pilih PSrE
            </label>
            <button
              type="button"
              onClick={onOpenPseModal}
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
                  <svg
                    className="w-4 h-4 text-[#2FAAE1]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </>
              ) : (
                <span className="text-gray-400">Pilih PSrE</span>
              )}
            </button>
          </div>

          {/* Visible Signature Toggle */}
          {/* <div className="mb-4">
            <button
              type="button"
              onClick={() => onVisibleSignatureChange(!visibleSignature)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                visibleSignature
                  ? "border-[#2FAAE1] bg-[#E8F7FF]"
                  : "border-gray-200"
              }`}
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  visibleSignature
                    ? "bg-gradient-to-br from-[#0C4F81] to-[#2FAAE1] border-transparent"
                    : "border-gray-300"
                }`}
              >
                {visibleSignature && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                Tampilkan Tanda Tangan
              </span>
            </button>
          </div> */}

          {/* Signature Image Upload */}
          {/* {visibleSignature && (
            <div className="bg-[#E8F7FF]/70 border border-[#2FAAE1]/40 rounded-2xl p-4 mb-5 shadow-sm">
              <label className="block text-sm font-semibold text-[#0C4F81] mb-2">
                Unggah Gambar Tanda Tangan
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={onSignatureImageChange}
                className="block w-full text-sm text-gray-900 border border-[#2FAAE1]/50 rounded-lg cursor-pointer bg-white file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#0C4F81] file:to-[#2FAAE1] file:text-white hover:file:opacity-90"
              />
              <p className="text-xs text-gray-500 mt-2">
                Format: JPG/PNG · Maks. 2 MB
              </p>
            </div>
          )} */}

          {/* Sign Button */}
          <button
            ref={signBtnRef}
            type="button"
            onClick={onSign}
            disabled={!pse || isLoading}
            className="w-full bg-gradient-to-r from-[#0C4F81] to-[#FFA62B] text-white px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_15px_#FFA62B60] hover:scale-[1.02] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            Tanda Tangan Dokumen
          </button>
        </div>
      </div>
    </div>
  );
}
