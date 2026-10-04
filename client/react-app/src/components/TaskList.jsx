import TaskItem from "./TaskItem";

export default function TaskList({ tasks, highlight, departingIds, ...handlers }) {
    return (
        <div className="task-list">
            <div className="task-list__header" aria-hidden="true">
                <span>Task</span>
                <span>Added</span>
            </div>
            <ul className="task-list__items" aria-label="Tasks">
                {tasks.map((task) => (
                    <TaskItem
                        key={task._id}
                        task={task}
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
