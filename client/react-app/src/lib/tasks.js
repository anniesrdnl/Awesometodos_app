export const MIN_TITLE_LENGTH = 4;

export const VIEWS = [
    { id: "active", label: "To do", title: "To do", href: "#/", matches: (task) => !task.status },
    { id: "completed", label: "Completed", title: "Completed", href: "#/completed", matches: (task) => Boolean(task.status) },
    { id: "calendar", label: "Calendar", title: "Calendar", href: "#/calendar", matches: (task) => Boolean(task.dueDate) },
];

export const getViewFor = (task) => VIEWS.find((view) => view.matches(task));

export const byCreation = (a, b) => (a._id < b._id ? -1 : a._id > b._id ? 1 : 0);

export const SORT_OPTIONS = [
    { id: "newest", label: "Newest first", compare: (a, b) => byCreation(b, a) },
    { id: "oldest", label: "Oldest first", compare: byCreation },
    { id: "alphabetical", label: "A to Z", compare: (a, b) => a.todo.localeCompare(b.todo) },
];

export function validateTitle(value) {
    const title = value.trim();
    if (!title) return "Enter a task name.";
    if (title.length < MIN_TITLE_LENGTH) return `Use at least ${MIN_TITLE_LENGTH} characters.`;
    return null;
}

// MongoDB ObjectIds start with the creation time in seconds, as 8 hex characters.
export const getCreatedAt = (id) => new Date(parseInt(id.slice(0, 8), 16) * 1000);

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

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

// Due dates are local calendar days stored as "YYYY-MM-DD".
export function toDateKey(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

export function fromDateKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
}

export function formatDueDate(key, now = new Date()) {
    const daysAway = Math.round((fromDateKey(key) - startOfDay(now)) / DAY_MS);
    if (daysAway === 0) return "Today";
    if (daysAway === 1) return "Tomorrow";
    if (daysAway === -1) return "Yesterday";

    const date = fromDateKey(key);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
    });
}

export const isOverdue = (task, now = new Date()) =>
    Boolean(task.dueDate) && !task.status && task.dueDate < toDateKey(now);

export const formatToday =() =>
    new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

export const pluralize = (count, word, plural = `${word}s`) => `${count} ${count === 1 ? word : plural}`;

export const cx = (...classNames) => classNames.filter(Boolean).join(" ");
