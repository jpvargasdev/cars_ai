import { Point } from "../primitives/point";
import { Cross } from "./cross";
import { Light } from "./light";
import { Marking } from "./marking";
import { Parking } from "./parking";
import { Start } from "./start";
import { Stop } from "./stop";
import { Target } from "./target";
import { Yield } from "./yield";

export const getMarking = (info: Marking) => {
	const point = new Point(info.center.x, info.center.y);
	const direction = new Point(info.directionVector.x, info.directionVector.y);
	const width = info.width;
	const height = info.height;

	switch (info.type) {
		case "cross":
			return new Cross(point, direction, width, height);
		case "parking":
			return new Parking(point, direction, width, height);
		case "start":
			return new Start(point, direction, width, height);
		case "stop":
			return new Stop(point, direction, width, height);
		case "yield":
			return new Yield(point, direction, width, height);
		case "target":
			return new Target(point, direction, width, height);
		case "light":
			return new Light(point, direction, width, height);
		default:
			return new Cross(point, direction, width, height);
	}
};
