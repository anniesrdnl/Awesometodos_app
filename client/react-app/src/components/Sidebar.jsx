import { VIEWS } from "../lib/tasks";
import { CheckCircleIcon, CheckIcon, CircleIcon, ListIcon } from "./Icon";

const VIEW_ICONS = { all: ListIcon, active: CircleIcon, completed: CheckCircleIcon };

export default function Sidebar({ currentView, counts }) {
    const percentDone = counts.all === 0 ? 0 : Math.round((counts.completed / counts.all) * 100);

    return (
        <aside className="sidebar">
            <div className="brand">
                <span className="brand__mark" aria-hidden="true">
                    <CheckIcon size={16} strokeWidth="2.5" />
                </span>
                <span className="brand__name">Awesome Todos</span>
            </div>

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
                                    <ViewIcon className="view-nav__icon" />
                                    <span className="view-nav__label">{view.label}</span>
                                    <span className="view-nav__count">{counts[view.id]}</span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {counts.all > 0 && (
                <div className="progress">
                    <div className="progress__header">
                        <span>Progress</span>
                        <span className="progress__value">{percentDone}%</span>
                    </div>
                    <div className="progress__track" aria-hidden="true">
                        <div className="progress__bar" style={{ width: `${percentDone}%` }} />
                    </div>
                    <p className="progress__caption">
                        {counts.completed} of {counts.all} tasks done
                    </p>
                </div>
            )}
        </aside>
    );
}
