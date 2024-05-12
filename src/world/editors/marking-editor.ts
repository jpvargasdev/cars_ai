import { getNearestSegment } from "../math/utils";
import { Point } from "../primitives/point";
import { Viewport } from "../viewport";
import { World } from "../world";
import { Segment } from "../primitives/segment";
import { Marking } from "../markings/marking";

export class MarkingEditor {
	viewport: Viewport;
	world: World;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D | null;
	mouse: Point | null;
	intent: Marking | null;
	markings: Marking[];
	targetSegments: Segment[];

	constructor(viewport: Viewport, world: World, targetSegments: Segment[]) {
		this.viewport = viewport;
		this.world = world;

		this.canvas = viewport.canvas;
		this.ctx = this.canvas.getContext("2d");

		this.targetSegments = targetSegments;

		this.mouse = null;
		this.intent = null;
		this.markings = world.markings;
	}

	// to be overwritten
	createMarking(center: Point, directionVector: Point): Marking | null {
		return null;
	}

	enable() {
		this.addEventListeners();
	}

	disable() {
		this.removeEventListeners();
	}

	private handleMouseMove = (e: MouseEvent) => {
		this.mouse = this.viewport.getMouse(e, true);
		const seg = getNearestSegment(
			this.mouse,
			this.targetSegments,
			10 * this.viewport.zoom,
		);

		if (seg) {
			const proj = seg.projectPoint(this.mouse);
			if (proj.offset >= 0 && proj.offset <= 1) {
				this.intent = this.createMarking(proj.point, seg.directionVector());
			} else {
				this.intent = null;
			}
		} else {
			this.intent = null;
		}
	};

	private addEventListeners(): void {
		this.canvas.addEventListener("mousedown", this.handleMouseDown);
		this.canvas.addEventListener("mousemove", this.handleMouseMove);
		this.canvas.addEventListener("contextmenu", (e) => {
			e.preventDefault();
		});
	}

	private removeEventListeners(): void {
		this.canvas.removeEventListener("mousedown", this.handleMouseDown);

		this.canvas.removeEventListener("mousemove", this.handleMouseMove);

		this.canvas.removeEventListener("contextmenu", (e) => {
			e.preventDefault();
		});
	}

	private handleMouseDown = (e: MouseEvent) => {
		if (e.button === 0) {
			// left click
			if (this.intent) {
				this.markings.push(this.intent);
				this.intent = null;
			}
		}

		if (e.button === 2) {
			// right click
			for (let i = 0; i < this.markings.length; i++) {
				const poly = this.markings[i].poly;
				if (this.mouse && poly.containsPoint(this.mouse)) {
					this.markings.splice(i, 1);
					return;
				}
			}
		}
	};

	display() {
		if (this.intent && this.ctx) {
			this.intent.draw(this.ctx);
		}
	}
}
