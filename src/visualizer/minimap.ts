import { Graph } from "../world/math/graph";
import { scale } from "../world/math/utils";
import { Point } from "../world/primitives/point";

export class MiniMap {
	canvas: HTMLCanvasElement;
	graph: Graph;
	size: number;
	ctx: CanvasRenderingContext2D | null;

	constructor(canvas: HTMLCanvasElement, graph: Graph, size: number = 300) {
		this.canvas = canvas;
		this.graph = graph;
		this.size = size;

		canvas.width = size;
		canvas.height = size;

		this.ctx = canvas.getContext("2d");
	}

	update(viewPoint: Point) {
		if (!this.ctx) return;
		this.ctx.clearRect(0, 0, this.size, this.size);
		const scaler = 0.05;
		const scaledViewPoint = scale(viewPoint, -scaler);

		this.ctx.save();
		this.ctx.translate(
			scaledViewPoint.x + this.size / 2,
			scaledViewPoint.y + this.size / 2,
		);
		this.ctx.scale(scaler, scaler);

		for (const seg of this.graph.segments) {
			seg.draw(this.ctx, { width: 3 / scaler, color: "white" });
		}
		this.ctx.restore();

		new Point(this.size / 2, this.size / 2).draw(this.ctx, {
			color: "blue",
			outline: true,
			fill: false,
		});
	}
}
