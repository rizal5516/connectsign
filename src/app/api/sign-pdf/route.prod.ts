import { NextRequest, NextResponse } from 'next/server'

const BSSN_API_URL = process.env.BSSN_API_URL
const BSSN_API_TOKEN = process.env.BSSN_API_TOKEN

interface SignatureProperty {
    tampilan?: string
    imageBase64?: string
    [key: string]: unknown
}

interface SignPdfRequestBody {
    nik?: string
    passphrase?: string
    signatureProperties?: SignatureProperty[]
    file?: string[]
    [key: string]: unknown
}

function validateRequestBody(body: unknown): body is SignPdfRequestBody {
    if (!body || typeof body !== 'object') return false
    const b = body as Record<string, unknown>
    if (typeof b.nik !== 'string' || b.nik.trim() === '') return false
    if (typeof b.passphrase !== 'string' || b.passphrase.trim() === '') return false
    if (!Array.isArray(b.file) || b.file.length === 0) return false
    return true
}

export async function POST(request: NextRequest) {
    if (!BSSN_API_URL || !BSSN_API_TOKEN) {
        console.error('[BSSN PROD] Missing environment variables: BSSN_API_URL or BSSN_API_TOKEN')
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        )
    }

    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!validateRequestBody(body)) {
        return NextResponse.json(
            { error: 'Request tidak valid. Field nik, passphrase, dan file wajib diisi.' },
            { status: 400 }
        )
    }

    // Log minimal — JANGAN log NIK/passphrase di production
    console.info('[BSSN PROD] Sign request received')

    let response: Response
    try {
        response = await fetch(BSSN_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${BSSN_API_TOKEN}`,
            },
            body: JSON.stringify(body),
        })
    } catch (err) {
        console.error('[BSSN PROD] Network error saat menghubungi BSSN:', err)
        return NextResponse.json(
            { error: 'Gagal terhubung ke layanan BSSN' },
            { status: 502 }
        )
    }

    const responseText = await response.text()
    console.info(`[BSSN PROD] Response status: ${response.status}`)

    if (!response.ok) {
        console.error(`[BSSN PROD] BSSN error ${response.status}`)
        return NextResponse.json(
            { error: 'Permintaan ke BSSN gagal', status: response.status },
            { status: response.status }
        )
    }

    try {
        const data = JSON.parse(responseText)
        return NextResponse.json(data, { status: 200 })
    } catch {
        console.error('[BSSN PROD] Gagal parse response JSON dari BSSN')
        return NextResponse.json(
            { error: 'Response tidak valid dari BSSN' },
            { status: 502 }
        )
    }
}