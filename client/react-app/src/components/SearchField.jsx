import { cx } from "../lib/tasks";
import { CloseIcon, SearchIcon } from "./Icon";

export default function SearchField({ value, onChange, inputRef }) {
    const handleKeyDown = (event) => {
        if (event.key === "Escape" && value) {
            event.preventDefault();
            onChange("");
        }
    };

    return (
        <div className={cx("search", value && "is-filled")} role="search">
            <label htmlFor="task-search" className="visually-hidden">Search tasks</label>
            <SearchIcon className="search__icon" size={16} />
            <input
                ref={inputRef}
                id="task-search"
                type="search"
                className="search__input"
                placeholder="Search tasks"
                autoComplete="off"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={handleKeyDown}
            />
            {value && (
                <button type="button" className="search__clear" aria-label="Clear search" onClick={() => onChange("")}>
                    <CloseIcon size={14} />
                </button>
            )}
        </div>
    );
}
