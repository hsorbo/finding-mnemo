import { Shot, Survey } from "mnemo-dmp";

class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

function toPoint(degrees: number, length: number) {
    const x = length * Math.cos(Math.PI * degrees / 180.0)
    const y = length * Math.sin(Math.PI * degrees / 180.0)
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


export const MiniMap = ({ survey }: { survey: Survey }) => {
    const points = toPoints(survey.shots);
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const box = {
        min: new Point(Math.min(...xs), Math.min(...ys)),
        max: new Point(Math.max(...xs), Math.max(...ys)),
    };

    let at = points[0];

    return (
        <svg width="200" height="200"
            viewBox={`${box.min.x} ${box.min.y} ${box.max.x - box.min.y} ${box.max.y - box.min.y}`}>
            {
                points.slice(1).map((p, i) => {
                    const lfrm = new Point(at.x, at.y);
                    const lto = new Point(p.x, p.y);
                    const stroke = i % 2 === 0 ? "white" : "white";
                    at = lto;
                    return (
                        <line
                            x1={lfrm.x}
                            x2={lto.x}
                            y1={lfrm.y}
                            y2={lto.y}
                            key={i}
                            stroke={stroke}
                            onMouseOver={() => console.log("over")}
                            strokeWidth="1%" />)
                }
                )}
        </svg>

    )
}


