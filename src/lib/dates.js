// ============= DATE HELPERS =============
export const getLocalYMD = (date) => {
  const d = date ? new Date(date) : new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().split('T')[0]
}
export const getLocalYMDH = (date) => {
  const d = date ? new Date(date) : new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().substring(0, 13)
}
