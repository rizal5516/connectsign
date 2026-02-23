"use client";

import Image from "next/image";
import LoadingOverlay from "../ui/LoadingOverlay";
import StepBreadcrumb from "../ui/StepBreadcrumb";
import HeaderLogo from "../ui/HeaderLogo";
import FooterLogo from "../ui/FooterLogo";

interface Props {
  signedPdfUrls: string[];
  isLoading: boolean;
  originalFileName: string;
  onDownload: () => void;
  onReset: () => void;
}

export default function Step4Result({
  isLoading,
  originalFileName,
  onReset,
}: Props) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#E8F7FF] via-white to-[#FFF8E6] flex justify-center items-center px-6 py-12 overflow-hidden">
      <StepBreadcrumb currentStep={4} />

      {isLoading && (
        <LoadingOverlay message="Menyiapkan dokumen akhir, mohon tunggu..." />
      )}

      {/* ── Background ornaments ── */}

      {/* Top stripe */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0C4F81] via-[#2FAAE1] to-[#FFA62B]" />
      {/* Bottom stripe */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FFA62B] via-[#2FAAE1] to-[#0C4F81]" />

      {/* Top-left concentric arcs */}
      <div className="pointer-events-none absolute top-0 left-0 w-80 h-80 opacity-[0.07]">
        <svg
          viewBox="0 0 320 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {[40, 70, 100, 130, 160, 190, 220].map((r, i) => (
            <circle
              key={i}
              cx="0"
              cy="0"
              r={r}
              stroke="#0C4F81"
              strokeWidth="12"
              strokeDasharray="8 14"
            />
          ))}
        </svg>
      </div>

      {/* Bottom-left golden arc */}
      <div className="pointer-events-none absolute bottom-0 left-0 opacity-[0.06] w-96 h-96">
        <svg
          viewBox="0 0 384 384"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {[80, 110, 140, 170, 200, 230].map((r, i) => (
            <circle
              key={i}
              cx="0"
              cy="384"
              r={r}
              stroke="#FFA62B"
              strokeWidth="14"
              strokeDasharray="6 10"
            />
          ))}
        </svg>
      </div>

      {/* Floating dot grid center-left */}
      <div
        className="pointer-events-none absolute left-0 top-1/4 w-48 h-48 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #0C4F81 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Floating dot grid center-right */}
      <div
        className="pointer-events-none absolute right-0 bottom-1/4 w-48 h-48 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #0C4F81 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* ── Main card ── */}
      <div className="relative z-10 w-full max-w-lg mt-16">
        <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-[#2FAAE1]/30 overflow-hidden">
          {/* Card top accent stripe */}
          <div className="h-1.5 bg-gradient-to-r from-[#0C4F81] via-[#2FAAE1] to-[#FFA62B]" />

          {/* Card header – navy government band */}
          <div className="relative bg-gradient-to-br from-[#0C4F81] to-[#1a6aaa] px-8 pt-8 pb-6 flex flex-col items-center overflow-hidden">
            {/* Dot pattern overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            {/* Side arc ornament inside header */}
            <div className="pointer-events-none absolute -left-6 -top-6 w-32 h-32 opacity-20">
              <svg viewBox="0 0 128 128" fill="none">
                {[30, 50, 70].map((r, i) => (
                  <circle
                    key={i}
                    cx="0"
                    cy="0"
                    r={r}
                    stroke="white"
                    strokeWidth="6"
                    strokeDasharray="5 8"
                  />
                ))}
              </svg>
            </div>
            <div className="pointer-events-none absolute -right-6 -bottom-6 w-32 h-32 opacity-20">
              <svg viewBox="0 0 128 128" fill="none">
                {[30, 50, 70].map((r, i) => (
                  <circle
                    key={i}
                    cx="128"
                    cy="128"
                    r={r}
                    stroke="#FFA62B"
                    strokeWidth="6"
                    strokeDasharray="5 8"
                  />
                ))}
              </svg>
            </div>

            <div className="mb-3 z-10">
              <Image
                src="/assets/images/white-logo-blpid.png"
                alt="BLPID"
                width={200}
                height={52}
                className="object-contain h-12 w-auto"
              />
            </div>
          </div>

          {/* Floating seal badge – centered on the seam */}
          <div className="flex justify-center -mt-8 relative z-20">
            <div className="w-16 h-16 rounded-full bg-white shadow-xl border-4 border-[#2FAAE1]/40 flex items-center justify-center">
              <svg
                viewBox="0 0 64 64"
                className="w-10 h-10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="32"
                  cy="32"
                  r="30"
                  stroke="#0C4F81"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="22"
                  stroke="#2FAAE1"
                  strokeWidth="1.5"
                />
                {Array.from({ length: 12 }).map((_, i) => {
                  const a = (i * 30 * Math.PI) / 180;
                  return (
                    <line
                      key={i}
                      x1={32 + Math.cos(a) * 14}
                      y1={32 + Math.sin(a) * 14}
                      x2={32 + Math.cos(a) * 20}
                      y2={32 + Math.sin(a) * 20}
                      stroke="#0C4F81"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  );
                })}
                <path
                  d="M22 32l7 7 13-13"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Card body */}
          <div className="px-8 pb-8 pt-3 flex flex-col items-center text-center">
            <h2 className="text-2xl font-extrabold text-[#0C4F81] mt-1">
              Tanda Tangan Berhasil!
            </h2>
            <p className="text-sm text-gray-500 mt-1 mb-5 leading-relaxed">
              Dokumen{" "}
              <span className="font-bold text-[#0C4F81] break-all">
                {originalFileName}
              </span>{" "}
              telah berhasil ditandatangani secara digital menggunakan{" "}
              <span className="font-semibold">
                Tanda Tangan Elektronik (TTE)
              </span>{" "}
              tersertifikasi.
            </p>

            {/* Auto-download info box */}
            <div className="w-full bg-gradient-to-r from-[#E8F7FF] to-[#FFF8E6] border border-[#2FAAE1]/40 rounded-2xl px-5 py-4 mb-5 flex items-start gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-[#2FAAE1]/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-[#0C4F81]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 3v12"
                  />
                </svg>
              </div>
              <p className="text-sm text-[#0C4F81] leading-relaxed">
                Dokumen yang telah ditandatangani secara otomatis telah{" "}
                <strong>diunduh ke perangkat Anda</strong>.
              </p>
            </div>

            {/* Detail keterangan resmi */}
            <div className="w-full border border-dashed border-[#0C4F81]/25 rounded-2xl px-5 py-4 mb-6 text-left relative overflow-hidden">
              <p className="text-[10px] font-bold text-[#0C4F81] uppercase tracking-widest mb-3">
                Keterangan Dokumen
              </p>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status</span>
                  <span className="font-semibold text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Tersertifikasi
                  </span>
                </div>
                <div className="w-full h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Jenis TTE</span>
                  <span className="font-semibold text-[#0C4F81]">
                    TTE Tersertifikasi BSrE
                  </span>
                </div>
                <div className="w-full h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tanggal</span>
                  <span className="font-semibold text-[#0C4F81]">
                    {new Date().toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="w-full h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Waktu</span>
                  <span className="font-semibold text-[#0C4F81]">
                    {new Date().toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    WIB
                  </span>
                </div>
              </div>
            </div>

            {/* Star divider ornament */}
            <div className="w-full flex items-center gap-2 mb-5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#2FAAE1]/40" />
              {[14, 18, 14].map((s, i) => (
                <svg
                  key={i}
                  style={{ width: s, height: s }}
                  className="text-[#FFA62B] shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 0l2 6h6l-5 3.6 1.9 6L10 12l-4.9 3.6L7 9.6 2 6h6z" />
                </svg>
              ))}
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#2FAAE1]/40" />
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={onReset}
              className="w-full bg-gradient-to-r from-[#0C4F81] to-[#2FAAE1] hover:shadow-[0_0_20px_#2FAAE160] text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              Upload Dokumen Baru
            </button>
          </div>

          {/* Card bottom accent stripe */}
          <div className="h-1.5 bg-gradient-to-r from-[#FFA62B] via-[#2FAAE1] to-[#0C4F81]" />
        </div>
      </div>

      <HeaderLogo />

      {/* Floating Logo */}
      <FooterLogo />
    </div>
  );
}
