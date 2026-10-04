import { useState } from "react";
import { cx } from "../lib/tasks";

export default function Checkbox({ checked, onChange, label }) {
    const [hasInteracted, setInteracted] = useState(false);

    return (
        <span className={cx("checkbox", hasInteracted && "is-interactive")}>
            <input
                type="checkbox"
                className="checkbox__input"
                checked={checked}
                onChange={(event) => {
                    setInteracted(true);
                    onChange(event);
                }}
                aria-label={label}
            />
            <span className="checkbox__box" aria-hidden="true">
                <svg className="checkbox__mark" viewBox="0 0 24 24">
                    <path d="M6 12.5 10 16.5 18 8" pathLength="1" />
                </svg>
            </span>
        </span>
    );
}
