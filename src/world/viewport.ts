import { Point } from "./primitives/point";
import { scale, add, substract } from "./math/utils";

export class Viewport {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D | null;
	zoom: number;
	center: Point;
	offset: Point;
	drag: {
		start: Point;
		end: Point;
		offset: Point;
		active: boolean;
	};
	isCommandKeyPressed: boolean;

	constructor(canvas: HTMLCanvasElement, zoom = 3, offset?: Point) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.zoom = zoom;

		this.center = new Point(canvas.width / 2, canvas.height / 2);
		if (offset) {
			this.offset = offset;
		} else {
			this.offset = scale(this.center, -1);
		}

		this.drag = {
			start: new Point(0, 0),
			end: new Point(0, 0),
			offset: new Point(0, 0),
			active: false,
		};

		this.isCommandKeyPressed = false;

		this.addEventListeners();
	}

	private onMouseWheel(e: WheelEvent): void {
		const dir = Math.sign(e.deltaY);
		const step = 0.1;
		this.zoom += dir * step;
		this.zoom = Math.max(1, Math.min(5, this.zoom));
	}

	private onMouseDown(e: MouseEvent): void {
		if (e.button === 2 && this.isCommandKeyPressed) {
			// right button + cmd
			this.drag.active = true;
			this.drag.start = this.getMouse(e);
		}
		if (e.button === 1) {
			// middle button
			this.drag.active = true;
			this.drag.start = this.getMouse(e);
		}
	}

	private onKeyDown(e: KeyboardEvent): void {
		if (e.key === "Meta") {
			this.isCommandKeyPressed = true;
		}
	}

	private onKeyUp(e: KeyboardEvent): void {
		if (e.key === "Meta") {
			this.isCommandKeyPressed = false;
		}
	}

	private onMouseMove(e: MouseEvent): void {
		if (this.drag.active) {
			this.drag.end = this.getMouse(e);
			this.drag.offset = substract(this.drag.end, this.drag.start);
		}
	}

	private onMouseUp(e: MouseEvent): void {
		if (this.drag.active) {
			this.offset = add(this.offset, this.drag.offset);
			this.drag = {
				start: new Point(0, 0),
				end: new Point(0, 0),
				offset: new Point(0, 0),
				active: false,
			};
		}
	}

	getMouse(evt: MouseEvent, substractDragOffset = false): Point {
		const p = new Point(
			(evt.offsetX - this.center.x) * this.zoom - this.offset.x,
			(evt.offsetY - this.center.y) * this.zoom - this.offset.y,
		);
		return substractDragOffset ? substract(p, this.drag.offset) : p;
	}

	getOffset(): Point {
		return add(this.offset, this.drag.offset);
	}

	reset(): void {
		if (!this.ctx) return;
		this.ctx.restore();
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.save();
		this.ctx.translate(this.center.x, this.center.y);
		this.ctx.scale(1 / this.zoom, 1 / this.zoom);
		const offset = this.getOffset();
		this.ctx.translate(offset.x, offset.y);
	}

	private addEventListeners(): void {
		this.canvas.addEventListener("wheel", (e: WheelEvent) =>
			this.onMouseWheel(e),
		);
		this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
		this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
		this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
		window.addEventListener("keydown", this.onKeyDown.bind(this));
		window.addEventListener("keyup", this.onKeyUp.bind(this));
	}
}
