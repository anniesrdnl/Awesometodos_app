import { useRef } from "react";
import { cx, formatDueDate, formatToday, isOverdue, pluralize, toDateKey } from "../lib/tasks";
import Checkbox from "./Checkbox";
import { AlertIcon, CalendarIcon, CheckCircleIcon, InboxIcon, ListIcon } from "./Icon";
import StateMessage from "./StateMessage";
import TaskComposer from "./TaskComposer";

const UP_NEXT_LIMIT = 5;

function getGreeting(now = new Date()) {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

// Dated tasks first, soonest (overdue) on top; undated tasks follow, oldest first.
function byUrgency(a, b) {
    if (a.dueDate && b.dueDate) return a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0;
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return a._id < b._id ? -1 : 1;
}

const noop = () => {};

export default function HomePage({ todos, status, reload, counts, highlight, onCreate, onToggle }) {
    const composerRef = useRef(null);
    const todayKey = toDateKey(new Date());
    const open = todos.filter((task) => !task.status);
    const dueToday = open.filter((task) => task.dueDate === todayKey).length;
    const overdue = open.filter((task) => isOverdue(task)).length;
    const upNext = [...open].sort(byUrgency).slice(0, UP_NEXT_LIMIT);

    const stats = [
        { href: "#/active", label: "Open tasks", value: counts.active, icon: ListIcon },
        { href: "#/calendar", label: "Due today", value: dueToday, icon: CalendarIcon },
        { href: "#/calendar", label: "Overdue", value: overdue, icon: AlertIcon, tone: overdue > 0 ? "danger" : undefined },
        { href: "#/completed", label: "Completed", value: counts.completed, icon: CheckCircleIcon },
    ];

    let summary = "Loading your day…";
    if (status === "ready") {
        summary = counts.active === 0
            ? "You have nothing open right now."
            : `You have ${pluralize(counts.active, "open task")}${dueToday ? `, ${dueToday} due today` : ""}.`;
    }

    let upNextContent;
    if (status === "error") {
        upNextContent = (
            <StateMessage
                tone="error"
                icon={<AlertIcon size={20} />}
                title="Couldn't load your tasks"
                description="Check your connection and try again."
                action={<button type="button" className="btn btn--secondary" onClick={reload}>Try again</button>}
            />
        );
    } else if (status === "ready" && upNext.length === 0) {
        upNextContent = (
            <StateMessage
                icon={<InboxIcon size={20} />}
                title={counts.all > 0 ? "You're all caught up" : "Start with one task"}
                description={counts.all > 0 ? "Nothing is waiting for you. Add what's next above." : "Type it in the field above and press Enter."}
            />
        );
    } else {
        upNextContent = (
            <ul className="up-next__list" aria-label="Up next">
                {upNext.map((task, index) => (
                    <li
                        key={task._id}
                        style={{ "--order": index }}
                        className={cx("up-next__item", highlight?.id === task._id && `is-${highlight.kind}`)}
                    >
                        <Checkbox checked={Boolean(task.status)} onChange={() => onToggle(task)} label={task.todo} />
                        <span className="up-next__title">{task.todo}</span>
                        {task.dueDate && (
                            <time className={cx("task__due", isOverdue(task) && "is-overdue")} dateTime={task.dueDate}>
                                <span className="visually-hidden">Due </span>
                                {formatDueDate(task.dueDate)}
                            </time>
                        )}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <div className="home">
            <section className="hero" aria-labelledby="home-title">
                <p className="hero__date">{formatToday()}</p>
                <h1 id="home-title" className="hero__title">
                    {getGreeting()}, <span className="hero__accent">let's get things done.</span>
                </h1>
                <p className="hero__summary">{summary}</p>
                <TaskComposer onCreate={onCreate} inputRef={composerRef} focusRequest={0} onFocusHandled={noop} />
            </section>

            <ul className="stats" aria-label="Overview">
                {stats.map(({ href, label, value, icon, tone }, index) => {
                    const StatIcon = icon;
                    return (
                        <li key={label} style={{ "--order": index }}>
                            <a href={href} className={cx("stat", tone && `stat--${tone}`)}>
                                <StatIcon className="stat__icon" size={18} />
                                <span className="stat__value">{status === "ready" ? value : "–"}</span>
                                <span className="stat__label">{label}</span>
                            </a>
                        </li>
                    );
                })}
            </ul>

            <section className="board up-next" aria-labelledby="up-next-title">
                <div className="board__toolbar">
                    <h2 id="up-next-title" className="up-next__heading">Up next</h2>
                    <a className="btn btn--ghost btn--sm" href="#/active">View all</a>
                </div>
                {upNextContent}
            </section>
        </div>
    );
}
