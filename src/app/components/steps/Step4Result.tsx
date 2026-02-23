"use client";

import Image from "next/image";
import LoadingOverlay from "../ui/LoadingOverlay";
import StepBreadcrumb from "../ui/StepBreadcrumb";

interface Props {
  signedPdfUrls: string[];
  isLoading: boolean;
  originalFileName: string;
  onDownload: () => void;
  onReset: () => void;
}

export default function Step4Result({ isLoading, onReset }: Props) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#E8F7FF] via-white to-[#FFF8E6] flex justify-center items-center px-6 py-12 overflow-hidden">
      <StepBreadcrumb currentStep={4} />
      {isLoading && (
        <LoadingOverlay message="Menyiapkan dokumen akhir, mohon tunggu..." />
      )}

      {/* ── Page ornaments ── */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0C4F81] via-[#2FAAE1] to-[#FFA62B]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFA62B] via-[#2FAAE1] to-[#0C4F81]" />

      {/* Top-left concentric arcs */}
      <div className="pointer-events-none absolute top-0 left-0 w-80 h-80 opacity-[0.07]">
        <svg viewBox="0 0 320 320" fill="none">
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

      {/* Bottom-left golden arcs */}
      <div className="pointer-events-none absolute bottom-0 left-0 opacity-[0.06] w-96 h-96">
        <svg viewBox="0 0 384 384" fill="none">
          {[80, 110, 140, 170, 200].map((r, i) => (
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

      {/* Dot grid left */}
      <div
        className="pointer-events-none absolute left-0 top-1/3 w-40 h-40 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle,#0C4F81 1.5px,transparent 1.5px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Dot grid right */}
      <div
        className="pointer-events-none absolute right-0 bottom-1/3 w-40 h-40 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle,#0C4F81 1.5px,transparent 1.5px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* ── Main card ── */}
      <div className="relative z-10 w-full max-w-md mt-16">
        <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-[#2FAAE1]/30 overflow-hidden">
          {/* Top stripe */}
          <div className="h-1.5 bg-gradient-to-r from-[#0C4F81] via-[#2FAAE1] to-[#FFA62B]" />

          {/* Navy header */}
          <div className="relative bg-gradient-to-br from-[#0C4F81] to-[#1a6aaa] px-8 pt-7 pb-5 flex flex-col items-center overflow-hidden">
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle,#ffffff 1px,transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            <div className="pointer-events-none absolute -left-5 -top-5 w-28 h-28 opacity-20">
              <svg viewBox="0 0 112 112" fill="none">
                {[28, 46, 64].map((r, i) => (
                  <circle
                    key={i}
                    cx="0"
                    cy="0"
                    r={r}
                    stroke="white"
                    strokeWidth="5"
                    strokeDasharray="4 7"
                  />
                ))}
              </svg>
            </div>
            <div className="pointer-events-none absolute -right-5 -bottom-5 w-28 h-28 opacity-20">
              <svg viewBox="0 0 112 112" fill="none">
                {[28, 46, 64].map((r, i) => (
                  <circle
                    key={i}
                    cx="112"
                    cy="112"
                    r={r}
                    stroke="#FFA62B"
                    strokeWidth="5"
                    strokeDasharray="4 7"
                  />
                ))}
              </svg>
            </div>
            <div className="z-10 mb-2">
              <Image
                src="/assets/images/white-logo-blpid.png"
                alt="BLPID"
                width={180}
                height={46}
                className="object-contain h-14 w-auto"
              />
            </div>
          </div>

          {/* Card body */}
          <div className="px-8 pb-8 pt-7 flex flex-col items-center text-center">
            {/* ── Signed document illustration ── */}
            <div className="relative mb-6">
              {/* Glow */}
              <div className="absolute inset-0 blur-2xl opacity-30 rounded-full bg-[#2FAAE1]" />
              <svg
                viewBox="0 0 160 200"
                className="relative w-32 h-40 drop-shadow-xl"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Document shadow */}
                <rect
                  x="18"
                  y="12"
                  width="120"
                  height="175"
                  rx="8"
                  fill="#e2e8f0"
                />
                {/* Document body */}
                <rect
                  x="12"
                  y="6"
                  width="120"
                  height="175"
                  rx="8"
                  fill="white"
                  stroke="#e2e8f0"
                  strokeWidth="1.5"
                />
                {/* Header strip */}
                <rect
                  x="12"
                  y="6"
                  width="120"
                  height="30"
                  rx="8"
                  fill="#0C4F81"
                />
                <rect x="12" y="24" width="120" height="12" fill="#0C4F81" />
                {/* Garuda / seal circle on header */}
                <circle cx="72" cy="21" r="10" fill="white" opacity="0.15" />
                <circle cx="72" cy="21" r="7" fill="white" opacity="0.15" />
                {/* Header lines */}
                <rect
                  x="30"
                  y="13"
                  width="50"
                  height="5"
                  rx="2"
                  fill="white"
                  opacity="0.7"
                />
                <rect
                  x="30"
                  y="21"
                  width="35"
                  height="3"
                  rx="1.5"
                  fill="white"
                  opacity="0.4"
                />
                {/* Content lines */}
                <rect
                  x="22"
                  y="46"
                  width="85"
                  height="5"
                  rx="2"
                  fill="#cbd5e1"
                />
                <rect
                  x="22"
                  y="57"
                  width="100"
                  height="4"
                  rx="2"
                  fill="#e2e8f0"
                />
                <rect
                  x="22"
                  y="67"
                  width="90"
                  height="4"
                  rx="2"
                  fill="#e2e8f0"
                />
                <rect
                  x="22"
                  y="77"
                  width="95"
                  height="4"
                  rx="2"
                  fill="#e2e8f0"
                />
                <rect
                  x="22"
                  y="87"
                  width="75"
                  height="4"
                  rx="2"
                  fill="#e2e8f0"
                />
                {/* Divider */}
                <rect
                  x="22"
                  y="100"
                  width="100"
                  height="1"
                  rx="0.5"
                  fill="#e2e8f0"
                />
                {/* Second paragraph */}
                <rect
                  x="22"
                  y="108"
                  width="100"
                  height="4"
                  rx="2"
                  fill="#e2e8f0"
                />
                <rect
                  x="22"
                  y="118"
                  width="88"
                  height="4"
                  rx="2"
                  fill="#e2e8f0"
                />
                <rect
                  x="22"
                  y="128"
                  width="93"
                  height="4"
                  rx="2"
                  fill="#e2e8f0"
                />
                {/* Signature area */}
                <rect
                  x="22"
                  y="143"
                  width="55"
                  height="28"
                  rx="5"
                  fill="#f0f9ff"
                  stroke="#2FAAE1"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                />
                {/* Signature scribble */}
                <path
                  d="M28 162 Q35 152 40 158 Q46 164 50 155 Q55 148 62 156 Q67 162 72 157"
                  stroke="#0C4F81"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Stamp circle */}
                <circle
                  cx="105"
                  cy="157"
                  r="18"
                  fill="#fff5e6"
                  stroke="#FFA62B"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
                <circle
                  cx="105"
                  cy="157"
                  r="13"
                  stroke="#FFA62B"
                  strokeWidth="1"
                />
                {/* Stamp star rays */}
                {Array.from({ length: 8 }).map((_, i) => {
                  const a = (i * 45 * Math.PI) / 180;
                  return (
                    <line
                      key={i}
                      x1={105 + Math.cos(a) * 7}
                      y1={157 + Math.sin(a) * 7}
                      x2={105 + Math.cos(a) * 11}
                      y2={157 + Math.sin(a) * 11}
                      stroke="#FFA62B"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  );
                })}
                <circle cx="105" cy="157" r="5" fill="#FFA62B" opacity="0.6" />
                {/* Green checkmark badge */}
                <circle cx="120" cy="46" r="14" fill="#22c55e" />
                <circle cx="120" cy="46" r="14" fill="white" opacity="0.2" />
                <path
                  d="M113 46l5 5 9-9"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-extrabold text-[#0C4F81]">
              Tanda Tangan Berhasil!
            </h2>
            <p className="text-sm text-gray-500 mt-2 mb-6 leading-relaxed">
              Dokumen telah berhasil ditandatangani secara digital dan otomatis
              diunduh ke perangkat Anda.
            </p>

            {/* Info row */}
            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#E8F7FF] rounded-2xl px-4 py-3 text-left">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
                  Status
                </p>
                <p className="text-sm font-bold text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Tersertifikasi
                </p>
              </div>
              <div className="bg-[#FFF8E6] rounded-2xl px-4 py-3 text-left">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
                  Jenis
                </p>
                <p className="text-sm font-bold text-[#0C4F81]">BSrE</p>
              </div>
              <div className="col-span-2 bg-gray-50 rounded-2xl px-4 py-3 text-left">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
                  Waktu Penandatanganan
                </p>
                <p className="text-sm font-bold text-[#0C4F81]">
                  {new Date().toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                  {" · "}
                  {new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  WIB
                </p>
              </div>
            </div>

            {/* Star divider */}
            <div className="w-full flex items-center gap-2 mb-5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#2FAAE1]/40" />
              {[12, 16, 12].map((s, i) => (
                <svg
                  key={i}
                  style={{ width: s, height: s }}
                  className="text-[#FFA62B]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 0l2 6h6l-5 3.6 1.9 6L10 12l-4.9 3.6L7 9.6 2 6h6z" />
                </svg>
              ))}
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#2FAAE1]/40" />
            </div>

            <button
              type="button"
              onClick={onReset}
              className="w-full bg-gradient-to-r from-[#0C4F81] to-[#2FAAE1] hover:shadow-[0_0_20px_#2FAAE160] text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              Upload Dokumen Baru
            </button>
          </div>

          {/* Bottom stripe */}
          <div className="h-1.5 bg-gradient-to-r from-[#FFA62B] via-[#2FAAE1] to-[#0C4F81]" />
        </div>
      </div>

      {/* Header Logo */}
      <div className="absolute top-5 left-5 z-50 hidden sm:block">
        <Image
          src="/assets/images/logo-blpid-1.png"
          alt="BLPID"
          width={220}
          height={56}
          className="object-contain h-14 w-auto"
          priority
        />
      </div>

      {/* Floating Logo */}
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
  );
}
