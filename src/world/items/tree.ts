import {
	add,
	scale,
	substract,
	lerp2D,
	getRandomColor,
	lerp,
	translate,
} from "../math/utils";
import { Point } from "../primitives/point";
import { Polygon } from "../primitives/polygon";
import { Segment } from "../primitives/segment";

export class Tree {
	public center: Point;
	public size: number;
	public heightCoef: number;
	public base: Polygon;

	constructor(center: Point, size: number, heighCoef = 0.3) {
		this.center = center;
		this.size = size;
		this.heightCoef = heighCoef;
		this.base = this.#generateLevel(center, this.size);
	}

	#generateLevel(point: Point, size: number): Polygon {
		const points = [];
		const rad = size / 2;
		for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
			const kindOfRandom = Math.cos(((a + this.center.x) * size) % 17) ** 2;
			const noisyRadius = rad * lerp(0.5, 1, kindOfRandom);
			points.push(translate(point, a, noisyRadius));
		}

		return new Polygon(points);
	}

	draw(ctx: CanvasRenderingContext2D, viewPoint: Point) {
		if (!this.center) return;

		const diff = substract(this.center, viewPoint);
		const top = add(this.center, scale(diff, this.heightCoef));

		const levelCount = 7;
		for (let level = 0; level < levelCount; level++) {
			const t = level / (levelCount - 1);
			const point = lerp2D(this.center, top, t);
			const color = `rgb(30,${lerp(50, 200, t)},70)`;
			const size = lerp(this.size, 40, t);
			const poly = this.#generateLevel(point, size);
			poly.draw(ctx, { fillStyle: color, stroke: "rgba(0,0,0,0)" });
		}

		// this.base.draw(ctx);
	}
}
