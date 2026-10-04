import { cx } from "../lib/tasks";

export default function IconButton({ label, tone, className, ...props }) {
    return (
        <button
            type="button"
            className={cx("icon-btn", tone && `icon-btn--${tone}`, className)}
            aria-label={label}
            data-tooltip={label}
            {...props}
        />
    );
}
