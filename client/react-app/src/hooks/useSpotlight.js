import { useEffect } from "react";

// Tracks the pointer over [data-spotlight] surfaces so CSS can draw a glow that follows it.
export function useSpotlight() {
    useEffect(() => {
        const handlePointerMove = (event) => {
            const surface = event.target.closest?.("[data-spotlight]");
            if (!surface) return;
            const rect = surface.getBoundingClientRect();
            surface.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
            surface.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
        };
        document.addEventListener("pointermove", handlePointerMove, { passive: true });
        return () => document.removeEventListener("pointermove", handlePointerMove);
    }, []);
}
