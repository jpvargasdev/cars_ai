import { Graph } from "../math/graph";
import { Point } from "../primitives/point";
import { Viewport } from "../viewport";
import { Segment } from "../primitives/segment";
import { getNearestPoint } from "../math/utils";

export class GraphEditor {
	viewport: Viewport;
	canvas: HTMLCanvasElement;
	graph: Graph;
	ctx: CanvasRenderingContext2D | null;
	selected: Point | null;
	hovered: Point | null;
	mouse: Point | null;
	dragging: boolean;

	constructor(viewport: Viewport, graph: Graph) {
		this.viewport = viewport;
		this.canvas = viewport.canvas;
		this.graph = graph;
		this.ctx = this.canvas.getContext("2d");

		this.selected = null;
		this.hovered = null;
		this.mouse = null;
		this.dragging = false;
	}

	enable() {
		this.addEventListeners();
	}

	disable() {
		this.removeEventListeners();
	}

	private handleMouseMove = (e: MouseEvent) => {
		this.mouse = this.viewport.getMouse(e, true);
		this.hovered = getNearestPoint(
			this.mouse,
			this.graph.points,
			10 * this.viewport.zoom,
		);

		if (this.dragging && this.selected) {
			this.selected.x = this.mouse.x;
			this.selected.y = this.mouse.y;
		}
	};

	private handleMouseDown = (e: MouseEvent) => {
		if (!this.mouse) return;

		if (e.button === 2) {
			if (this.selected) {
				this.selected = null;
			} else if (this.hovered) {
				this.removePoint(this.hovered);
			}
		}
		if (e.button === 0) {
			if (this.hovered) {
				this.select(this.hovered);
				this.dragging = true;
				return;
			}
			this.graph.addPoint(this.mouse);
			this.select(this.mouse);
			this.hovered = this.mouse;
		}
	};

	private select(point: Point): void {
		if (this.selected) {
			this.graph.tryAddSegment(new Segment(this.selected, point));
		}
		this.selected = point;
	}

	private removePoint(point: Point): void {
		this.graph.removePoint(point);
		this.hovered = null;

		if (this.selected === point) {
			this.selected = null;
		}
	}

	private addEventListeners(): void {
		this.canvas.addEventListener("mousedown", this.handleMouseDown);

		this.canvas.addEventListener("mouseup", () => {
			this.dragging = false;
		});

		this.canvas.addEventListener("mousemove", this.handleMouseMove);

		this.canvas.addEventListener("contextmenu", (e) => {
			e.preventDefault();
		});
	}

	private removeEventListeners(): void {
		this.canvas.removeEventListener("mousedown", this.handleMouseDown);

		this.canvas.removeEventListener("mouseup", () => {
			this.dragging = false;
		});

		this.canvas.removeEventListener("mousemove", this.handleMouseMove);

		this.canvas.removeEventListener("contextmenu", (e) => {
			e.preventDefault();
		});
	}

	dispose(): void {
		this.graph.dispose();
		this.selected = null;
		this.hovered = null;
	}

	display(): void {
		if (!this.ctx) return;

		this.graph.draw(this.ctx);
		if (this.hovered) {
			this.hovered.draw(this.ctx, { fill: true });
		}
		if (this.selected) {
			const intent = this.hovered ? this.hovered : this.mouse;

			if (!intent) return;

			new Segment(this.selected, intent).draw(this.ctx, { dash: [3, 3] });
			this.selected.draw(this.ctx, { outline: true });
		}
	}
}
