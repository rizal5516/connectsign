'use client'

import { useEffect, useRef, useState } from 'react'
import {
    getDocument,
    GlobalWorkerOptions,
    PDFDocumentProxy,
} from 'pdfjs-dist/legacy/build/pdf'
import workerSrc from 'pdfjs-dist/legacy/build/pdf.worker.entry'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'

GlobalWorkerOptions.workerSrc = workerSrc

type Props = {
    base64Pdf: string
    signatureImage: string
    pageNumber: number
    setTotalPages: (count: number) => void
    onPositionChange: (pos: {
        x: number
        y: number
        width: number
        height: number
        pdfWidth?: number
        pdfHeight?: number
    }) => void
}

export default function PdfViewerInner({
    base64Pdf,
    signatureImage,
    pageNumber,
    setTotalPages,
    onPositionChange,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [scale, setScale] = useState(1.5)
    const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
    const [sigPos, setSigPos] = useState({ x: 100, y: 100, width: 220, height: 60 })
    const [tagPos, setTagPos] = useState<{ x: number; y: number } | null>(null)

    // === Update posisi ke parent ===
    useEffect(() => {
        onPositionChange(sigPos)
    }, [sigPos])

    // === Load PDF ===
    useEffect(() => {
        const loadPdf = async () => {
            if (!base64Pdf) return
            try {
                const arrayBuffer = Uint8Array.from(atob(base64Pdf), (c) =>
                    c.charCodeAt(0)
                ).buffer
                const pdfDoc = await getDocument({ data: arrayBuffer }).promise
                setPdf(pdfDoc)
                setTotalPages(pdfDoc.numPages)
            } catch (err) {
                console.error('❌ Failed to load PDF:', err)
            }
        }

        loadPdf()
    }, [base64Pdf])

    // === Render PDF Page ===
    useEffect(() => {
        const renderPage = async () => {
            if (!pdf || !canvasRef.current || !containerRef.current) return

            const safePage = Math.max(1, Math.min(pageNumber, pdf.numPages))
            const page = await pdf.getPage(safePage)

            const pdfViewport = page.getViewport({ scale: 1 })
            const container = containerRef.current
            const containerWidth = container.clientWidth - 48
            const containerHeight = window.innerHeight * 0.75
            const scaleX = containerWidth / pdfViewport.width
            const scaleY = containerHeight / pdfViewport.height
            const optimalScale = Math.min(scaleX, scaleY) * 0.95

            setScale(optimalScale)

            const displayViewport = page.getViewport({ scale: optimalScale })
            const canvas = canvasRef.current
            const context = canvas.getContext('2d')!
            const outputScale = window.devicePixelRatio || 1

            canvas.width = Math.floor(displayViewport.width * outputScale)
            canvas.height = Math.floor(displayViewport.height * outputScale)
            canvas.style.width = Math.floor(displayViewport.width) + 'px'
            canvas.style.height = Math.floor(displayViewport.height) + 'px'

            const transform =
                outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined

            await page.render({
                canvasContext: context,
                viewport: displayViewport,
                transform: transform,
            }).promise

            // === Cari posisi tag `#`
            const textContent = await page.getTextContent()
            const tag = textContent.items.find((item) =>
                (item as TextItem).str?.includes('#')
            ) as TextItem | undefined

            if (tag && 'transform' in tag) {
                const [a, b, c, d, e, f] = tag.transform
                const tagX = e * optimalScale
                const tagY = (pdfViewport.height - f) * optimalScale

                setTagPos({ x: tagX, y: tagY })
                setSigPos((prev) => ({
                    ...prev,
                    x: tagX,
                    y: tagY - prev.height, // tempatkan sedikit di atas tag #
                }))
            }

            onPositionChange({
                ...sigPos,
                pdfWidth: pdfViewport.width,
                pdfHeight: pdfViewport.height,
            })
        }

        renderPage()
    }, [pdf, pageNumber])

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    display: 'inline-block',
                    backgroundColor: '#fff',
                    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                }}
            >
                <canvas ref={canvasRef} style={{ display: 'block' }} />

                {/* === Signature Image === */}
                {signatureImage && tagPos && (
                    <div
                        style={{
                            position: 'absolute',
                            left: sigPos.x,
                            top: sigPos.y,
                            width: sigPos.width,
                            height: sigPos.height,
                            border: '2px solid blue',
                            userSelect: 'none',
                            cursor: 'default',
                            pointerEvents: 'none', // ✅ Tidak bisa digeser atau diresize
                            transition: 'opacity 0.3s ease-in',
                            opacity: signatureImage ? 1 : 0,
                        }}
                    >
                        <img
                            src={`data:image/png;base64,${signatureImage}`}
                            alt="Signature"
                            style={{
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none',
                                borderRadius: '4px',
                            }}
                            draggable={false}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
