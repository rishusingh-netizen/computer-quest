export const LEVEL6_LESSONS = {
  'l6-excel': {
    id: 'l6-excel',
    title: 'Spreadsheets',
    summary: 'Tables and simple formulas',
    xpReward: 25,
    estimatedMin: 10,
    content: '<p>Spreadsheets store data in rows and columns and can calculate with formulas.</p>',
  },
}
export function getLevel6Lesson(id) {
  return LEVEL6_LESSONS[id] || null
}
