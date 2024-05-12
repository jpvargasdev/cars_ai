import { Point } from "./point";
import {
	distance,
	normalize,
	substract,
	add,
	scale,
	dot,
	magnitude,
} from "../math/utils";

export class Segment {
	p1: Point;
	p2: Point;

	constructor(p1: Point, p2: Point) {
		this.p1 = p1;
		this.p2 = p2;
	}

	length(): number {
		return distance(this.p1, this.p2);
	}

	directionVector(): Point {
		return normalize(substract(this.p2, this.p1));
	}

	equals(seg: Segment): boolean {
		return this.includes(seg.p1) && this.includes(seg.p2);
	}

	includes(point: Point): boolean {
		return this.p1.equals(point) || this.p2.equals(point);
	}

	distanceToPoint(point: Point): number {
		const proj = this.projectPoint(point);
		if (proj.offset > 0 && proj.offset < 1) {
			return distance(point, proj.point);
		}
		const distToP1 = distance(point, this.p1);
		const distToP2 = distance(point, this.p2);
		return Math.min(distToP1, distToP2);
	}

	projectPoint(point: Point): { point: Point; offset: number } {
		const a = substract(point, this.p1);
		const b = substract(this.p2, this.p1);
		const normB = normalize(b);
		const scaler = dot(a, normB);
		const proj = {
			point: add(this.p1, scale(normB, scaler)),
			offset: scaler / magnitude(b),
		};
		return proj;
	}

	draw(
		ctx: CanvasRenderingContext2D,
		{ width = 2, color = "black", dash = [], cap = "butt" }: DrawOptions = {},
	): void {
		ctx.beginPath();
		ctx.lineWidth = width;
		ctx.strokeStyle = color;
		ctx.lineCap = cap;
		ctx.setLineDash(dash);
		ctx.moveTo(this.p1.x, this.p1.y);
		ctx.lineTo(this.p2.x, this.p2.y);
		ctx.stroke();
		ctx.setLineDash([]);
	}
}
