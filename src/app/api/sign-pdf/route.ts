import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        
        console.log('=== REQUEST TO BSSN ===')
        console.log('NIK:', body.nik)
        console.log('Has passphrase:', !!body.passphrase)
        console.log('Signature tampilan:', body.signatureProperties?.[0]?.tampilan)
        console.log('Image base64 length:', body.signatureProperties?.[0]?.imageBase64?.length || 0)
        console.log('PDF file length:', body.file?.[0]?.length || 0)
        
        const response = await fetch('https://spl.bssn.go.id/esign/v2/sign/pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic c2lnbmluZ19pbnRlZ3JhdG9yOnhXQW9zXTk5QU04THs1RU0='
            },
            body: JSON.stringify(body)
        })

        const responseText = await response.text()
        
        console.log('=== RESPONSE FROM BSSN ===')
        console.log('Status:', response.status)
        console.log('Response:', responseText.substring(0, 500))

        if (!response.ok) {
            console.error('BSSN Error:', responseText)
            return NextResponse.json(
                { error: responseText || 'Request failed', status: response.status },
                { status: response.status }
            )
        }

        const data = JSON.parse(responseText)
        return NextResponse.json(data, { status: 200 })
        
    } catch (error: unknown) {
        console.error('=== ROUTE ERROR ===')
        console.error('Error:', error)
        
        const errorMessage =
            typeof error === 'object' && error !== null && 'message' in error
                ? (error as { message?: string }).message || 'Internal server error'
                : 'Internal server error'
        
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}

// import { NextRequest, NextResponse } from 'next/server'

// export async function POST(request: NextRequest) {
//     try {
//         const body = await request.json()
        
//         console.log('=== REQUEST TO BSSN ===')
//         console.log('NIK:', body.nik)
//         console.log('Has passphrase:', !!body.passphrase)
//         console.log('Signature tampilan:', body.signatureProperties?.[0]?.tampilan)
//         console.log('Image base64 length:', body.signatureProperties?.[0]?.imageBase64?.length || 0)
//         console.log('PDF file length:', body.file?.[0]?.length || 0)
        
//         const response = await fetch('https://esign-dev.layanan.go.id/api/v2/sign/pdf', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': 'Basic ZXNpZ246d3JqY2dYNjUyNkEyZENZU0FWNnU='
//             },
//             body: JSON.stringify(body)
//         })

//         const responseText = await response.text()
        
//         console.log('=== RESPONSE FROM BSSN ===')
//         console.log('Status:', response.status)
//         console.log('Response:', responseText.substring(0, 500))

//         if (!response.ok) {
//             console.error('BSSN Error:', responseText)
//             return NextResponse.json(
//                 { error: responseText || 'Request failed', status: response.status },
//                 { status: response.status }
//             )
//         }

//         const data = JSON.parse(responseText)
//         return NextResponse.json(data, { status: 200 })
        
//     } catch (error: unknown) {
//         console.error('=== ROUTE ERROR ===')
//         console.error('Error:', error)
        
//         const errorMessage =
//             typeof error === 'object' && error !== null && 'message' in error
//                 ? (error as { message?: string }).message || 'Internal server error'
//                 : 'Internal server error'
        
//         return NextResponse.json(
//             { error: errorMessage },
//             { status: 500 }
//         )
//     }
// }