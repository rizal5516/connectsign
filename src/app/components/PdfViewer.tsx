'use client'

import dynamic from 'next/dynamic'
import { ComponentProps } from 'react'

const PdfViewerInner = dynamic(() => import('./PdfViewerInner'), { ssr: false })

type Props = ComponentProps<typeof PdfViewerInner>

export default function PdfViewer(props: Props) {
  return <PdfViewerInner {...props} />
}