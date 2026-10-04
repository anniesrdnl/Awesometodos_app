import { cx } from "../lib/tasks";
import { AlertIcon, CloseIcon } from "./Icon";

export default function Toaster({ toasts, onDismiss }) {
    return (
        <section className="toaster" aria-label="Notifications">
            <ol className="toaster__list" aria-live="polite">
                {toasts.map((toast) => (
                    <li key={toast.id} className={cx("toast", `toast--${toast.tone}`)}>
                        {toast.tone === "error" && <AlertIcon className="toast__icon" size={16} />}
                        <p className="toast__message">{toast.message}</p>
                        {toast.action && (
                            <button
                                type="button"
                                className="toast__action"
                                onClick={() => {
                                    toast.action.onClick();
                                    onDismiss(toast.id);
                                }}
                            >
                                {toast.action.label}
                            </button>
                        )}
                        <button
                            type="button"
                            className="toast__close"
                            aria-label="Dismiss notification"
                            onClick={() => onDismiss(toast.id)}
                        >
                            <CloseIcon size={14} />
                        </button>
                    </li>
                ))}
            </ol>
        </section>
    );
}
