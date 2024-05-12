import { add, perpendicular, scale } from "../math/utils";
import { Point } from "../primitives/point";
import { Segment } from "../primitives/segment";
import { Marking } from "./marking";

export class Cross extends Marking {
	borders: Segment[];

	constructor(
		center: Point,
		directionVector: Point,
		width: number,
		height: number,
	) {
		super(center, directionVector, width, height, "cross");
		this.borders = [this.poly.segments[0], this.poly.segments[2]];
	}

	draw(ctx: CanvasRenderingContext2D) {
		const perp = perpendicular(this.directionVector);

		const line = new Segment(
			add(this.center, scale(perp, this.width / 2)),
			add(this.center, scale(perp, -this.width / 2)),
		);

		line.draw(ctx, {
			width: this.height,
			color: "white",
			dash: [11, 11],
		});
	}
}
