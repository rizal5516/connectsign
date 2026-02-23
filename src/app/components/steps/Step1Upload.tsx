"use client";

import { useRef } from "react";
import { HiLightBulb } from "react-icons/hi";
import StepBreadcrumb from "../ui/StepBreadcrumb";
import HeaderLogo from "../ui/HeaderLogo";
import FooterLogo from "../ui/FooterLogo";
import LoadingOverlay from "../ui/LoadingOverlay";
import Image from "next/image";

interface Props {
  signerCount: number | "";
  isUserSigner: boolean;
  signerCountMode: "select" | "custom";
  customSignerCount: number | "";
  isDragActive: boolean;
  canUpload: boolean;
  isLoading: boolean;
  setSignerCount: (val: number | "") => void;
  setIsUserSigner: (val: boolean) => void;
  setSignerCountMode: (val: "select" | "custom") => void;
  setCustomSignerCount: (val: number | "") => void;
  onIsUserSignerChange: (value: boolean) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

const SIGNER_COUNT_OPTIONS = [1, 2, 3, 4, 5];

export default function Step1Upload({
  signerCount,
  isUserSigner,
  signerCountMode,
  customSignerCount,
  isDragActive,
  canUpload,
  isLoading,
  setSignerCount,
  setIsUserSigner,
  setSignerCountMode,
  setCustomSignerCount,
  onIsUserSignerChange,
  onFileChange,
  onDragOver,
  onDragLeave,
  onDrop,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#E8F7FF] via-white to-[#FFF8E6] flex justify-center px-6 sm:px-10 py-12">
      <StepBreadcrumb currentStep={1} />

      <HeaderLogo />
      <FooterLogo />

      {isLoading && <LoadingOverlay message="Mengunggah dokumen..." />}

      <div className="flex w-full max-w-[1500px] gap-8 items-start mt-20">
        {/* Upload Area */}
        <div className="flex-[0.65] bg-white rounded-3xl shadow-2xl border border-[#2FAAE1]/30 overflow-hidden flex flex-col">
          <div className="text-center py-6 border-b border-[#2FAAE1]/20 bg-gray-50">
            <h2 className="text-2xl font-bold text-[#0C4F81]">
              Unggah Dokumen
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Seret file PDF atau pilih secara manual.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {!canUpload && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-sm text-amber-800">
                <HiLightBulb className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-500" />
                <span>
                  Tentukan jumlah penanda tangan terlebih dahulu sebelum
                  mengunggah dokumen.
                </span>
              </div>
            )}

            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={canUpload ? onDrop : undefined}
              onClick={() => canUpload && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                !canUpload
                  ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                  : isDragActive
                    ? "border-[#2FAAE1] bg-[#E8F7FF] scale-[1.01]"
                    : "border-[#2FAAE1]/40 hover:border-[#2FAAE1] hover:bg-[#E8F7FF]/30 cursor-pointer"
              }`}
            >
              <svg
                className="mx-auto w-12 h-12 text-[#2FAAE1] mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm font-semibold text-[#0C4F81]">
                {isDragActive
                  ? "Lepaskan file di sini..."
                  : "Klik atau seret file PDF ke sini"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Format: PDF · Maks. 20 MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              disabled={!canUpload}
              onChange={onFileChange}
              className="hidden"
            />

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
                    <li>• Maksimal ukuran file 20 MB per dokumen</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signer Count */}
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
            <h2 className="text-2xl font-extrabold text-[#0C4F81]">
              Pengaturan
            </h2>
            <p className="text-sm text-gray-600">
              Tentukan jumlah penanda tangan sebelum upload.
            </p>
          </div>

          <div className="relative z-10">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                <span>Jumlah Penanda Tangan</span>
                <span className="text-red-500">*</span>
              </label>

              {/* SELECT */}
              <div className="relative">
                <select
                  value={signerCountMode === "custom" ? "custom" : signerCount}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setSignerCountMode("custom");
                      setSignerCount("");
                    } else {
                      setSignerCountMode("select");
                      setSignerCount(Number(e.target.value));
                    }
                  }}
                  className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800
          focus:outline-none focus:ring-2 focus:ring-[#2FAAE1] focus:border-[#2FAAE1] cursor-pointer"
                >
                  <option value="" disabled>
                    Pilih Jumlah Penanda Tangan
                  </option>
                  <option value="1">1 Penanda Tangan</option>
                  <option value="2">2 Penanda Tangan</option>
                  <option value="3">3 Penanda Tangan</option>
                  <option value="4">4 Penanda Tangan</option>
                  <option value="custom">Lainnya...</option>
                </select>

                {/* ICON */}
                <svg
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 9l6 6 6-6"
                  />
                </svg>
              </div>

              {/* CUSTOM INPUT */}
              {signerCountMode === "custom" && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Masukkan Jumlah Penanda Tangan
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={customSignerCount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCustomSignerCount(val);
                      setSignerCount(val);
                    }}
                    placeholder="Contoh: 5"
                    className="w-full px-4 py-3 rounded-xl border border-[#2FAAE1]/40 bg-white text-sm text-gray-900
            focus:outline-none focus:ring-2 focus:ring-[#2FAAE1]"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Maksimal 50 penanda tangan
                  </p>
                </div>
              )}

              {/* CHECKBOX */}
              <div
                onClick={() => setIsUserSigner(!isUserSigner)}
                className={`mt-5 flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                  isUserSigner
                    ? "border-[#2FAAE1] bg-[#E8F7FF]"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-md border-2 transition-all duration-300 ${
                    isUserSigner
                      ? "bg-gradient-to-br from-[#0C4F81] to-[#2FAAE1] border-[#2FAAE1]"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isUserSigner && (
                    <svg
                      className="w-4 h-4 text-white"
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

                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">
                    Apakah Anda Penanda Tangan?
                  </span>
                  <span className="text-xs text-gray-500">
                    Centang jika Anda termasuk pihak yang menandatangani dokumen
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
