export interface AttendanceEventResult {
  id: number
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
  rewardDesc: string
}

export interface CheckInResult {
  eventId: number
  checkedDate: string // YYYY-MM-DD
  streakDays: number
}