import { add, lerp2D, perpendicular, scale } from "../math/utils";
import { Point } from "../primitives/point";
import { Segment } from "../primitives/segment";
import { Marking } from "./marking";

export class Light extends Marking {
	state: string;
	border: Segment;

	constructor(
		center: Point,
		directionVector: Point,
		width: number,
		height: number,
	) {
		super(center, directionVector, width, 18, "light");

		this.state = "off";
		this.border = this.poly.segments[0];
	}

	setState(state: string) {
		this.state = state;
	}

	draw(ctx: CanvasRenderingContext2D) {
		const perp = perpendicular(this.directionVector);
		const line = new Segment(
			add(this.center, scale(perp, this.width / 2)),
			add(this.center, scale(perp, -this.width / 2)),
		);

		const green = lerp2D(line.p1, line.p2, 0.2);
		const yellow = lerp2D(line.p1, line.p2, 0.5);
		const red = lerp2D(line.p1, line.p2, 0.8);

		new Segment(red, green).draw(ctx, {
			width: this.height,
			cap: "round",
		});

		green.draw(ctx, { size: this.height * 0.6, color: "#060" });
		yellow.draw(ctx, { size: this.height * 0.6, color: "#660" });
		red.draw(ctx, { size: this.height * 0.6, color: "#600" });

		switch (this.state) {
			case "green":
				green.draw(ctx, { size: this.height * 0.6, color: "#0F0" });
				break;
			case "yellow":
				yellow.draw(ctx, { size: this.height * 0.6, color: "#FF0" });
				break;
			case "red":
				red.draw(ctx, { size: this.height * 0.6, color: "#F00" });
				break;
		}
	}
}
