import { daysSince, formatCreatedAt, getCreatedAt, pluralize } from "../lib/tasks";
import { ArrowRightIcon } from "./Icon";

const RING_RADIUS = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ percent }) {
    return (
        <div className="ring" style={{ "--ring-circumference": RING_CIRCUMFERENCE }}>
            <svg viewBox="0 0 64 64" aria-hidden="true">
                <circle className="ring__track" cx="32" cy="32" r={RING_RADIUS} />
                {percent > 0 && (
                    <circle
                        className="ring__value"
                        cx="32"
                        cy="32"
                        r={RING_RADIUS}
                        strokeDasharray={RING_CIRCUMFERENCE}
                        strokeDashoffset={RING_CIRCUMFERENCE * (1 - percent / 100)}
                    />
                )}
            </svg>
            <span className="ring__label">{percent}%</span>
        </div>
    );
}

function Stat({ label, value, href }) {
    const content = (
        <>
            <span className="stat__label">{label}</span>
            <span className="stat__value">{value}</span>
        </>
    );
    return (
        <li>
            {href ? <a className="stat stat--link" href={href}>{content}</a> : <div className="stat">{content}</div>}
        </li>
    );
}

function Shortcut({ label, shortcut, onActivate }) {
    const content = (
        <>
            <span>{label}</span>
            <kbd>{shortcut}</kbd>
        </>
    );
    return (
        <li>
            {onActivate ? (
                <button type="button" className="shortcut shortcut--action" onClick={onActivate}>{content}</button>
            ) : (
                <div className="shortcut">{content}</div>
            )}
        </li>
    );
}

export default function Overview({ todos, counts, isReady, onNewTask, onSearch, onLocateTask }) {
    const percentDone = counts.all === 0 ? 0 : Math.round((counts.completed / counts.all) * 100);
    const addedThisWeek = todos.filter((todo) => daysSince(getCreatedAt(todo._id)) < 7).length;
    const oldestOpen = todos.find((todo) => !todo.status);
    const oldestCreatedAt = oldestOpen && getCreatedAt(oldestOpen._id);
    const oldestAgeDays = oldestOpen && daysSince(oldestCreatedAt);

    return (
        <aside className="overview" aria-label="Overview">
            {isReady && counts.all > 0 && (
                <>
                    <section className="overview__section">
                        <h2 className="overview__heading">Progress</h2>
                        <div className="overview__progress">
                            <ProgressRing percent={percentDone} />
                            <div>
                                <p className="overview__figure">
                                    {counts.completed} of {counts.all}
                                </p>
                                <p className="overview__caption">tasks completed</p>
                            </div>
                        </div>
                        <ul className="overview__stats">
                            <Stat label="Active" value={counts.active} href="#/active" />
                            <Stat label="Done" value={counts.completed} href="#/completed" />
                            <Stat label="This week" value={addedThisWeek} />
                        </ul>
                    </section>

                    {oldestOpen && (
                        <section className="overview__section">
                            <h2 className="overview__heading">Waiting longest</h2>
                            <button type="button" className="spotlight" onClick={() => onLocateTask(oldestOpen)}>
                                <span className="spotlight__text">
                                    <span className="overview__task">{oldestOpen.todo}</span>
                                    <span className="overview__caption">
                                        Added {formatCreatedAt(oldestCreatedAt)}
                                        {oldestAgeDays > 1 && ` · ${pluralize(oldestAgeDays, "day")} ago`}
                                    </span>
                                </span>
                                <ArrowRightIcon className="spotlight__arrow" size={16} />
                                <span className="visually-hidden">Show this task</span>
                            </button>
                        </section>
                    )}
                </>
            )}

            <section className="overview__section">
                <h2 className="overview__heading">Shortcuts</h2>
                <ul className="shortcuts">
                    <Shortcut label="New task" shortcut="N" onActivate={onNewTask} />
                    <Shortcut label="Search" shortcut="/" onActivate={counts.all > 0 ? onSearch : undefined} />
                    <Shortcut label="Save edit" shortcut="Enter" />
                    <Shortcut label="Cancel or clear" shortcut="Esc" />
                </ul>
            </section>
        </aside>
    );
}
