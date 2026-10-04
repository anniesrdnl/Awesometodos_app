export default function Backdrop() {
    return (
        <div className="backdrop" aria-hidden="true">
            <div className="backdrop__layer backdrop__layer--far">
                <span className="backdrop__glow backdrop__glow--secondary" />
            </div>
            <div className="backdrop__layer backdrop__layer--near">
                <span className="backdrop__glow backdrop__glow--primary" />
            </div>
        </div>
    );
}
