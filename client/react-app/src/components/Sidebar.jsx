import { useId } from "react";
import { VIEWS } from "../lib/tasks";
import { CalendarIcon, CheckCircleIcon, HomeIcon, ListIcon } from "./Icon";

const VIEW_ICONS = { home: HomeIcon, active: ListIcon, completed: CheckCircleIcon, calendar: CalendarIcon };

function Progress({ completed, total }) {
    const id = useId();
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="progress">
            <div className="progress__header">
                <span id={id} className="progress__label">Progress</span>
                <span className="progress__value">{percent}%</span>
            </div>
            <div
                className="progress__track"
                role="progressbar"
                aria-labelledby={id}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                aria-valuetext={`${completed} of ${total} tasks completed`}
            >
                <span className="progress__fill" style={{ "--value": `${percent}%` }} />
            </div>
            <p className="progress__caption">{completed} of {total} completed</p>
        </div>
    );
}

export default function Sidebar({ currentView, counts, isReady }) {
    return (
        <aside className="sidebar">
            <a className="brand" href="#/" aria-label="Awesome Todos home">
                <img className="brand__logo" src="/logo.png" alt="Awesome Todos" width="900" height="114" />
            </a>

            <nav className="view-nav" aria-label="Task views">
                <ul className="view-nav__list">
                    {VIEWS.map((view) => {
                        const ViewIcon = VIEW_ICONS[view.id];
                        return (
                            <li key={view.id}>
                                <a
                                    href={view.href}
                                    className="view-nav__link"
                                    aria-current={view.id === currentView.id ? "page" : undefined}
                                >
                                    <ViewIcon className="view-nav__icon" size={18} />
                                    <span className="view-nav__label">{view.label}</span>
                                    {isReady && counts[view.id] !== undefined && (
                                        <span key={counts[view.id]} className="view-nav__count">
                                            {counts[view.id]}
                                        </span>
                                    )}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="sidebar__footer">
                {isReady && counts.all > 0 && <Progress completed={counts.completed} total={counts.all} />}
                <p className="sidebar__hint">
                    <kbd>N</kbd> New task <span aria-hidden="true">·</span> <kbd>/</kbd> Search
                </p>
            </div>
        </aside>
    );
}
