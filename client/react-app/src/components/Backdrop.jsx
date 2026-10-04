const BUBBLES = [
    { size: "18px", x: "6%", duration: "24s", delay: "0s" },
    { size: "34px", x: "18%", duration: "31s", delay: "6s" },
    { size: "12px", x: "33%", duration: "20s", delay: "11s" },
    { size: "26px", x: "52%", duration: "28s", delay: "3s" },
    { size: "14px", x: "68%", duration: "22s", delay: "14s" },
    { size: "40px", x: "80%", duration: "34s", delay: "8s" },
    { size: "20px", x: "92%", duration: "26s", delay: "18s" },
];

export default function Backdrop() {
    return (
        <div className="backdrop" aria-hidden="true">
            <div className="backdrop__layer backdrop__layer--far">
                <span className="backdrop__glow backdrop__glow--secondary" />
                <span className="backdrop__glow backdrop__glow--tertiary" />
                {BUBBLES.map((bubble) => (
                    <span
                        key={bubble.x}
                        className="backdrop__bubble"
                        style={{
                            "--size": bubble.size,
                            "--x": bubble.x,
                            "--duration": bubble.duration,
                            "--delay": bubble.delay,
                        }}
                    />
                ))}
            </div>
            <div className="backdrop__layer backdrop__layer--near">
                <span className="backdrop__glow backdrop__glow--primary" />
            </div>
        </div>
    );
}
