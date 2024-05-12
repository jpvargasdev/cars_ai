import { Polygon } from "./polygon";
import { Point } from "./point";
import { Segment } from "./segment";

import { angle, substract, translate } from "../math/utils";

export class Envelope {
	skeleton: Segment | undefined;
	poly: Polygon | undefined;

	constructor(skeleton?: Segment, width?: number, roundness = 1) {
		if (skeleton && width) {
			if (roundness === 0) {
				roundness = 1;
			}
			this.skeleton = skeleton;
			this.poly = this.generatePolygon(width, roundness);
		}
	}

	static load(info: Envelope): Envelope {
		const env = new Envelope();
		if (info.skeleton) {
			env.skeleton = new Segment(info.skeleton.p1, info.skeleton.p2);
			env.poly = Polygon.load(info.poly!);
		}
		return env;
	}

	private generatePolygon(width: number, roundness = 1): Polygon | undefined {
		if (!this.skeleton) return undefined;

		const { p1, p2 } = this.skeleton;
		const radius = width / 2;
		const alpha = angle(substract(p1, p2));

		const alpha_cw = alpha + Math.PI / 2;
		const alpha_ccw = alpha - Math.PI / 2;

		const points: Point[] = [];

		const step = Math.PI / roundness;
		const epsilon = step / 2;

		for (let i = alpha_ccw; i <= alpha_cw + epsilon; i += step) {
			points.push(translate(p1, i, radius));
		}
		for (let i = alpha_ccw; i <= alpha_cw + epsilon; i += step) {
			points.push(translate(p2, Math.PI + i, radius));
		}

		return new Polygon(points);
	}

	draw(ctx: CanvasRenderingContext2D, options: DrawOptions): void {
		this.poly!.draw(ctx, options);
	}
}
