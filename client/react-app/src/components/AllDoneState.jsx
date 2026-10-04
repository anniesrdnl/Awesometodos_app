import { pluralize } from "../lib/tasks";
import { TrophyIcon } from "./Icon";

export default function AllDoneState({ completedCount, onCelebrate }) {
    return (
        <div className="celebration">
            <span className="celebration__icon" aria-hidden="true">
                <TrophyIcon size={28} />
            </span>
            <h2 className="celebration__title">All done. Nice work!</h2>
            <p className="celebration__description">
                You've completed {pluralize(completedCount, "task")}. Take a breather or add what's next.
            </p>
            <div className="celebration__actions">
                <a className="btn btn--secondary" href="#/completed">View completed</a>
                <button type="button" className="btn btn--primary" onClick={onCelebrate}>Celebrate</button>
            </div>
        </div>
    );
}
