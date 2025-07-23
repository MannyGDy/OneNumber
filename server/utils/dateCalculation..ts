/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param date Date to check
 * @returns boolean True if weekend, false if weekday
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

/**
 * Check if a date is a public holiday (simplified implementation)
 * In a real application, you would use a more comprehensive holiday calendar
 * @param date Date to check
 * @returns boolean True if holiday, false if not
 */
export const isHoliday = (date: Date): boolean => {
  // This is a placeholder for a more comprehensive holiday checking function
  // In a real application, you would likely use a library or API for this
  const dateString = date.toISOString().split('T')[0];

  // Sample Nigerian holidays for 2025 (simplified)
  const holidays = [
    '2025-01-01', // New Year's Day
    '2025-04-18', // Good Friday
    '2025-04-21', // Easter Monday
    '2025-05-01', // Labour Day
    '2025-05-29', // Democracy Day
    '2025-10-01', // Independence Day
    '2025-12-25', // Christmas Day
    '2025-12-26', // Boxing Day
  ];

  return holidays.includes(dateString);
};

/**
 * Check if a date is a working day (not weekend and not holiday)
 * @param date Date to check
 * @returns boolean True if working day, false if not
 */
export const isWorkingDay = (date: Date): boolean => {
  return !isWeekend(date) && !isHoliday(date);
};

/**
 * Add a specified number of working days to a date
 * @param date Starting date
 * @param days Number of working days to add
 * @returns Date New date after adding specified working days
 */
export const addWorkingDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  let workingDaysAdded = 0;

  while (workingDaysAdded < days) {
    // Add one calendar day
    result.setDate(result.getDate() + 1);

    // Check if it's a working day
    if (isWorkingDay(result)) {
      workingDaysAdded++;
    }
  }

  return result;
};

/**
 * Calculate the number of working days between two dates
 * @param startDate Start date
 * @param endDate End date
 * @returns number Number of working days between dates
 */
export const getWorkingDaysBetween = (startDate: Date, endDate: Date): number => {
  let workingDays = 0;
  const currentDate = new Date(startDate);

  // Iterate through each day and count working days
  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
};