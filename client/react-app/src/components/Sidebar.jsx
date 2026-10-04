import { VIEWS } from "../lib/tasks";
import { CheckCircleIcon, CheckIcon, ListIcon } from "./Icon";

const VIEW_ICONS = { active: ListIcon, completed: CheckCircleIcon };

export default function Sidebar({ currentView, counts }) {
    return (
        <aside className="sidebar">
            <div className="brand">
                <span className="brand__mark" aria-hidden="true">
                    <CheckIcon size={16} strokeWidth="2.5" />
                </span>
                <span className="brand__name">Awesome Todos</span>
            </div>

            <nav className="view-nav" aria-label="Task views">
                <p className="view-nav__heading">Workspace</p>
                <ul
                    className="view-nav__list"
                    style={{
                        "--active-index": VIEWS.findIndex((view) => view.id === currentView.id),
                        "--view-count": VIEWS.length,
                    }}
                >
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

        </aside>
    );
}
