import { useEffect, useState } from "react";
import { cx, validateTitle } from "../lib/tasks";
import { CheckIcon, PlusIcon } from "./Icon";

const SUCCESS_MESSAGE_MS = 2000;

export default function TaskComposer({ onCreate, inputRef }) {
    const [value, setValue] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setSubmitting] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    useEffect(() => {
        if (!justAdded) return;
        const timer = setTimeout(() => setJustAdded(false), SUCCESS_MESSAGE_MS);
        return () => clearTimeout(timer);
    }, [justAdded]);

    const handleChange = (event) => {
        setValue(event.target.value);
        setError(null);
        setJustAdded(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        const problem = validateTitle(value);
        if (problem) {
            setError(problem);
            return;
        }

        setSubmitting(true);
        try {
            await onCreate(value.trim());
            setValue("");
            setJustAdded(true);
        } catch {
            setError("Couldn't add the task. Please try again.");
        } finally {
            setSubmitting(false);
            inputRef.current?.focus();
        }
    };

    return (
        <form className="composer" onSubmit={handleSubmit} noValidate>
            <label htmlFor="new-task" className="visually-hidden">New task</label>
            <div className={cx("composer__field", error && "is-invalid")}>
                <PlusIcon className="composer__icon" />
                <input
                    ref={inputRef}
                    id="new-task"
                    type="text"
                    className="composer__input"
                    placeholder="Add a task…"
                    autoComplete="off"
                    enterKeyHint="done"
                    value={value}
                    onChange={handleChange}
                    readOnly={isSubmitting}
                    aria-invalid={Boolean(error)}
                    aria-describedby="new-task-message"
                />
                <button
                    type="submit"
                    className="btn btn--primary composer__submit"
                    disabled={!value.trim() || isSubmitting}
                >
                    {isSubmitting && <span className="spinner" aria-hidden="true" />}
                    {isSubmitting ? "Adding" : "Add task"}
                </button>
            </div>
            <p id="new-task-message" className={cx("field-message", error && "is-error")} aria-live="polite">
                {error ?? (justAdded && (
                    <span className="field-message__success">
                        <CheckIcon size={14} /> Task added
                    </span>
                ))}
            </p>
        </form>
    );
}
