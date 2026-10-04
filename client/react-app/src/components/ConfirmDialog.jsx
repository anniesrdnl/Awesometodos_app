import { useEffect, useId, useRef } from "react";

export default function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel }) {
    const dialogRef = useRef(null);
    const id = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className="dialog"
            aria-labelledby={`${id}-title`}
            aria-describedby={`${id}-description`}
            onCancel={(event) => {
                event.preventDefault();
                onCancel();
            }}
            onClick={(event) => {
                if (event.target === dialogRef.current) onCancel();
            }}
        >
            <div className="dialog__content">
                <h2 id={`${id}-title`} className="dialog__title">{title}</h2>
                <p id={`${id}-description`} className="dialog__description">{description}</p>
            </div>
            <div className="dialog__actions">
                <button type="button" className="btn btn--secondary" onClick={onCancel} autoFocus>
                    Cancel
                </button>
                <button type="button" className="btn btn--danger" onClick={onConfirm}>
                    {confirmLabel}
                </button>
            </div>
        </dialog>
    );
}
