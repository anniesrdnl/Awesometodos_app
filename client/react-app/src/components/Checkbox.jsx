import { useState } from "react";
import { cx } from "../lib/tasks";

const SPARK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export default function Checkbox({ checked, onChange, label }) {
    const [hasInteracted, setInteracted] = useState(false);
    const [burstCount, setBurstCount] = useState(0);

    return (
        <span className={cx("checkbox", hasInteracted && "is-interactive")}>
            <input
                type="checkbox"
                className="checkbox__input"
                checked={checked}
                onChange={(event) => {
                    setInteracted(true);
                    if (event.target.checked) setBurstCount((count) => count + 1);
                    onChange(event);
                }}
                aria-label={label}
            />
            <span className="checkbox__box" aria-hidden="true">
                <svg className="checkbox__mark" viewBox="0 0 24 24">
                    <path d="M6 12.5 10 16.5 18 8" pathLength="1" />
                </svg>
            </span>
            {checked && burstCount > 0 && (
                <span key={burstCount} className="checkbox__sparks" aria-hidden="true">
                    {SPARK_ANGLES.map((angle) => <i key={angle} style={{ "--angle": `${angle}deg` }} />)}
                </span>
            )}
        </span>
    );
}
