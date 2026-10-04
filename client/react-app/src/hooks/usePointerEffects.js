import { useEffect } from "react";

function trackSpotlight(event) {
    const surface = event.target.closest?.("[data-spotlight]");
    if (!surface) return;
    const rect = surface.getBoundingClientRect();
    surface.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    surface.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
}

function addRipple(event) {
    const button = event.target.closest?.(".btn:not(:disabled)");
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    ripple.addEventListener("animationend", () => ripple.remove());
    button.append(ripple);
}

// Pointer-driven polish: card spotlights, background parallax and button ripples.
export function usePointerEffects() {
    useEffect(() => {
        const root = document.documentElement;
        let frame = 0;

        const handlePointerMove = (event) => {
            trackSpotlight(event);
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = 0;
                root.style.setProperty("--pointer-x", (event.clientX / window.innerWidth).toFixed(3));
                root.style.setProperty("--pointer-y", (event.clientY / window.innerHeight).toFixed(3));
            });
        };

        document.addEventListener("pointermove", handlePointerMove, { passive: true });
        document.addEventListener("pointerdown", addRipple);
        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerdown", addRipple);
        };
    }, []);
}
