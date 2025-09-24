import { NextRequest, NextResponse } from 'next/server'

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return res
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 200 }))
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    if (!file) return cors(NextResponse.json({ success: false, error: 'Dosya bulunamadı' }, { status: 400 }))

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) return cors(NextResponse.json({ success: false, error: 'Maksimum 2MB' }, { status: 413 }))

    if (!file.type.startsWith('image/')) return cors(NextResponse.json({ success: false, error: 'Sadece resim' }, { status: 400 }))

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return cors(NextResponse.json({ success: true, url: dataUrl, size: file.size, type: file.type }))
  } catch (e) {
    return cors(NextResponse.json({ success: false, error: 'Upload error' }, { status: 500 }))
  }
}
