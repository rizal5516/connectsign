"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";

import NotifModal from "./components/ui/NotifModal";
import PseModal from "./components/PseModal";
import Step1Upload from "./components/steps/Step1Upload";
import Step2Settings from "./components/steps/Step2Settings";
import Step3Sign from "./components/steps/Step3Sign";
import Step4Result from "./components/steps/Step4Result";

import type {
  NotifState,
  AdditionalSigner,
  SignaturePosition,
  PseProvider,
  Step,
} from "./types/signing.type";
import {
  SIGNATURE_REASON,
  SIGN_API_TIMEOUT_MS,
  getSignerListFromEnv,
} from "./constants/signing.constant";
import {
  fileToBase64,
  urlToBase64,
  validatePdfFile,
  validateImageFile,
  buildSignedFileName,
  base64ToBlobUrl,
} from "./utils/pdf";
import { parseApiError } from "./utils/errorHandler";

const NOTIF_AUTO_CLOSE_MS = 3000;

export default function Home() {
  const signerList = getSignerListFromEnv();

  const [step, setStep] = useState<Step>(1);

  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [pdfBase64Preview, setPdfBase64Preview] = useState<string>("");
  const [signedPdfUrls, setSignedPdfUrls] = useState<string[]>([]);

  const [signerCount, setSignerCount] = useState<number | "">("");
  const [isUserSigner, setIsUserSigner] = useState(false);
  const [signerCountMode, setSignerCountMode] = useState<"select" | "custom">(
    "select",
  );
  const [customSignerCount, setCustomSignerCount] = useState<number | "">("");
  const [currentSignerIndex, setCurrentSignerIndex] = useState(0);

  const [nik, setNik] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [pse, setPse] = useState<PseProvider | "">("BSrE");

  const [visibleSignature, setVisibleSignature] = useState(false);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [signaturePos, setSignaturePos] = useState<SignaturePosition>({
    x: 100,
    y: 100,
    width: 150,
    height: 80,
  });
  const signaturePosRef = useRef(signaturePos);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [additionalSigners, setAdditionalSigners] = useState<
    AdditionalSigner[]
  >([{ nik: "", passphrase: "" }]);
  const [showAdditionalPassphrases, setShowAdditionalPassphrases] = useState<
    boolean[]
  >([false]);
  const [showAdditionalTTE, setShowAdditionalTTE] = useState(false);
  const [tteCount, setTteCount] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showPseModal, setShowPseModal] = useState(false);

  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [notif, setNotif] = useState<NotifState>({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  const passphraseRef = useRef<HTMLInputElement | null>(null);
  const autoFinalDownloadRanRef = useRef(false);

  const canUpload = typeof signerCount === "number" && signerCount > 0;

  const totalSigners =
    typeof signerCount === "number" && signerCount > 0
      ? signerCount
      : signerList.length;

  const showSignerSidebar = totalSigners > 1;

  const openNotif = useCallback(
    (type: NotifState["type"], title: string, message: string) => {
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
      setNotif({ open: true, type, title, message });
      notifTimerRef.current = setTimeout(() => {
        setNotif((prev) => ({ ...prev, open: false }));
      }, NOTIF_AUTO_CLOSE_MS);
    },
    [],
  );

  const closeNotif = useCallback(() => {
    if (notifTimerRef.current) {
      clearTimeout(notifTimerRef.current);
      notifTimerRef.current = null;
    }
    setNotif((prev) => ({ ...prev, open: false }));
    setTimeout(() => passphraseRef.current?.focus(), 50);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (step === 3) setTimeout(() => passphraseRef.current?.focus(), 50);
  }, [step]);

  useEffect(() => {
    if (step !== 3) return;
    const signer = signerList[currentSignerIndex];
    if (!signer) return;
    setNik(signer.nik);
    setPassphrase("");
    setShowPassphrase(false);
  }, [currentSignerIndex, step]); // signerList stabil karena dibaca dari env

  useEffect(() => {
    if (step !== 4 || !signedPdfUrls[0] || autoFinalDownloadRanRef.current)
      return;
    autoFinalDownloadRanRef.current = true;
    const fileName = buildSignedFileName(
      pdfFiles[0]?.name ?? "Dokumen_TTE_Final.pdf",
    );
    setTimeout(() => {
      const a = document.createElement("a");
      a.href = signedPdfUrls[signedPdfUrls.length - 1];
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }, 200);
  }, [step, signedPdfUrls, pdfFiles]);

  useEffect(() => {
    signaturePosRef.current = signaturePos;
  }, [signaturePos]);

  const processFiles = useCallback(
    async (files: File[]) => {
      const pdfFiles = files.filter((f) => f.type === "application/pdf");

      if (pdfFiles.length === 0) {
        openNotif(
          "error",
          "File Tidak Didukung",
          "Hanya file PDF yang dapat diunggah.",
        );
        return;
      }

      for (const file of pdfFiles) {
        const err = validatePdfFile(file);
        if (err) {
          openNotif("error", "File Tidak Valid", err);
          return;
        }
      }

      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 800)); // UX: sedikit delay agar spinner terlihat

      setPdfFiles(pdfFiles);

      if (pdfFiles.length === 1) {
        const base64 = await fileToBase64(pdfFiles[0]);
        setPdfBase64Preview(base64);
      }

      setVisibleSignature(false);

      if (typeof signerCount === "number" && signerCount > 1) {
        setStep(2);
      } else {
        setNik(signerList[0]?.nik ?? "");
        setAdditionalSigners([{ nik: "", passphrase: "" }]);
        setShowAdditionalPassphrases([false]);
        setStep(3);
      }

      setIsLoading(false);
    },
    [openNotif, signerCount, signerList],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) {
        openNotif("error", "Gagal", "Tidak ada file yang dipilih.");
        return;
      }
      await processFiles(files);
    },
    [processFiles, openNotif],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);
      const files = Array.from(e.dataTransfer.files);
      await processFiles(files);
    },
    [processFiles],
  );

  const handleSignatureImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const err = validateImageFile(file);
      if (err) {
        openNotif("error", "File Tidak Valid", err);
        return;
      }

      try {
        setIsLoading(true);
        const base64 = await fileToBase64(file);
        setImageBase64(base64);
        openNotif(
          "success",
          "Berhasil",
          `Gambar tanda tangan berhasil diunggah (${Math.round(base64.length / 1024)} KB)`,
        );
      } catch {
        openNotif(
          "error",
          "Terjadi Kesalahan",
          "Gagal memproses gambar tanda tangan.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [openNotif],
  );

  const signPDF = useCallback(async () => {
    if (pdfFiles.length === 0) {
      openNotif(
        "error",
        "Dokumen Tidak Ada",
        "Tidak ada file PDF untuk ditandatangani.",
      );
      return;
    }
    if (!nik.trim() || !passphrase.trim()) {
      openNotif(
        "error",
        "Data Tidak Lengkap",
        "NIK dan passphrase wajib diisi.",
      );
      return;
    }
    if (!pse) {
      openNotif(
        "info",
        "Pilih PSrE Terlebih Dahulu",
        "Silakan pilih PSrE sebelum melanjutkan.",
      );
      setShowPseModal(true);
      return;
    }
    if (visibleSignature && !imageBase64) {
      openNotif(
        "error",
        "Gambar Diperlukan",
        "Harap unggah gambar tanda tangan terlebih dahulu.",
      );
      return;
    }

    setIsLoading(true);
    const prevSignedUrls = [...signedPdfUrls];

    try {
      const resultUrls: string[] = [];
      const currentPos = signaturePosRef.current;

      for (let i = 0; i < pdfFiles.length; i++) {
        let inputBase64 = await fileToBase64(pdfFiles[i]);
        if (currentSignerIndex > 0 && prevSignedUrls[i]) {
          inputBase64 = await urlToBase64(prevSignedUrls[i]);
        }

        const signatureProperties =
          visibleSignature && imageBase64
            ? [
                {
                  tampilan: "VISIBLE",
                  imageBase64,
                  tag: "#",
                  width: currentPos.width,
                  height: currentPos.height,
                  location: "null",
                  reason: SIGNATURE_REASON,
                  contactInfo: "null",
                },
              ]
            : [{ tampilan: "INVISIBLE" }];

        const payload = {
          nik: nik.trim(),
          passphrase: passphrase.trim(),
          signatureProperties,
          file: [inputBase64],
        };

        const res = await axios.post("/api/sign-pdf", payload, {
          timeout: SIGN_API_TIMEOUT_MS,
        });

        if (!res.data?.file?.[0])
          throw new Error(`Respons tidak valid untuk file ke-${i + 1}`);

        resultUrls.push(base64ToBlobUrl(res.data.file[0]));
      }

      setSignedPdfUrls(resultUrls);
      setTteCount(1);
      openNotif("success", "Berhasil", "Dokumen berhasil ditandatangani!");

      const nextIndex = currentSignerIndex + 1;
      setCurrentSignerIndex(nextIndex);
      setStep(nextIndex >= totalSigners ? 4 : 3);
    } catch (error) {
      const parsed = parseApiError(error);
      openNotif(parsed.type, parsed.title, parsed.message);
    } finally {
      setIsLoading(false);
    }
  }, [
    pdfFiles,
    nik,
    passphrase,
    pse,
    visibleSignature,
    imageBase64,
    signedPdfUrls,
    currentSignerIndex,
    totalSigners,
    openNotif,
  ]);

  const handleAdditionalTTE = useCallback(async () => {
    const validSigners = additionalSigners.filter(
      (s) => s.nik.trim() && s.passphrase.trim(),
    );

    if (validSigners.length === 0) {
      openNotif(
        "error",
        "Data Tidak Lengkap",
        "Harap masukkan NIK dan passphrase penandatangan tambahan.",
      );
      return;
    }

    const lastUrl = signedPdfUrls[signedPdfUrls.length - 1];
    if (!lastUrl) {
      openNotif(
        "error",
        "Dokumen Belum Tersedia",
        "Dokumen belum tersedia untuk ditandatangani.",
      );
      return;
    }

    setIsLoading(true);

    try {
      let currentBase64 = await urlToBase64(lastUrl);

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
              reason: SIGNATURE_REASON,
              contactInfo: "null",
            },
          ],
          file: [currentBase64],
        };

        const res = await axios.post("/api/sign-pdf", payload, {
          timeout: SIGN_API_TIMEOUT_MS,
        });

        if (!res.data?.file?.[0])
          throw new Error(`Gagal TTE untuk NIK ${signer.nik}`);
        currentBase64 = res.data.file[0];
      }

      const finalUrl = base64ToBlobUrl(currentBase64);
      setSignedPdfUrls((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = finalUrl;
        return updated;
      });

      openNotif(
        "success",
        "Berhasil",
        "Tanda tangan tambahan berhasil diproses.",
      );
      setTteCount((n) => n + validSigners.length);
      setShowAdditionalTTE(false);
      setAdditionalSigners([{ nik: "", passphrase: "" }]);
      setCurrentSignerIndex((prev) => prev + validSigners.length);
      setStep(4);
    } catch (error) {
      const parsed = parseApiError(error);
      openNotif(parsed.type, parsed.title, parsed.message);
    } finally {
      setIsLoading(false);
    }
  }, [additionalSigners, signedPdfUrls, openNotif]);

  const addAdditionalSigner = useCallback(() => {
    setAdditionalSigners((prev) => [...prev, { nik: "", passphrase: "" }]);
    setShowAdditionalPassphrases((prev) => [...prev, false]);
  }, []);

  const removeAdditionalSigner = useCallback((index: number) => {
    setAdditionalSigners((prev) => prev.filter((_, i) => i !== index));
    setShowAdditionalPassphrases((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateAdditionalSigner = useCallback(
    (index: number, field: "nik" | "passphrase", value: string) => {
      setAdditionalSigners((prev) =>
        prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
      );
    },
    [],
  );

  const toggleAdditionalPassphrase = useCallback((index: number) => {
    setShowAdditionalPassphrases((prev) =>
      prev.map((show, i) => (i === index ? !show : show)),
    );
  }, []);

  const handleStep2Next = useCallback(() => {
    setNik(signerList[0]?.nik ?? "");
    setAdditionalSigners([{ nik: signerList[1]?.nik ?? "", passphrase: "" }]);
    setShowAdditionalPassphrases([false]);
    setStep(3);
  }, [signerList]);

  const handleDownload = useCallback(() => {
    const url = signedPdfUrls[signedPdfUrls.length - 1];
    if (!url) return;
    const fileName = buildSignedFileName(
      pdfFiles[0]?.name ?? "Dokumen_TTE_Final.pdf",
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [signedPdfUrls, pdfFiles]);

  const handleReset = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <main className="min-h-screen bg-white flex flex-col overflow-hidden">
      <NotifModal
        open={notif.open}
        type={notif.type}
        title={notif.title}
        message={notif.message}
        onClose={closeNotif}
      />

      {showPseModal && (
        <PseModal
          selected={pse}
          onSelect={(selected) => setPse(selected)}
          onClose={() => setShowPseModal(false)}
        />
      )}

      {step === 1 && (
        <Step1Upload
          signerCount={signerCount}
          isUserSigner={isUserSigner}
          signerCountMode={signerCountMode}
          customSignerCount={customSignerCount}
          isDragActive={isDragActive}
          canUpload={canUpload}
          isLoading={isLoading}
          setSignerCount={setSignerCount}
          setIsUserSigner={setIsUserSigner}
          setSignerCountMode={setSignerCountMode}
          setCustomSignerCount={setCustomSignerCount}
          onIsUserSignerChange={setIsUserSigner}
          onFileChange={handleFileChange}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragActive(false);
          }}
          onDrop={handleDrop}
        />
      )}

      {step === 2 && (
        <Step2Settings
          signerCount={signerCount}
          signerList={signerList}
          onBack={() => setStep(1)}
          onNext={handleStep2Next}
        />
      )}

      {step === 3 && (
        <Step3Sign
          nik={nik}
          passphrase={passphrase}
          showPassphrase={showPassphrase}
          pse={pse}
          visibleSignature={visibleSignature}
          imageBase64={imageBase64}
          pageNumber={pageNumber}
          totalPages={totalPages}
          pdfBase64Preview={pdfBase64Preview}
          isLoading={isLoading}
          signerList={signerList}
          currentSignerIndex={currentSignerIndex}
          showSignerSidebar={showSignerSidebar}
          passphraseRef={passphraseRef}
          onNikChange={setNik}
          onPassphraseChange={setPassphrase}
          onTogglePassphrase={() => setShowPassphrase((v) => !v)}
          onVisibleSignatureChange={setVisibleSignature}
          onSignatureImageChange={handleSignatureImageChange}
          onPositionChange={(pos) => setSignaturePos(pos)}
          onSetTotalPages={setTotalPages}
          onPageNext={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
          onPagePrev={() => setPageNumber((p) => Math.max(1, p - 1))}
          onOpenPseModal={() => setShowPseModal(true)}
          onSign={signPDF}
          onAddAdditionalSigner={addAdditionalSigner}
          onRemoveAdditionalSigner={removeAdditionalSigner}
          onUpdateAdditionalSigner={updateAdditionalSigner}
          onToggleAdditionalPassphrase={toggleAdditionalPassphrase}
          onAdditionalTTE={handleAdditionalTTE}
          onShowAdditionalTTEChange={setShowAdditionalTTE}
        />
      )}

      {step === 4 && (
        <Step4Result
          signedPdfUrls={signedPdfUrls}
          isLoading={isLoading}
          originalFileName={pdfFiles[0]?.name ?? "Dokumen_TTE_Final.pdf"}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      )}
    </main>
  );
}
