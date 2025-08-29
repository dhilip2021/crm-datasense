import { create_UUID, verifyAccessToken } from '@/helper/clientHelper'
import connectMongoDB from '@/libs/mongodb'
import { tsid18 } from '@/libs/tsid18'
import Leadform from '@/models/Leadform'
import Cookies from 'js-cookie'
import { NextResponse } from 'next/server'
import slugify from 'slugify'

// 🔥 Lead Scoring Logic
const calculateLeadScore = values => {
  let score = 0

  // 🧩 Demographic
  const designation = values['Job Tilte']
  const companySize = values['Company Size']
  const industry = values['Industry']
  const location = values['City']

  if (
    designation &&
    [
      'Chief Financial Officer',
      'Architect',
      'Building services engineer',
      'Licensed conveyancer',
      'Sports development officer',
      'CEO',
      'Manager',
      'Founder'
    ].includes(designation)
  )
    score += 25
  if (companySize && parseInt(companySize) > 50) score += 15
  if (
    industry &&
    ['Logistics', 'Manufacturing', 'Logistics', 'FMCG', 'Education', 'Pharma', 'Retail'].includes(industry)
  )
    score += 20
  if (
    location &&
    [
      'Kennethchester',
      'North Austinville',
      'Port Heathertown',
      'South Samanthamouth',
      'Chennai',
      'Coimabtore',
      'Bangalore',
      'Delhi'
    ].includes(location)
  )
    score += 10

  // 📈 Behavioral
  if (Object.values(values).length >= 8) score += 15
  if (values['Clicked Email'] || values['Opened WhatsApp']) score += 10
  if (values['Requested Demo'] || values['Asked for Quote']) score += 20
  if (values['Last Contact Date'] && new Date(values['Last Contact Date']) < Date.now() - 7 * 24 * 60 * 60 * 1000)
    score -= 10

  // 🏷️ Lead Label
  let label = 'Cold Lead'
  if (score >= 75) label = 'Hot Lead'
  else if (score >= 50) label = 'Warm Lead'

  return { lead_score: score, lead_label: label }
}

export async function POST(req) {
  await connectMongoDB()
  const body = await req.json()

  const verified = verifyAccessToken();


    if (verified.success) {

      console.log(verified,"<<<< VERIFIEDDDDD")



       try {
    const { organization_id, organization_name, form_name, values } = body

    if (!organization_id || !form_name || !values) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    // Safe prefix fallback
    const prefix = process.env.NEXT_PUBLIC_LEAD_PREFIX || 'CRM LEAD 2025'
    const prefixId = `${organization_name} `

    // Auto-increment ID logic
    const lastEntry = await Leadform.findOne().sort({ _id: -1 }).lean()
    const lastAutoId = lastEntry?.auto_inc_id || ''
    const lastNumber = parseInt(lastAutoId.replace(/\D/g, '')) || 0
    const nextAutoId = String(lastNumber + 1).padStart(5, '0')

    // Generate name & slug
    const lead_name = `${prefix} ${nextAutoId}`
    const slugBase = lead_name.replace(/[^\w\s]/gi, '')
    const lead_slug_name = slugify(slugBase, {
      replacement: '-',
      lower: true,
      trim: true
    })

    // Generate id & slug id
    const lead_id = `${prefixId} ${nextAutoId}`
    const slugBaseId = lead_id.replace(/[^\w\s]/gi, '')
    const lead_slug_id = slugify(slugBaseId, {
      replacement: '-',
      lower: false,
      trim: true
    })

    // ✅ Lead Scoring
    const { lead_score, lead_label } = calculateLeadScore(values)

    const leadformData = new Leadform({
      organization_id,
      auto_inc_id: nextAutoId,
      // lead_id: create_UUID(),
      // lead_id: lead_slug_id,
      lead_id: tsid18(),
      lead_name,
      lead_slug_name,
      form_name,
      values: {
        ...values,
        Score: lead_score,
        Label: lead_label
      },
      c_createdBy: verified.data.user_id,
      c_role_id: verified.data.c_role_id,      
      submittedAt: new Date()
    })

    await leadformData.save()

    return NextResponse.json({
      success: true,
      message: 'Lead form saved with score',
      data: {
        organization_id,
        auto_inc_id: nextAutoId,
        lead_name,
        lead_slug_name,
        form_name,
        values: leadformData.values,
        submittedAt: leadformData.submittedAt,
        lead_score,
        lead_label
      }
    })
  } catch (error) {
   
    return NextResponse.json(
      {
        success: false,
        message: 'Internal Server Error',
        error: error.message
      },
      { status: 500 }
    )
  }


    }else{
       return NextResponse.json(
      {
        success: false,
        message: '',
        error: 'token expired!'
      },
      { status: 400 }
    )



    }



 
}
