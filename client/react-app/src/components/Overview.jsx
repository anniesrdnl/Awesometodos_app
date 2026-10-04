import { daysSince, formatCreatedAt, getCreatedAt, pluralize } from "../lib/tasks";

const RING_RADIUS = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const SHORTCUTS = [
    { label: "New task", key: "N" },
    { label: "Search", key: "/" },
    { label: "Save edit", key: "Enter" },
    { label: "Cancel or clear", key: "Esc" },
];

function ProgressRing({ percent }) {
    return (
        <div className="ring">
            <svg viewBox="0 0 64 64" aria-hidden="true">
                <circle className="ring__track" cx="32" cy="32" r={RING_RADIUS} />
                {percent > 0 && <circle
                    className="ring__value"
                    cx="32"
                    cy="32"
                    r={RING_RADIUS}
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={RING_CIRCUMFERENCE * (1 - percent / 100)}
                />}
            </svg>
            <span className="ring__label">{percent}%</span>
        </div>
    );
}

export default function Overview({ todos, counts, isReady }) {
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
                        <dl className="overview__stats">
                            <div>
                                <dt>Active</dt>
                                <dd>{counts.active}</dd>
                            </div>
                            <div>
                                <dt>Done</dt>
                                <dd>{counts.completed}</dd>
                            </div>
                            <div>
                                <dt>This week</dt>
                                <dd>{addedThisWeek}</dd>
                            </div>
                        </dl>
                    </section>

                    {oldestOpen && (
                        <section className="overview__section">
                            <h2 className="overview__heading">Waiting longest</h2>
                            <p className="overview__task">{oldestOpen.todo}</p>
                            <p className="overview__caption">
                                Added {formatCreatedAt(oldestCreatedAt)}
                                {oldestAgeDays > 1 && ` · ${pluralize(oldestAgeDays, "day")} ago`}
                            </p>
                        </section>
                    )}
                </>
            )}

            <section className="overview__section">
                <h2 className="overview__heading">Shortcuts</h2>
                <ul className="shortcuts">
                    {SHORTCUTS.map(({ label, key }) => (
                        <li key={label}>
                            <span>{label}</span>
                            <kbd>{key}</kbd>
                        </li>
                    ))}
                </ul>
            </section>
        </aside>
    );
}
