import TaskItem from "./TaskItem";

const MAX_STAGGER = 12;

function focusRow(row) {
    row?.querySelector(".checkbox__input")?.focus();
}

// Arrow keys move between tasks; E edits and Delete removes the focused task.
function handleListKeyDown(event) {
    const row = event.target.closest(".task-row");
    if (!row || event.target.closest(".task-editor")) return;

    const rows = [...event.currentTarget.querySelectorAll(":scope > .task-row:not(.is-leaving)")];
    const index = rows.indexOf(row);

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        focusRow(rows[index + (event.key === "ArrowDown" ? 1 : -1)]);
    } else if (event.key.toLowerCase() === "e" && event.target.matches(".checkbox__input")) {
        event.preventDefault();
        row.querySelector(".task__edit")?.click();
    } else if (event.key === "Delete") {
        event.preventDefault();
        row.querySelector(".task__delete")?.click();
    }
}

export default function TaskList({ tasks, highlight, departingIds, ...handlers }) {
    return (
        <div className="task-list" data-spotlight>
            <div className="task-list__header" aria-hidden="true">
                <span>Task</span>
                <span>Added</span>
            </div>
            <ul className="task-list__items" aria-label="Tasks" onKeyDown={handleListKeyDown}>
                {tasks.map((task, index) => (
                    <TaskItem
                        key={task._id}
                        task={task}
                        order={Math.min(index, MAX_STAGGER)}
                        highlight={highlight?.id === task._id ? highlight.kind : null}
                        isDeparting={departingIds.has(task._id)}
                        {...handlers}
                    />
                ))}
            </ul>
        </div>
    );
}

const SKELETON_WIDTHS = ["72%", "48%", "64%", "36%"];

export function TaskListSkeleton() {
    return (
        <div className="task-list task-list--skeleton" aria-busy="true">
            <span className="visually-hidden" role="status">Loading tasks…</span>
            {SKELETON_WIDTHS.map((width) => (
                <div className="skeleton-row" key={width} aria-hidden="true">
                    <span className="skeleton skeleton--circle" />
                    <span className="skeleton skeleton--line" style={{ width }} />
                </div>
            ))}
        </div>
    );
}
