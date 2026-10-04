const COLORS = ["#3b5bdb", "#748ffc", "#9775fa", "#f59f00", "#20c997", "#f06595"];
const PARTICLE_COUNT = 140;
const DURATION_MS = 2200;
const GRAVITY = 0.28;
const DRAG = 0.985;

export function launchConfetti(origin) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const ratio = window.devicePixelRatio || 1;
    const canvas = document.createElement("canvas");
    canvas.className = "confetti";
    canvas.setAttribute("aria-hidden", "true");
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    document.body.append(canvas);

    const context = canvas.getContext("2d");
    context.scale(ratio, ratio);

    const x = origin?.x ?? width / 2;
    const y = origin?.y ?? height / 3;
    const particles = Array.from({ length: PARTICLE_COUNT }, (_, index) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 9;
        return {
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 7,
            size: 5 + Math.random() * 5,
            rotation: Math.random() * Math.PI,
            spin: (Math.random() - 0.5) * 0.3,
            color: COLORS[index % COLORS.length],
            isRound: index % 3 === 0,
        };
    });

    const start = performance.now();
    const draw = (now) => {
        const elapsed = now - start;
        context.clearRect(0, 0, width, height);
        context.globalAlpha = Math.max(0, 1 - elapsed / DURATION_MS);

        for (const particle of particles) {
            particle.vx *= DRAG;
            particle.vy = particle.vy * DRAG + GRAVITY;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.spin;

            context.save();
            context.translate(particle.x, particle.y);
            context.rotate(particle.rotation);
            context.fillStyle = particle.color;
            if (particle.isRound) {
                context.beginPath();
                context.arc(0, 0, particle.size / 2.5, 0, Math.PI * 2);
                context.fill();
            } else {
                context.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
            }
            context.restore();
        }

        if (elapsed < DURATION_MS) requestAnimationFrame(draw);
        else canvas.remove();
    };
    requestAnimationFrame(draw);
}
