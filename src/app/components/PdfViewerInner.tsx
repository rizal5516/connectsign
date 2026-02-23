"use client";

import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).toString();

// ── Types ────────────────────────────────────────────────────

type SignaturePosition = {
  x: number;
  y: number;
  width: number;
  height: number;
  pdfWidth?: number;
  pdfHeight?: number;
};

type Props = {
  base64Pdf: string;
  signatureImage: string;
  pageNumber: number;
  setTotalPages: (count: number) => void;
  onPositionChange: (pos: SignaturePosition) => void;
};

// ── Constants ────────────────────────────────────────────────

const INITIAL_SIG_POS: SignaturePosition = {
  x: 100,
  y: 100,
  width: 220,
  height: 60,
};

const containerStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "16px",
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
};

const pdfWrapperStyle: React.CSSProperties = {
  position: "relative",
  display: "inline-block",
  backgroundColor: "#fff",
  boxShadow: "0 0 10px rgba(0,0,0,0.2)",
};

// ── Component ────────────────────────────────────────────────

export default function PdfViewerInner({
  base64Pdf,
  signatureImage,
  pageNumber,
  setTotalPages,
  onPositionChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep a ref to the active render task so we can cancel it
  // before starting a new one — prevents the "same canvas" error.
  const renderTaskRef = useRef<RenderTask | null>(null);

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [sigPos, setSigPos] = useState<SignaturePosition>(INITIAL_SIG_POS);
  const [tagPos, setTagPos] = useState<{ x: number; y: number } | null>(null);

  // ── Sync signature position to parent ──────────────────────

  useEffect(() => {
    onPositionChange(sigPos);
  }, [sigPos, onPositionChange]);

  // ── Load PDF from base64 ───────────────────────────────────

  useEffect(() => {
    if (!base64Pdf) return;

    let cancelled = false;

    const loadPdf = async () => {
      try {
        const arrayBuffer = Uint8Array.from(atob(base64Pdf), (c) =>
          c.charCodeAt(0),
        ).buffer;
        const pdfDoc = await getDocument({ data: arrayBuffer }).promise;
        if (cancelled) return;
        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
      } catch (err) {
        if (!cancelled) console.error("Failed to load PDF:", err);
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [base64Pdf, setTotalPages]);

  // ── Render PDF page ────────────────────────────────────────

  useEffect(() => {
    if (!pdf || !canvasRef.current || !containerRef.current) return;

    let cancelled = false;
    let page: PDFPageProxy | null = null;

    const renderPage = async () => {
      try {
        // ① Cancel any in-flight render before touching the canvas
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // cancel() may throw if the task already finished — safe to ignore
          }
          renderTaskRef.current = null;
        }

        const safePage = Math.max(1, Math.min(pageNumber, pdf.numPages));
        page = await pdf.getPage(safePage);
        if (cancelled) return;

        // ② Calculate optimal scale to fill the container width
        //    Height is based on window since the scroll container has no fixed height.
        const pdfViewport = page.getViewport({ scale: 1 });
        const container = containerRef.current!;
        const containerWidth = container.clientWidth - 32; // 16px padding each side
        const containerHeight = window.innerHeight * 0.72; // visible viewport minus header/nav
        const optimalScale = Math.min(
          containerWidth / pdfViewport.width,
          containerHeight / pdfViewport.height,
        );

        const displayViewport = page.getViewport({ scale: optimalScale });
        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d");
        if (!context || cancelled) return;

        // ③ Resize canvas
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(displayViewport.width * outputScale);
        canvas.height = Math.floor(displayViewport.height * outputScale);
        canvas.style.width = `${Math.floor(displayViewport.width)}px`;
        canvas.style.height = `${Math.floor(displayViewport.height)}px`;

        const transform:
          | [number, number, number, number, number, number]
          | undefined =
          outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : undefined;

        // ④ Start render and store task ref
        renderTaskRef.current = page.render({
          canvasContext: context,
          viewport: displayViewport,
          transform,
          canvas,
        });

        await renderTaskRef.current.promise;
        renderTaskRef.current = null;
        if (cancelled) return;

        // ⑤ Find `#` tag position for automatic signature placement
        const textContent = await page.getTextContent();
        if (cancelled) return;

        const tag = textContent.items.find(
          (item): item is TextItem =>
            "str" in item && (item as TextItem).str?.includes("#"),
        );

        if (tag && "transform" in tag) {
          const [, , , , e, f] = tag.transform as number[];
          const tagX = e * optimalScale;
          const tagY = (pdfViewport.height - f) * optimalScale;

          setTagPos({ x: tagX, y: tagY });
          setSigPos((prev) => ({ ...prev, x: tagX, y: tagY - prev.height }));
        }

        onPositionChange({
          ...INITIAL_SIG_POS,
          pdfWidth: pdfViewport.width,
          pdfHeight: pdfViewport.height,
        });
      } catch (err: unknown) {
        // RenderingCancelledException is expected when we cancel — suppress it
        if (
          err instanceof Error &&
          err.name !== "RenderingCancelledException"
        ) {
          console.error("Failed to render PDF page:", err);
        }
      }
    };

    renderPage();

    return () => {
      cancelled = true;
      // Cancel the active render task when deps change or component unmounts
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // safe to ignore
        }
        renderTaskRef.current = null;
      }
    };
  }, [pdf, pageNumber, onPositionChange]);

  // ── JSX ───────────────────────────────────────────────────

  return (
    <div ref={containerRef} style={containerStyle}>
      <div style={pdfWrapperStyle}>
        <canvas ref={canvasRef} style={{ display: "block" }} />

        {signatureImage && tagPos && (
          <div
            style={{
              position: "absolute",
              left: sigPos.x,
              top: sigPos.y,
              width: sigPos.width,
              height: sigPos.height,
              border: "2px solid blue",
              userSelect: "none",
              cursor: "default",
              pointerEvents: "none",
              transition: "opacity 0.3s ease-in",
              opacity: signatureImage ? 1 : 0,
            }}
          >
            <img
              src={`data:image/png;base64,${signatureImage}`}
              alt="Signature"
              style={{
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                borderRadius: "4px",
              }}
              draggable={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
