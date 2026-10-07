import { useRef } from "react";
import { formatDueDate, fromDateKey, pluralize } from "../lib/tasks";
import Calendar from "./Calendar";
import { AlertIcon, InboxIcon } from "./Icon";
import StateMessage from "./StateMessage";
import TaskComposer from "./TaskComposer";
import TaskList, { TaskListSkeleton } from "./TaskList";

const NO_IDS = new Set();

export default function CalendarPage({ todos, status, reload, selectedDate, onSelectDate, highlight, onCreate, ...handlers }) {
    const composerRef = useRef(null);
    const dayTasks = todos.filter((task) => task.dueDate === selectedDate);
    const dayLabel = fromDateKey(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    let content;
    if (status === "loading") {
        content = <TaskListSkeleton />;
    } else if (status === "error") {
        content = (
            <StateMessage
                tone="error"
                icon={<AlertIcon size={20} />}
                title="Couldn't load your tasks"
                description="Check your connection and try again."
                action={<button type="button" className="btn btn--secondary" onClick={reload}>Try again</button>}
            />
        );
    } else if (dayTasks.length > 0) {
        content = <TaskList tasks={dayTasks} highlight={highlight} departingIds={NO_IDS} {...handlers} />;
    } else {
        content = (
            <StateMessage
                icon={<InboxIcon size={20} />}
                title="Nothing due"
                description="No tasks on this day. Add one above."
            />
        );
    }

    return (
        <div className="calendar-page">
            <Calendar todos={todos} selected={selectedDate} onSelect={onSelectDate} />

            <section className="board calendar-page__day" aria-labelledby="day-title">
                <h2 id="day-title" className="calendar-page__day-title">{dayLabel}</h2>
                <p className="board__summary">
                    {pluralize(dayTasks.length, "task")} due · {formatDueDate(selectedDate)}
                </p>
                <TaskComposer
                    key={selectedDate}
                    onCreate={onCreate}
                    inputRef={composerRef}
                    focusRequest={0}
                    onFocusHandled={() => {}}
                    presetDueDate={selectedDate}
                />
                <div className="tasks">{content}</div>
            </section>
        </div>
    );
}
