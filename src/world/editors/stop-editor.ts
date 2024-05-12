import { Point } from "../primitives/point";
import { Viewport } from "../viewport";
import { World } from "../world";
import { Stop } from "../markings/stop";
import { MarkingEditor } from "./marking-editor";
import { Marking } from "../markings/marking";

export class StopEditor extends MarkingEditor {
	constructor(viewport: Viewport, world: World) {
		super(viewport, world, world.laneGuides);
	}

	createMarking(center: Point, directionVector: Point): Marking {
		return new Stop(
			center,
			directionVector,
			this.world.roadWidth / 2,
			this.world.roadWidth / 2,
		);
	}
}
