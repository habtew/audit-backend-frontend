// src/utils/dateUtils.ts

export const getPeriodDates = (period: string) => {
  const now = new Date();
  const startDate = new Date();
  const endDate = new Date(); // Defaults to now

  switch (period) {
    case 'this_month':
      startDate.setDate(1); // 1st of current month
      break;
    case 'last_month':
      startDate.setMonth(now.getMonth() - 1);
      startDate.setDate(1); // 1st of last month
      endDate.setDate(0);   // Last day of last month
      break;
    case 'this_quarter':
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate.setMonth(quarterStartMonth);
      startDate.setDate(1);
      break;
    case 'ytd':
      startDate.setMonth(0); // January
      startDate.setDate(1);  // 1st
      break;
    default:
      return {}; // No filter
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};