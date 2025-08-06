import { leadScoringRules } from './leadScoringConfig'

export const calculateLeadScore = (leadData) => {
  let totalScore = 0

  // Demographic
  leadScoringRules.demographic.forEach(rule => {
    const value = leadData[rule.field]
    if (rule.condition) {
      if (rule.condition(value)) totalScore += rule.score
    } else if (Array.isArray(rule.value)) {
      if (rule.value.includes(value)) totalScore += rule.score
    } else if (value === rule.value) {
      totalScore += rule.score
    }
  })

  // Behavioral
  leadScoringRules.behavioral.forEach(rule => {
    const value = leadData[rule.field]
    if (rule.condition) {
      if (rule.condition(value)) totalScore += rule.score
    } else if (value === rule.value) {
      totalScore += rule.score
    }
  })

  return Math.min(totalScore, 100)
}
