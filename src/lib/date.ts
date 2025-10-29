export const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hasTime = dateString.includes("T");

    return `${day}.${month}.${year} ${hasTime ? date.toLocaleTimeString() : ""}`;
};

export const isDatePast = (dateString?: string | null): boolean => {
    if (!dateString) return false;

    const today = new Date();
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return false;

    const todayMidnight = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    return date < todayMidnight;
};