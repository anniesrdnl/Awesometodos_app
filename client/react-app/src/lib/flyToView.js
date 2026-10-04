const CHECK_PATH = "M6 12.5 10 16.5 18 8";
const RESTORE_PATH = "M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3";

function bump(target) {
    target.classList.remove("is-receiving");
    void target.offsetWidth;
    target.classList.add("is-receiving");
    target.addEventListener("animationend", () => target.classList.remove("is-receiving"), { once: true });
}

function createGhost(label, isCompleting) {
    const ghost = document.createElement("div");
    ghost.className = "fly-ghost";
    ghost.setAttribute("aria-hidden", "true");

    const icon = document.createElement("span");
    icon.className = "fly-ghost__icon";
    icon.innerHTML =
        `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" ` +
        `stroke-linecap="round" stroke-linejoin="round"><path d="${isCompleting ? CHECK_PATH : RESTORE_PATH}"/></svg>`;

    const text = document.createElement("span");
    text.className = "fly-ghost__label";
    text.textContent = label;

    ghost.append(icon, text);
    return ghost;
}

// Sends a small pill from the task to the navigation link of the view it moved to.
export function flyToView({ source, href, label, isCompleting }) {
    const target = document.querySelector(`.view-nav__link[href="${href}"]`);
    if (!target) return;
    if (!source || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        bump(target);
        return;
    }

    const from = source.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const ghost = createGhost(label, isCompleting);
    ghost.style.left = `${from.left}px`;
    ghost.style.top = `${from.top + from.height / 2}px`;
    document.body.append(ghost);

    const start = ghost.getBoundingClientRect();
    const dx = to.left + to.width / 2 - (start.left + start.width / 2);
    const dy = to.top + to.height / 2 - (start.top + start.height / 2);

    const flight = ghost.animate(
        [
            { transform: "translate(0, -50%) scale(0.6)", opacity: 0 },
            { transform: "translate(0, -50%) scale(1)", opacity: 1, offset: 0.15 },
            { transform: `translate(${dx * 0.45}px, calc(-50% + ${dy * 0.45 - 70}px)) scale(0.9)`, opacity: 1, offset: 0.55 },
            { transform: `translate(${dx}px, calc(-50% + ${dy}px)) scale(0.25)`, opacity: 0.1 },
        ],
        { duration: 900, easing: "cubic-bezier(0.45, 0, 0.25, 1)" },
    );
    flight.onfinish = () => {
        ghost.remove();
        bump(target);
    };
}
