export const leadScoringRules = {
  demographic: [
    { field: 'designation', value: ['CXO', 'Founder'], score: 25 },
    { field: 'companySize', condition: size => size > 200, score: 15 },
    { field: 'industry', value: ['Pharma', 'Healthcare'], score: 20 },
    { field: 'location', value: ['Chennai', 'Coimbatore'], score: 10 }
  ],
  behavioral: [
    { field: 'formCompleted', value: true, score: 15 },
    { field: 'emailClicked', value: true, score: 10 },
    { field: 'askedDemo', value: true, score: 20 },
    { field: 'inactiveDays', condition: days => days > 7, score: -10 }
  ]
}
