export function formatDateToAlagoasISO(date: Date): string {
    const offset = 3 * 60;
    const localTime = new Date(date.getTime() - offset * 60 * 1000);
    return localTime.toISOString();
}