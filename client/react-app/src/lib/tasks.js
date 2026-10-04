export const MIN_TITLE_LENGTH = 4;

export const VIEWS = [
    { id: "active", label: "To do", title: "To do", href: "#/", matches: (task) => !task.status },
    { id: "completed", label: "Completed", title: "Completed", href: "#/completed", matches: (task) => Boolean(task.status) },
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

// Number of tasks created on each of the last few days, oldest first.
export function getRecentActivity(todos, days = 7) {
    const today = startOfDay(new Date());
    return Array.from({ length: days }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (days - 1 - index));
        const count = todos.filter((todo) => startOfDay(getCreatedAt(todo._id)).getTime() === date.getTime()).length;
        return { date, count };
    });
}

export const formatShortDate = (date) => date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

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
