export class Point {
	constructor(
		public x: number,
		public y: number,
		public id: number | undefined = undefined,
	) {}

	equals(point: Point): boolean {
		return this.x === point.x && this.y === point.y;
	}

	draw(
		ctx: CanvasRenderingContext2D,
		{
			size = 18,
			color = "black",
			outline = false,
			fill = false,
		}: DrawOptions = {},
	): void {
		const rad = size / 2;
		ctx.beginPath();
		ctx.arc(this.x, this.y, rad, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.fill();
		if (outline) {
			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.strokeStyle = "yellow";
			ctx.arc(this.x, this.y, rad * 0.6, 0, Math.PI * 2);
			ctx.stroke();
		}
		if (fill) {
			ctx.beginPath();
			ctx.fillStyle = "yellow";
			ctx.arc(this.x, this.y, rad * 0.4, 0, Math.PI * 2);
			ctx.fill();
		}
	}
}
