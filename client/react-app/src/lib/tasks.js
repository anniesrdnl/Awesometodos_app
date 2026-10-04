export const MIN_TITLE_LENGTH = 4;

export const VIEWS = [
    { id: "all", label: "All", title: "All tasks", href: "#/", matches: () => true },
    { id: "active", label: "Active", title: "Active", href: "#/active", matches: (task) => !task.status },
    { id: "completed", label: "Completed", title: "Completed", href: "#/completed", matches: (task) => task.status },
];

export function validateTitle(value) {
    const title = value.trim();
    if (!title) return "Enter a task name.";
    if (title.length < MIN_TITLE_LENGTH) return `Use at least ${MIN_TITLE_LENGTH} characters.`;
    return null;
}

export const byCreation = (a, b) => (a._id < b._id ? -1 : a._id > b._id ? 1 : 0);

// MongoDB ObjectIds start with the creation time in seconds, as 8 hex characters.
export const getCreatedAt = (id) => new Date(parseInt(id.slice(0, 8), 16) * 1000);

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export const daysSince = (date) => Math.floor((Date.now() - date) / DAY_MS);

export function formatCreatedAt(date, now = new Date()) {
    const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
    });
}

export function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

export const formatToday = () =>
    new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

export const pluralize = (count, word) => `${count} ${count === 1 ? word : `${word}s`}`;

export const cx = (...classNames) => classNames.filter(Boolean).join(" ");
