import { angle, translate } from "../math/utils";
import { Envelope } from "../primitives/envelope";
import { Point } from "../primitives/point";
import { Polygon } from "../primitives/polygon";
import { Segment } from "../primitives/segment";

export class Marking {
	type: "start" | "stop" | "cross" | "parking" | "yield" | "target" | "light";
	center: Point;
	directionVector: Point;
	width: number;
	height: number;
	support: Segment;
	poly: Polygon;

	constructor(
		center: Point,
		directionVector: Point,
		width: number,
		height: number,
		type: "start" | "stop" | "cross" | "parking" | "yield" | "target" | "light",
	) {
		this.type = type;
		this.center = center;
		this.directionVector = directionVector;
		this.width = width;
		this.height = height;

		this.support = new Segment(
			translate(center, angle(directionVector), height / 2),
			translate(center, angle(directionVector), -height / 2),
		);

		this.poly = new Envelope(this.support, width).poly!;
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.poly.draw(ctx);
	}
}
