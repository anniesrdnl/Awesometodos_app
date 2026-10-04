import { cx, formatShortDate, getRecentActivity, pluralize } from "../lib/tasks";
import AnimatedNumber from "./AnimatedNumber";
import { ArrowRightIcon, CalendarIcon, CheckCircleIcon, ListIcon, TrendIcon } from "./Icon";

function StatCard({ href, icon, label, value, suffix, hint, children }) {
    const Element = href ? "a" : "div";
    return (
        <Element className={cx("stat-card", href && "stat-card--link")} href={href} data-spotlight>
            <div className="stat-card__top">
                <span className="stat-card__label">{label}</span>
                <span className="stat-card__icon" aria-hidden="true">{icon}</span>
            </div>
            <p className="stat-card__value">
                <AnimatedNumber value={value} />
                {suffix}
            </p>
            {children}
            <p className="stat-card__hint">
                {hint}
                {href && <ArrowRightIcon className="stat-card__arrow" size={14} />}
            </p>
        </Element>
    );
}

function ActivityBars({ days }) {
    const peak = Math.max(1, ...days.map((day) => day.count));
    return (
        <ul className="activity" aria-label="Tasks added per day">
            {days.map((day, index) => {
                const description = `${formatShortDate(day.date)}: ${pluralize(day.count, "task")}`;
                return (
                    <li key={day.date.toISOString()} className="activity__day" data-tooltip={description}>
                        <span
                            className={cx("activity__bar", day.count === 0 && "is-empty")}
                            style={{ "--height": `${(day.count / peak) * 100}%`, "--order": index }}
                        />
                        <span className="visually-hidden">{description}</span>
                    </li>
                );
            })}
        </ul>
    );
}

export default function StatsBar({ todos, counts }) {
    const percentDone = counts.all === 0 ? 0 : Math.round((counts.completed / counts.all) * 100);
    const activity = getRecentActivity(todos);
    const addedThisWeek = activity.reduce((total, day) => total + day.count, 0);

    return (
        <section className="stats" aria-label="Summary">
            <StatCard
                href="#/"
                icon={<ListIcon size={16} />}
                label="Open tasks"
                value={counts.active}
                hint={counts.active > 0 ? "View your list" : "Nothing pending"}
            />
            <StatCard
                href="#/completed"
                icon={<CheckCircleIcon size={16} />}
                label="Completed"
                value={counts.completed}
                hint="Review finished work"
            />
            <StatCard
                icon={<TrendIcon size={16} />}
                label="Completion rate"
                value={percentDone}
                suffix="%"
                hint={`${counts.completed} of ${counts.all} tasks done`}
            >
                <div className="meter" aria-hidden="true">
                    <span className="meter__fill" style={{ "--value": `${percentDone}%` }} />
                </div>
            </StatCard>
            <StatCard
                icon={<CalendarIcon size={16} />}
                label="Added this week"
                value={addedThisWeek}
                hint="Last 7 days"
            >
                <ActivityBars days={activity} />
            </StatCard>
        </section>
    );
}
