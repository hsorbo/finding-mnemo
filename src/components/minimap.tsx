import { Shot, Survey } from "mnemo-dmp";
import "./minimap.css";
class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

function toPoint(degrees: number, length: number) {
    const x = length * Math.cos(Math.PI * (degrees - 90.0) / 180.0)
    const y = length * Math.sin(Math.PI * (degrees - 90.0) / 180.0)
    return new Point(x, y);
}

function toPoints(shots: Shot[]) {
    let at = new Point(0, 0);
    let points = [at];
    shots.forEach(x => {
        const k = toPoint(x.head_in, x.length);
        at = new Point(k.x + at.x, k.y + at.y);
        points.push(at)
    });
    return points;
}


export const MiniMap = ({ survey, station  }: { survey: Survey, station: number | null }) => {
    const points = toPoints(survey.shots);
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const margin = 2;
    const box = {
        min: new Point(Math.min(...xs)-margin, Math.min(...ys)-margin),
        max: new Point(Math.max(...xs)+margin, Math.max(...ys)+margin),
    };

    let at = points[0];

    return (
        <svg width="100%" height="250"
            viewBox={`${box.min.x} ${box.min.y} ${box.max.x - box.min.x} ${box.max.y - box.min.y}`}>
            {
                points.slice(1).map((p, i) => {
                    const lfrm = new Point(at.x, at.y);
                    const lto = new Point(p.x, p.y);
                    //const stroke = i % 2 === 0 ? "white" : "white";
                    at = lto;
                    return (
                        <>
                            <line
                                className="minimap-line"
                                x1={lfrm.x}
                                x2={lto.x}
                                y1={lfrm.y}
                                y2={lto.y}
                                key={i}
                                strokeWidth="1%">
                                <title>{`${i}: ${lfrm.x},${lfrm.y} -> ${lto.x},${lto.y}`}</title>
                            </line>
                            <circle
                                className={station === i ? "minimap-station-selected" : "minimap-station"}
                                cx={lfrm.x}
                                cy={lfrm.y}
                                key={i}
                                r="1">
                                <animateTransform attributeName="transform" type="scale" additive="sum" from="0 0" to="1 1" begin="0s" dur="0.5s" repeatCount="1"></animateTransform>
                            </circle>
                        </>
                    )
                }
                )}
        </svg>
    )
}


