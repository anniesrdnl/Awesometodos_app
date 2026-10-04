import { useEffect, useRef, useState } from "react";

const DURATION_MS = 700;

export default function AnimatedNumber({ value }) {
    const [display, setDisplay] = useState(0);
    const displayRef = useRef(0);

    useEffect(() => {
        const from = displayRef.current;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const start = performance.now();
        let frame;

        const tick = (now) => {
            const progress = reduceMotion ? 1 : Math.min(1, (now - start) / DURATION_MS);
            const eased = 1 - (1 - progress) ** 3;
            displayRef.current = Math.round(from + (value - from) * eased);
            setDisplay(displayRef.current);
            if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [value]);

    return display;
}
