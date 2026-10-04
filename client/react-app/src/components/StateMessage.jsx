import { cx } from "../lib/tasks";

export default function StateMessage({ icon, title, description, action, tone = "neutral" }) {
    return (
        <div className={cx("state", `state--${tone}`)} role={tone === "error" ? "alert" : undefined}>
            <div className="state__icon">{icon}</div>
            <h2 className="state__title">{title}</h2>
            {description && <p className="state__description">{description}</p>}
            {action && <div className="state__action">{action}</div>}
        </div>
    );
}
