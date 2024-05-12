import { Point } from "../primitives/point";
import { Segment } from "../primitives/segment";

export class Graph {
	points: Point[];
	segments: Segment[];

	constructor(points: Point[] = [], segments: Segment[] = []) {
		this.points = points;
		this.segments = segments;
	}

	static load(info: any): Graph {
		const points = info.points.map((p: any) => new Point(p.x, p.y));
		const segments = info.segments.map((s: any) => {
			const p1 = points.find((p: Point) => p.equals(s.p1));
			const p2 = points.find((p: Point) => p.equals(s.p2));
			return new Segment(p1, p2);
		});

		return new Graph(points, segments);
	}

	hash(): string {
		return JSON.stringify(this);
	}

	addPoint(point: Point): void {
		this.points.push(point);
	}

	containsPoint(point: Point): Point | undefined {
		return this.points.find((p: Point) => p.equals(point));
	}

	removePoint(point: Point): void {
		const segments = this.getSegmentsWithPoint(point);
		for (const segment of segments) {
			this.removeSegment(segment);
		}
		const index = this.points.indexOf(point);
		if (index !== -1) {
			this.points.splice(index, 1);
		}
	}

	tryAddPoint(point: Point): boolean {
		if (!this.containsPoint(point)) {
			this.addPoint(point);
			return true;
		}
		return false;
	}

	addSegment(segment: Segment): void {
		this.segments.push(segment);
	}

	containsSegment(segment: Segment): Segment | undefined {
		return this.segments.find((s: Segment) => s.equals(segment));
	}

	tryAddSegment(segment: Segment): boolean {
		if (!this.containsSegment(segment) && !segment.p1.equals(segment.p2)) {
			this.addSegment(segment);
			return true;
		}
		return false;
	}

	removeSegment(segment: Segment): void {
		const index = this.segments.indexOf(segment);
		if (index !== -1) {
			this.segments.splice(index, 1);
		}
	}

	getSegmentsWithPoint(point: Point): Segment[] {
		return this.segments.filter((segment: Segment) => segment.includes(point));
	}

	dispose(): void {
		this.points.length = 0;
		this.segments.length = 0;
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.segments.forEach((segment: Segment) => {
			segment.draw(ctx);
		});
		this.points.forEach((point: Point) => {
			point.draw(ctx);
		});
	}
}
