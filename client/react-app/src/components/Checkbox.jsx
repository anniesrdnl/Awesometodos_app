export default function Checkbox({ checked, onChange, label }) {
    return (
        <span className="checkbox">
            <input
                type="checkbox"
                className="checkbox__input"
                checked={checked}
                onChange={onChange}
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
