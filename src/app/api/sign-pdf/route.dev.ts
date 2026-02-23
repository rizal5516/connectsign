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
        console.error('[BSSN DEV] Missing environment variables: BSSN_API_URL or BSSN_API_TOKEN')
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        )
    }

    let body: SignPdfRequestBody
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

    // Log detail boleh di development
    console.debug('[BSSN DEV] === REQUEST ===')
    console.debug('[BSSN DEV] NIK:', body.nik)
    console.debug('[BSSN DEV] Has passphrase:', !!body.passphrase)
    console.debug('[BSSN DEV] Signature tampilan:', body.signatureProperties?.[0]?.tampilan)
    console.debug('[BSSN DEV] Image base64 length:', body.signatureProperties?.[0]?.imageBase64?.length ?? 0)
    console.debug('[BSSN DEV] PDF file length:', body.file?.[0]?.length ?? 0)

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
        console.error('[BSSN DEV] Network error saat menghubungi BSSN:', err)
        return NextResponse.json(
            { error: 'Gagal terhubung ke layanan BSSN' },
            { status: 502 }
        )
    }

    const responseText = await response.text()

    console.debug('[BSSN DEV] === RESPONSE ===')
    console.debug('[BSSN DEV] Status:', response.status)
    console.debug('[BSSN DEV] Body preview:', responseText.substring(0, 500))

    if (!response.ok) {
        console.error(`[BSSN DEV] BSSN error ${response.status}:`, responseText)
        return NextResponse.json(
            { error: responseText || 'Permintaan ke BSSN gagal', status: response.status },
            { status: response.status }
        )
    }

    try {
        const data = JSON.parse(responseText)
        return NextResponse.json(data, { status: 200 })
    } catch {
        console.error('[BSSN DEV] Gagal parse response JSON dari BSSN:', responseText)
        return NextResponse.json(
            { error: 'Response tidak valid dari BSSN' },
            { status: 502 }
        )
    }
}