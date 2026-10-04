import { useEffect, useRef, useState } from "react";
import { cx, formatCreatedAt, getCreatedAt } from "../lib/tasks";
import Checkbox from "./Checkbox";
import IconButton from "./IconButton";
import { PencilIcon, TrashIcon } from "./Icon";
import TaskEditor from "./TaskEditor";

function focusNeighbourOf(row) {
    const neighbour = row.nextElementSibling ?? row.previousElementSibling;
    neighbour?.querySelector(".checkbox__input")?.focus();
}

export default function TaskItem({ task, highlight, isDeparting, onToggle, onRename, onDelete, onDeparted }) {
    const [isEditing, setEditing] = useState(false);
    const [isRemoving, setRemoving] = useState(false);
    const rowRef = useRef(null);
    const editButtonRef = useRef(null);
    const shouldRestoreFocus = useRef(false);
    const createdAt = getCreatedAt(task._id);
    const isCompleted = Boolean(task.status);

    useEffect(() => {
        if (highlight !== "located") return;
        rowRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
        rowRef.current.querySelector(".checkbox__input")?.focus({ preventScroll: true });
    }, [highlight]);

    useEffect(() => {
        if (!isEditing && shouldRestoreFocus.current) {
            shouldRestoreFocus.current = false;
            editButtonRef.current?.focus();
        }
    }, [isEditing]);

    const stopEditing = ({ restoreFocus }) => {
        shouldRestoreFocus.current = restoreFocus;
        setEditing(false);
    };

    const handleSave = (title, options) => {
        if (title !== task.todo) onRename(task, title);
        stopEditing(options);
    };

    const handleDelete = (event) => {
        focusNeighbourOf(event.currentTarget.closest(".task-row"));
        setRemoving(true);
    };

    const handleAnimationEnd = (event) => {
        if (event.target !== event.currentTarget || event.animationName !== "row-collapse") return;
        if (isRemoving) onDelete(task);
        else if (isDeparting) onDeparted(task._id);
    };

    return (
        <li
            ref={rowRef}
            className={cx(
                "task-row",
                isCompleted && "is-completed",
                isEditing && "is-editing",
                highlight && `is-${highlight}`,
                (isRemoving || isDeparting) && "is-leaving",
                isDeparting && !isRemoving && "is-departing",
            )}
            onAnimationEnd={handleAnimationEnd}
        >
            <div className="task-row__inner">
                <div className="task">
                    <Checkbox
                        checked={isCompleted}
                        onChange={() => onToggle(task)}
                        label={task.todo}
                    />

                    {isEditing ? (
                        <TaskEditor initialValue={task.todo} onSave={handleSave} onCancel={stopEditing} />
                    ) : (
                        <>
                            <div className="task__body" onDoubleClick={() => setEditing(true)}>
                                <span className="task__title">
                                    <span className="task__title-text">{task.todo}</span>
                                </span>
                                <time className="task__meta" dateTime={createdAt.toISOString()}>
                                    <span className="visually-hidden">Added </span>
                                    {formatCreatedAt(createdAt)}
                                </time>
                            </div>
                            <div className="task__actions">
                                <IconButton ref={editButtonRef} label="Edit task" onClick={() => setEditing(true)}>
                                    <PencilIcon size={16} />
                                </IconButton>
                                <IconButton label="Delete task" tone="danger" onClick={handleDelete}>
                                    <TrashIcon size={16} />
                                </IconButton>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </li>
    );
}
