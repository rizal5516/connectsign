"use client";

import StepBreadcrumb from "../ui/StepBreadcrumb";
import HeaderLogo from "../ui/HeaderLogo";
import FooterLogo from "../ui/FooterLogo";
import type { Signer } from "../../types/signing.type";

interface Props {
  signerCount: number | "";
  signerList: Signer[];
  onBack: () => void;
  onNext: () => void;
}

export default function Step2Settings({
  signerCount,
  signerList,
  onBack,
  onNext,
}: Props) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#E8F7FF] via-white to-[#FFF8E6] flex justify-center px-10 py-12">
      <StepBreadcrumb currentStep={2} />

      <HeaderLogo />
      <FooterLogo />

      <div className="w-full max-w-xl mt-28">
        <div className="bg-white rounded-3xl shadow-xl border border-[#2FAAE1]/30 p-8">
          <h2 className="text-2xl font-extrabold text-[#0C4F81] mb-1">
            Setting Penanda Tangan
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Dokumen akan ditandatangani oleh{" "}
            <strong>
              {typeof signerCount === "number"
                ? signerCount
                : signerList.length}
            </strong>{" "}
            penandatangan.
          </p>

          <div className="space-y-3 mb-6">
            {signerList.map((signer, idx) => (
              <div
                key={signer.nik}
                className="flex items-center gap-4 p-4 rounded-2xl border border-[#2FAAE1]/30 bg-[#E8F7FF]/40"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0C4F81] to-[#2FAAE1] text-white flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0C4F81]">
                    {signer.name}
                  </p>
                  {/* <p className="text-xs text-gray-400">NIK: {signer.nik.replace(/\d(?=\d{4})/g, '*')}</p> */}
                  <p className="text-xs text-gray-400">BSrE</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-[#0C4F81] px-6 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer hover:scale-[1.01]"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={onNext}
              className="w-full bg-gradient-to-r from-[#0C4F81] to-[#FFA62B] hover:shadow-[0_0_15px_#FFA62B60] text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 cursor-pointer hover:scale-[1.01]"
            >
              Lanjut ke Proses Tanda Tangan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
