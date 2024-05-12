import { Point } from "../primitives/point";
import { Viewport } from "../viewport";
import { World } from "../world";
import { MarkingEditor } from "./marking-editor";
import { Marking } from "../markings/marking";
import { Start } from "../markings/start";

export class StartEditor extends MarkingEditor {
	constructor(viewport: Viewport, world: World) {
		super(viewport, world, world.laneGuides);
	}

	createMarking(center: Point, directionVector: Point): Marking {
		return new Start(
			center,
			directionVector,
			this.world.roadWidth / 2,
			this.world.roadWidth / 2,
		);
	}
}
