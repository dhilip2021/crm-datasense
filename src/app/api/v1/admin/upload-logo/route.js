import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export const POST = async (req) => {
  const data = await req.formData()
  const file = data.get('file')

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file provided' })
  }

  // Folder to save logos
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos')

  // Ensure folder exists
  fs.mkdirSync(uploadDir, { recursive: true })

  const fileName = `${Date.now()}_${file.name}`
  const filePath = path.join(uploadDir, fileName)

  // Convert file to Buffer
  const buffer = Buffer.from(await file.arrayBuffer())

  fs.writeFileSync(filePath, buffer)

  return NextResponse.json({ success: true, filePath: `/uploads/logos/${fileName}` })
}
