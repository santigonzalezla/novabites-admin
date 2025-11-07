export const APP_TIMEZONE = 'America/Bogota';

export const getTodayLocal = (): string =>
{
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const isToday = (dateString: string): boolean =>
{
    return dateString === getTodayLocal();
};

export const parseLocalDate = (dateString: string): Date =>
{
    if (dateString.includes('T') || dateString.includes('Z')) return new Date(dateString);
    const [year, month, day] = dateString.split('-').map(Number);

    return new Date(year, month - 1, day);
};

export const utcToLocal = (utcDate: string | Date): Date =>
{
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    return new Date(date.getTime());
};

export const localToUTC = (localDate: Date | string): string =>
{
    const date = typeof localDate === 'string' ? parseLocalDate(localDate) : localDate;
    return date.toISOString();
};

export const getStartOfDayUTC = (dateString: string): string =>
{
    const localDate = parseLocalDate(dateString);
    localDate.setHours(0, 0, 0, 0);
    return localDate.toISOString();
};

export const getEndOfDayUTC = (dateString: string): string =>
{
    const localDate = parseLocalDate(dateString);
    localDate.setHours(23, 59, 59, 999);
    return localDate.toISOString();
};

export const formatDateLocal = (date: string | Date): string =>
{
    try
    {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) throw new Error('Invalid date');

        return new Intl.DateTimeFormat("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: APP_TIMEZONE
        }).format(dateObj);
    }
    catch (error)
    {
        console.error('Error formatting date:', error, date);
        return 'Fecha inválida';
    }
};

export const formatDateShort = (date: string | Date): string =>
{
    try
    {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) throw new Error('Invalid date');

        return new Intl.DateTimeFormat("es-CO", {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: APP_TIMEZONE
        }).format(dateObj);
    }
    catch (error)
    {
        console.error('Error formatting date:', error, date);
        return 'Fecha inválida';
    }
};

export const formatTimeLocal = (date: Date | string): string =>
{
    try
    {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) throw new Error('Invalid date');

        return new Intl.DateTimeFormat("es-CO", {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: APP_TIMEZONE
        }).format(dateObj);
    }
    catch (error)
    {
        console.error('Error formatting time:', error, date);
        return 'Hora inválida';
    }
};

export const formatDateTimeLocal = (date: Date | string): string =>
{
    try
    {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) throw new Error('Invalid date');

        return new Intl.DateTimeFormat("es-CO", { year: "numeric", month: "long", day: "numeric", hour: '2-digit', minute: '2-digit', hour12: true, timeZone: APP_TIMEZONE }).format(dateObj);
    }
    catch (error)
    {
        console.error('Error formatting datetime:', error, date);
        return 'Fecha inválida';
    }
};

export const getMaxDate = (): string =>
{
    return getTodayLocal();
};

export const isAfter = (date1: Date | string, date2: Date | string): boolean =>
{
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return d1.getTime() > d2.getTime();
};