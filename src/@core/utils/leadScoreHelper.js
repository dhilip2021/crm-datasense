export function calculateLeadScore(formData) {
  let score = 0

  // 🎯 Demographic Scoring
  if (formData.designation?.toLowerCase().includes('ceo') || formData.designation?.toLowerCase().includes('founder')) {
    score += 25
  }

  if (formData.company_size && Number(formData.company_size) > 200) {
    score += 15
  }

  const targetIndustries = ['pharma', 'software', 'finance']
  if (targetIndustries.includes(formData.industry?.toLowerCase())) {
    score += 20
  }

  const targetLocations = ['chennai', 'bangalore', 'hyderabad']
  if (targetLocations.includes(formData.location?.toLowerCase())) {
    score += 10
  }

  // 📈 Behavioral Scoring
  if (formData.completed_all_required_fields) {
    score += 15
  }

  if (formData.clicked_email || formData.opened_whatsapp) {
    score += 10
  }

  if (formData.requested_demo || formData.requested_quote) {
    score += 20
  }

  if (formData.days_since_last_activity > 7) {
    score -= 10
  }

  // 🏷️ Label Logic
  let lead_label = 'Cold Lead'
  if (score >= 75) lead_label = 'Hot Lead'
  else if (score >= 50) lead_label = 'Warm Lead'

  return { lead_score: score, lead_label }
}
