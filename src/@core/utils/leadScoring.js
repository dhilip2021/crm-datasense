// utils/leadScoring.js

export function calculateLeadScore(values) {
  let score = 0;

  // ✅ Demographic Scoring
  if (values.Designation?.toLowerCase().includes('cxo') || values.Designation?.toLowerCase().includes('founder')) {
    score += 25;
  }

  if (parseInt(values['Company Size']) > 200) {
    score += 15;
  }

  if (['pharma', 'software', 'finance'].includes(values.Industry?.toLowerCase())) {
    score += 20;
  }

  if (['chennai', 'bangalore', 'coimbatore'].includes(values['City / Location']?.toLowerCase())) {
    score += 10;
  }

  // ✅ Behavioral Scoring
  if (Object.keys(values).length > 10) {
    score += 15; // filled all key fields
  }

  if (values['Preferred Contact Mode']) {
    score += 10; // clicked / showed interest
  }

  if (values.Status === 'Requested Demo' || values.Status === 'Quote Requested') {
    score += 20;
  }

  // ❄️ Optional: Cold lead penalty (if inactive, apply externally)

  // 🎯 Final Labeling
  let label = 'Cold Lead';
  if (score >= 75) label = 'Hot Lead';
  else if (score >= 50) label = 'Warm Lead';

  return { lead_score: score, lead_label: label };
}
