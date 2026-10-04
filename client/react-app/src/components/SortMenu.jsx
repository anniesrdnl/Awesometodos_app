import { useEffect, useId, useRef, useState } from "react";
import { cx, SORT_OPTIONS } from "../lib/tasks";
import { CheckIcon, ChevronDownIcon, SortIcon } from "./Icon";

export default function SortMenu({ value, onChange }) {
    const [isOpen, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const rootRef = useRef(null);
    const buttonRef = useRef(null);
    const listRef = useRef(null);
    const id = useId();
    const selected = SORT_OPTIONS.find((option) => option.id === value) ?? SORT_OPTIONS[0];

    useEffect(() => {
        if (!isOpen) return;
        listRef.current?.focus();
        const closeOnOutsideClick = (event) => {
            if (!rootRef.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener("pointerdown", closeOnOutsideClick);
        return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
    }, [isOpen]);

    const open = () => {
        setActiveIndex(SORT_OPTIONS.findIndex((option) => option.id === selected.id));
        setOpen(true);
    };

    const close = () => {
        setOpen(false);
        buttonRef.current?.focus();
    };

    const choose = (option) => {
        onChange(option.id);
        close();
    };

    const handleListKeyDown = (event) => {
        const last = SORT_OPTIONS.length - 1;
        if (event.key === "ArrowDown") setActiveIndex((index) => (index === last ? 0 : index + 1));
        else if (event.key === "ArrowUp") setActiveIndex((index) => (index === 0 ? last : index - 1));
        else if (event.key === "Home") setActiveIndex(0);
        else if (event.key === "End") setActiveIndex(last);
        else if (event.key === "Enter" || event.key === " ") choose(SORT_OPTIONS[activeIndex]);
        else if (event.key === "Escape") close();
        else if (event.key === "Tab") setOpen(false);
        else return;
        if (event.key !== "Tab") event.preventDefault();
    };

    return (
        <div className="sort" ref={rootRef}>
            <button
                ref={buttonRef}
                type="button"
                className="sort__button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={isOpen ? `${id}-list` : undefined}
                onClick={() => (isOpen ? setOpen(false) : open())}
                onKeyDown={(event) => {
                    if (event.key === "ArrowDown" && !isOpen) {
                        event.preventDefault();
                        open();
                    }
                }}
            >
                <SortIcon size={15} />
                <span className="visually-hidden">Sort: </span>
                {selected.label}
                <ChevronDownIcon className="sort__chevron" size={14} />
            </button>

            {isOpen && (
                <ul
                    ref={listRef}
                    id={`${id}-list`}
                    className="sort__menu"
                    role="listbox"
                    tabIndex={-1}
                    aria-label="Sort tasks"
                    aria-activedescendant={`${id}-${SORT_OPTIONS[activeIndex].id}`}
                    onKeyDown={handleListKeyDown}
                >
                    {SORT_OPTIONS.map((option, index) => (
                        <li
                            key={option.id}
                            id={`${id}-${option.id}`}
                            role="option"
                            aria-selected={option.id === selected.id}
                            className={cx("sort__option", index === activeIndex && "is-active")}
                            onPointerMove={() => setActiveIndex(index)}
                            onClick={() => choose(option)}
                        >
                            {option.label}
                            {option.id === selected.id && <CheckIcon size={14} />}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
