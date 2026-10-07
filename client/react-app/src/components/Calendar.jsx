import { useMemo, useState } from "react";
import { cx, fromDateKey, pluralize, toDateKey } from "../lib/tasks";
import IconButton from "./IconButton";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icon";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildWeeks(month) {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
    const weekCount = Math.ceil((first.getDay() + new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) / 7);

    return Array.from({ length: weekCount }, (_, week) =>
        Array.from({ length: 7 }, (_, day) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + week * 7 + day)),
    );
}

export default function Calendar({ todos, selected, onSelect }) {
    const [month, setMonth] = useState(() => {
        const date = fromDateKey(selected);
        return new Date(date.getFullYear(), date.getMonth(), 1);
    });
    const todayKey = toDateKey(new Date());

    // Per day: how many tasks are still open and how many are done.
    const byDay = useMemo(() => {
        const map = new Map();
        for (const task of todos) {
            if (!task.dueDate) continue;
            const entry = map.get(task.dueDate) ?? { open: 0, done: 0 };
            entry[task.status ? "done" : "open"] += 1;
            map.set(task.dueDate, entry);
        }
        return map;
    }, [todos]);

    const weeks = buildWeeks(month);
    const shiftMonth = (delta) => setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
    const goToToday = () => {
        const now = new Date();
        setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
        onSelect(toDateKey(now));
    };

    return (
        <div className="calendar">
            <div className="calendar__header">
                <h3 className="calendar__title" aria-live="polite">
                    {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <div className="calendar__nav">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={goToToday}>Today</button>
                    <IconButton label="Previous month" onClick={() => shiftMonth(-1)}>
                        <ChevronLeftIcon size={18} />
                    </IconButton>
                    <IconButton label="Next month" onClick={() => shiftMonth(1)}>
                        <ChevronRightIcon size={18} />
                    </IconButton>
                </div>
            </div>

            <div className="calendar__grid" role="grid" aria-label="Calendar">
                <div className="calendar__row" role="row">
                    {WEEKDAYS.map((day) => (
                        <span key={day} className="calendar__weekday" role="columnheader">{day}</span>
                    ))}
                </div>
                {weeks.map((week) => (
                    <div key={toDateKey(week[0])} className="calendar__row" role="row">
                        {week.map((date) => {
                            const key = toDateKey(date);
                            const entry = byDay.get(key);
                            const total = entry ? entry.open + entry.done : 0;
                            return (
                                <span key={key} role="gridcell" className="calendar__cell">
                                    <button
                                        type="button"
                                        className={cx(
                                            "calendar__day",
                                            date.getMonth() !== month.getMonth() && "is-outside",
                                            key === todayKey && "is-today",
                                            key === selected && "is-selected",
                                            entry?.open && "has-open",
                                            entry && !entry.open && "has-done",
                                            entry?.open && key < todayKey && "is-overdue",
                                        )}
                                        onClick={() => onSelect(key)}
                                        aria-pressed={key === selected}
                                        aria-label={`${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}${total ? `, ${pluralize(total, "task")}` : ""}`}
                                    >
                                        {date.getDate()}
                                        {total > 0 && <span className="calendar__dot" aria-hidden="true" />}
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
