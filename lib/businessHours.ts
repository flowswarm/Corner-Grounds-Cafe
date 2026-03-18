/**
 * Business hours for Corner Grounds Cafe
 * 
 * Mon–Fri: 7 AM – 6 PM
 * Sat:     8 AM – 8 PM
 * Sun:     8 AM – 4 PM
 */

// Schedule: [openHour, closeHour] per day (0 = Sunday, 6 = Saturday)
const SCHEDULE: Record<number, [number, number]> = {
    0: [8, 16],  // Sunday:    8 AM – 4 PM
    1: [7, 18],  // Monday:    7 AM – 6 PM
    2: [7, 18],  // Tuesday:   7 AM – 6 PM
    3: [7, 18],  // Wednesday: 7 AM – 6 PM
    4: [7, 18],  // Thursday:  7 AM – 6 PM
    5: [7, 18],  // Friday:    7 AM – 6 PM
    6: [8, 20],  // Saturday:  8 AM – 8 PM
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function isWithinBusinessHours(date: Date = new Date()): boolean {
    const day = date.getDay();
    const hour = date.getHours();
    const [open, close] = SCHEDULE[day];
    return hour >= open && hour < close;
}

export function getTodayHours(date: Date = new Date()): { open: string; close: string; dayName: string } {
    const day = date.getDay();
    const [openHour, closeHour] = SCHEDULE[day];

    const formatHour = (h: number) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const display = h % 12 || 12;
        return `${display} ${ampm}`;
    };

    return {
        open: formatHour(openHour),
        close: formatHour(closeHour),
        dayName: DAY_NAMES[day],
    };
}

export function getNextOpenTime(date: Date = new Date()): { dayName: string; open: string } {
    const currentDay = date.getDay();
    const currentHour = date.getHours();
    const [, closeToday] = SCHEDULE[currentDay];

    // If we haven't opened yet today
    const [openToday] = SCHEDULE[currentDay];
    if (currentHour < openToday) {
        return {
            dayName: 'today',
            open: `${openToday % 12 || 12} ${openToday >= 12 ? 'PM' : 'AM'}`,
        };
    }

    // If we're past close, find the next day
    const nextDay = (currentDay + 1) % 7;
    const [nextOpen] = SCHEDULE[nextDay];
    return {
        dayName: DAY_NAMES[nextDay],
        open: `${nextOpen % 12 || 12} ${nextOpen >= 12 ? 'PM' : 'AM'}`,
    };
}
