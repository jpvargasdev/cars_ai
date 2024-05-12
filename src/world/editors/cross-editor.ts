import { Point } from "../primitives/point";
import { Viewport } from "../viewport";
import { World } from "../world";
import { Cross } from "../markings/cross";
import { MarkingEditor } from "./marking-editor";
import { Marking } from "../markings/marking";

export class CrossEditor extends MarkingEditor {
	constructor(viewport: Viewport, world: World) {
		super(viewport, world, world.graph.segments);
	}

	createMarking(center: Point, directionVector: Point): Marking {
		return new Cross(
			center,
			directionVector,
			this.world.roadWidth,
			this.world.roadWidth / 2,
		);
	}
}
