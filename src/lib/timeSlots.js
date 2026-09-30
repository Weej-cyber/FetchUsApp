// Bookable time slots, half-hour increments.
// Day: 9:30 AM – 3:00 PM. Evening: 5:00 PM – 6:30 PM.
export const DAY_SLOTS = [
  '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM',
]

export const EVENING_SLOTS = ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM']

export const TIME_SLOTS = [...DAY_SLOTS, ...EVENING_SLOTS]
