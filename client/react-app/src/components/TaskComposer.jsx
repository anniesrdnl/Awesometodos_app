import { useEffect, useState } from "react";
import { cx, validateTitle } from "../lib/tasks";
import { AlertIcon, CheckIcon, PlusIcon } from "./Icon";

const SUCCESS_MESSAGE_MS = 2000;

export default function TaskComposer({ onCreate, inputRef, focusRequest, onFocusHandled }) {
    const [value, setValue] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setSubmitting] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    useEffect(() => {
        if (!focusRequest) return;
        inputRef.current?.focus();
        onFocusHandled();
    }, [focusRequest, inputRef, onFocusHandled]);

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
            await onCreate(value.trim(), dueDate || null);
            setValue("");
            setDueDate("");
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
                    placeholder="Add a task"
                    autoComplete="off"
                    enterKeyHint="done"
                    value={value}
                    onChange={handleChange}
                    readOnly={isSubmitting}
                    aria-invalid={Boolean(error)}
                    aria-describedby="new-task-message"
                />
                <label htmlFor="new-task-due" className="visually-hidden">Due date</label>
                <input
                    id="new-task-due"
                    type="date"
                    className="date-input"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    readOnly={isSubmitting}
                />
                <button
                    type="submit"
                    className="btn btn--primary composer__submit"
                    disabled={!value.trim() || isSubmitting}
                >
                    {isSubmitting && <span className="spinner" aria-hidden="true" />}
                    {isSubmitting ? "Adding" : "Add"}
                </button>
            </div>
            <p id="new-task-message" className={cx("field-message", error && "is-error")} aria-live="polite">
                {error && <><AlertIcon size={14} /> {error}</>}
                {!error && justAdded && <><CheckIcon size={14} /> Task added</>}
            </p>
        </form>
    );
}
