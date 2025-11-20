import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req) {
  try {
    const body = await req.json()
    const { filePath } = body

    if (!filePath) {
      return NextResponse.json({ success: false, message: 'File path is required' })
    }

    // Build absolute path
    const absolutePath = path.join(process.cwd(), 'public', filePath.replace('/',''))

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath) // delete the file
      return NextResponse.json({ success: true, message: 'File deleted successfully' })
    } else {
      return NextResponse.json({ success: false, message: 'File not found' })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: 'Something went wrong' })
  }
}
